import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  TrendingUp, 
  Award, 
  Calendar, 
  Flame, 
  CheckCircle2, 
  ArrowRight, 
  BookOpen, 
  ChevronRight,
  AlertTriangle,
  History
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar
} from 'recharts';
import { ResponseAttempt, STARStory, UserStats } from '../types';

interface DashboardProps {
  attempts: ResponseAttempt[];
  starStories: STARStory[];
  stats: UserStats;
  onSelectAttempt: (attempt: ResponseAttempt) => void;
  onNavigateToModule: (module: 'communication' | 'hr' | 'technical') => void;
}

export default function Dashboard({ 
  attempts, 
  starStories, 
  stats, 
  onSelectAttempt, 
  onNavigateToModule 
}: DashboardProps) {

  // Calculate Rolling Averages and Weakest Dimension
  const { weakestDimension, overallScore, modulePerformance } = useMemo(() => {
    const dimensions: { [name: string]: { sum: number; count: number } } = {};
    const modules: { [key: string]: { sum: number; count: number } } = {
      communication: { sum: 0, count: 0 },
      hr: { sum: 0, count: 0 },
      technical: { sum: 0, count: 0 }
    };
    
    let totalScore = 0;
    let evalCount = 0;

    attempts.forEach(att => {
      if (att.evaluation) {
        totalScore += att.evaluation.overallScore;
        evalCount++;

        // Track per module average
        modules[att.module].sum += att.evaluation.overallScore;
        modules[att.module].count++;

        // Track dimensions
        att.evaluation.dimensionScores.forEach(ds => {
          if (!dimensions[ds.name]) {
            dimensions[ds.name] = { sum: 0, count: 0 };
          }
          dimensions[ds.name].sum += ds.score;
          dimensions[ds.name].count++;
        });
      }
    });

    let weakest: { name: string; avg: number } | null = null;
    Object.entries(dimensions).forEach(([name, data]) => {
      const avg = data.sum / data.count;
      if (!weakest || avg < weakest.avg) {
        weakest = { name, avg };
      }
    });

    return {
      weakestDimension: weakest ? (weakest as { name: string; avg: number }) : null,
      overallScore: evalCount > 0 ? Math.round(totalScore / evalCount) : 0,
      modulePerformance: {
        communication: modules.communication.count > 0 ? Math.round(modules.communication.sum / modules.communication.count) : 0,
        hr: modules.hr.count > 0 ? Math.round(modules.hr.sum / modules.hr.count) : 0,
        technical: modules.technical.count > 0 ? Math.round(modules.technical.sum / modules.technical.count) : 0,
      }
    };
  }, [attempts]);

  // Format chart data (chronological timeline of past attempts)
  const chartData = useMemo(() => {
    return attempts
      .filter(att => att.evaluation)
      .slice(-8) // last 8 sessions
      .map((att, index) => ({
        index: index + 1,
        date: new Date(att.submittedAt).toLocaleDateString([], { month: 'short', day: 'numeric' }),
        score: att.evaluation?.overallScore || 0,
        module: att.module === 'communication' ? 'Comm' : att.module === 'hr' ? 'HR' : 'Tech',
      }));
  }, [attempts]);

  // Format radar data for dimensions across all sessions
  const radarData = useMemo(() => {
    const dims: { [key: string]: { sum: number; count: number } } = {};
    attempts.forEach(att => {
      if (att.evaluation) {
        att.evaluation.dimensionScores.forEach(ds => {
          // Normalize names for simpler rendering
          let key = ds.name;
          if (key.length > 18) key = key.slice(0, 16) + '...';
          if (!dims[key]) dims[key] = { sum: 0, count: 0 };
          dims[key].sum += ds.score;
          dims[key].count++;
        });
      }
    });

    return Object.entries(dims).map(([name, data]) => ({
      subject: name,
      score: Number((data.sum / data.count).toFixed(1)),
      fullMark: 5,
    })).slice(0, 6); // Top 6 dimensions to keep clean
  }, [attempts]);

  return (
    <div id="dashboard-root" className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 md:p-8 shadow-sm border border-slate-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-radial from-slate-800/50 to-slate-950/20 pointer-events-none" />
        <div className="relative z-10 max-w-2xl space-y-3">
          <span className="bg-blue-500/20 text-blue-300 text-xs font-semibold px-3 py-1 rounded-full border border-blue-500/30">
            Prep Status: Active
          </span>
          <h1 className="text-3xl md:text-4xl font-display font-bold tracking-tight">
            Prepare to Ace Your Upcoming Interviews
          </h1>
          <p className="text-slate-300 text-sm md:text-base leading-relaxed">
            Practice storytelling, structural STAR frameworks, and thinking out loud during code execution. Our AI grading agent evaluates each of your responses against industry rubrics.
          </p>
        </div>
      </div>

      {/* High Level Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Streak */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex items-center space-x-4">
          <div className="p-3 bg-amber-50 rounded-lg text-amber-500">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold font-display text-slate-800">{stats.streak} Days</div>
            <div className="text-xs text-slate-500 font-medium">Daily Streak</div>
          </div>
        </div>

        {/* Overall Score */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex items-center space-x-4">
          <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold font-display text-slate-800">{overallScore ? `${overallScore}%` : 'N/A'}</div>
            <div className="text-xs text-slate-500 font-medium">Average Evaluation</div>
          </div>
        </div>

        {/* Total Sessions */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex items-center space-x-4">
          <div className="p-3 bg-emerald-50 rounded-lg text-emerald-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold font-display text-slate-800">{attempts.length}</div>
            <div className="text-xs text-slate-500 font-medium">Completed Exercises</div>
          </div>
        </div>

        {/* Total STAR Stories */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex items-center space-x-4">
          <div className="p-3 bg-indigo-50 rounded-lg text-indigo-600">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold font-display text-slate-800">{starStories.length}</div>
            <div className="text-xs text-slate-500 font-medium">STAR Stories Saved</div>
          </div>
        </div>
      </div>

      {/* Proactive Focus & Action Callout */}
      {weakestDimension && (
        <div className="bg-amber-50 border border-amber-200/60 rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-amber-100 rounded-lg text-amber-600 mt-0.5">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-amber-800 text-sm md:text-base">Focus Recommendation For This Week</h3>
              <p className="text-amber-700 text-xs md:text-sm mt-0.5">
                Your lowest score rolling average is in <span className="font-bold">"{weakestDimension.name}"</span> (Average: {Number(weakestDimension.avg.toFixed(1))}/5.0). Practice communication or HR scenarios to focus on this dimension.
              </p>
            </div>
          </div>
          <button 
            onClick={() => onNavigateToModule('hr')}
            className="shrink-0 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition flex items-center space-x-1"
          >
            <span>Practice HR</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Modules Selector Grid */}
      <div className="space-y-4">
        <h2 className="text-xl font-display font-bold text-slate-800">Practice Modules</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Comm Lab */}
          <motion.div 
            whileHover={{ y: -3 }}
            className="bg-white border border-slate-200 hover:border-blue-300 rounded-2xl p-6 shadow-xs flex flex-col justify-between space-y-6 transition group"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-wider bg-blue-100 text-blue-700 font-bold px-2 py-1 rounded">
                  Communication
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  Avg: {modulePerformance.communication ? `${modulePerformance.communication}%` : 'N/A'}
                </span>
              </div>
              <h3 className="text-lg font-bold font-display text-slate-800 group-hover:text-blue-600 transition">Communication Lab</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Practice speech fluency, clarify extempore prompts, explain tech simply, and remove filler word density. Supports Web Speech API dictation.
              </p>
            </div>
            <button 
              onClick={() => onNavigateToModule('communication')}
              className="w-full py-2.5 bg-slate-50 hover:bg-blue-600 hover:text-white rounded-xl text-slate-700 text-xs font-semibold transition flex items-center justify-center space-x-2"
            >
              <span>Launch Lab</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </motion.div>

          {/* HR Simulator */}
          <motion.div 
            whileHover={{ y: -3 }}
            className="bg-white border border-slate-200 hover:border-emerald-300 rounded-2xl p-6 shadow-xs flex flex-col justify-between space-y-6 transition group"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-wider bg-emerald-100 text-emerald-700 font-bold px-2 py-1 rounded">
                  Behavioral
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  Avg: {modulePerformance.hr ? `${modulePerformance.hr}%` : 'N/A'}
                </span>
              </div>
              <h3 className="text-lg font-bold font-display text-slate-800 group-hover:text-emerald-600 transition">HR Interview Simulator</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Respond to behavioral prompts and receive deep evaluations on the STAR framework. Simulated interviewer generates deep follow-up questions.
              </p>
            </div>
            <button 
              onClick={() => onNavigateToModule('hr')}
              className="w-full py-2.5 bg-slate-50 hover:bg-emerald-600 hover:text-white rounded-xl text-slate-700 text-xs font-semibold transition flex items-center justify-center space-x-2"
            >
              <span>Start Simulation</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </motion.div>

          {/* Tech Simulator */}
          <motion.div 
            whileHover={{ y: -3 }}
            className="bg-white border border-slate-200 hover:border-indigo-300 rounded-2xl p-6 shadow-xs flex flex-col justify-between space-y-6 transition group"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-wider bg-indigo-100 text-indigo-700 font-bold px-2 py-1 rounded">
                  Coding / DSA
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  Avg: {modulePerformance.technical ? `${modulePerformance.technical}%` : 'N/A'}
                </span>
              </div>
              <h3 className="text-lg font-bold font-display text-slate-800 group-hover:text-indigo-600 transition">Technical DSA Simulator</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Code real DSA solutions while describing your thought process. Grading treats approach formulation and verbal walk-through as heavily as logic.
              </p>
            </div>
            <button 
              onClick={() => onNavigateToModule('technical')}
              className="w-full py-2.5 bg-slate-50 hover:bg-indigo-600 hover:text-white rounded-xl text-slate-700 text-xs font-semibold transition flex items-center justify-center space-x-2"
            >
              <span>Code and Speak</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </motion.div>
        </div>
      </div>

      {/* Analytics & Charts */}
      {attempts.some(att => att.evaluation) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Performance Timeline */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <h3 className="font-display font-bold text-slate-800 text-lg flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              <span>Overall Score Progress</span>
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} />
                  <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 11 }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff' }}
                    labelStyle={{ fontWeight: 'bold' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="score" 
                    stroke="#2563eb" 
                    strokeWidth={3} 
                    dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} 
                    activeDot={{ r: 6 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Dimension Radar */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <h3 className="font-display font-bold text-slate-800 text-lg flex items-center space-x-2">
              <Award className="w-5 h-5 text-emerald-500" />
              <span>Rubric Strength Map</span>
            </h3>
            {radarData.length > 0 ? (
              <div className="h-64 flex justify-center items-center">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#475569', fontSize: 10, fontWeight: 500 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 5]} tick={{ fill: '#94a3b8' }} />
                    <Radar 
                      name="Averages" 
                      dataKey="score" 
                      stroke="#059669" 
                      fill="#10b981" 
                      fillOpacity={0.2} 
                    />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff' }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-xs text-slate-400">
                Complete more evaluations to populate the radar map.
              </div>
            )}
          </div>
        </div>
      )}

      {/* History and Star Stories Block */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Story Bank */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <h3 className="font-display font-bold text-slate-800 text-lg flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-indigo-500" />
            <span>STAR Story Bank</span>
          </h3>
          {starStories.length > 0 ? (
            <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto pr-1">
              {starStories.map((story) => (
                <div key={story.id} className="py-3 first:pt-0 last:pb-0 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                      {story.competency}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(story.lastUpdated).toLocaleDateString()}
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold text-slate-700 line-clamp-1">{story.questionText}</h4>
                  <p className="text-xs text-slate-500 line-clamp-2 italic">
                    "Result: {story.result}"
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-48 flex flex-col items-center justify-center text-slate-400 space-y-2 text-center p-4 border border-dashed border-slate-200 rounded-xl">
              <BookOpen className="w-8 h-8 text-slate-300" />
              <p className="text-xs font-medium">Your STAR Story Bank is empty.</p>
              <p className="text-[10px] max-w-xs text-slate-400">
                Stories are automatically created and updated when you complete HR simulator behavioral sessions with Situation, Task, Action, and Result segments!
              </p>
            </div>
          )}
        </div>

        {/* History */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <h3 className="font-display font-bold text-slate-800 text-lg flex items-center space-x-2">
            <History className="w-5 h-5 text-slate-500" />
            <span>Evaluation History</span>
          </h3>
          {attempts.filter(att => att.evaluation).length > 0 ? (
            <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto pr-1">
              {attempts
                .filter(att => att.evaluation)
                .reverse()
                .map((att) => (
                  <button
                    key={att.id}
                    onClick={() => onSelectAttempt(att)}
                    className="w-full text-left py-3 first:pt-0 last:pb-0 flex items-center justify-between hover:bg-slate-50 rounded-lg p-2 transition group"
                  >
                    <div className="space-y-1 pr-4">
                      <div className="flex items-center space-x-2">
                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                          att.module === 'communication' ? 'bg-blue-100 text-blue-800' :
                          att.module === 'hr' ? 'bg-emerald-100 text-emerald-800' :
                          'bg-indigo-100 text-indigo-800'
                        }`}>
                          {att.module === 'communication' ? 'Comm' : att.module === 'hr' ? 'HR' : 'Tech'}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(att.submittedAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-xs font-medium text-slate-700 group-hover:text-blue-600 transition line-clamp-1">
                        Attempt {att.id.slice(-4)}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2 shrink-0">
                      <span className="text-sm font-bold text-slate-800">{att.evaluation?.overallScore}%</span>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition" />
                    </div>
                  </button>
                ))}
            </div>
          ) : (
            <div className="h-48 flex flex-col items-center justify-center text-slate-400 space-y-2 text-center p-4 border border-dashed border-slate-200 rounded-xl">
              <History className="w-8 h-8 text-slate-300" />
              <p className="text-xs font-medium">No evaluations yet.</p>
              <p className="text-[10px] max-w-xs text-slate-400">
                Complete a practice exercise in any module to trigger the AI evaluator and view detailed scores!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
