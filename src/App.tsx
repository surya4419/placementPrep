import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Compass, 
  Briefcase, 
  Code2, 
  TrendingUp, 
  User, 
  Calendar, 
  Flame, 
  HelpCircle, 
  X, 
  ChevronRight,
  BookOpen,
  Award,
  BookMarked,
  Info,
  Clock,
  LogOut,
  Sliders,
  History,
  GraduationCap,
  RefreshCw
} from 'lucide-react';

import { STARTER_QUESTIONS } from './data/questions';
import { ResponseAttempt, STARStory, UserStats, PracticeModule } from './types';
import { generateMockData } from './data/mockSeed';

// Modular views
import Dashboard from './components/Dashboard';
import CommunicationLab from './components/CommunicationLab';
import HrSimulator from './components/HrSimulator';
import TechnicalSimulator from './components/TechnicalSimulator';
import Auth from './components/Auth';
import Profile from './components/Profile';

export default function App() {
  const [user, setUser] = useState<{ id: string; name: string; email: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [showProfile, setShowProfile] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'communication' | 'hr' | 'technical'>('dashboard');
  const [attempts, setAttempts] = useState<ResponseAttempt[]>([]);
  const [starStories, setStarStories] = useState<STARStory[]>([]);
  const [selectedAttemptForReview, setSelectedAttemptForReview] = useState<ResponseAttempt | null>(null);

  // Check if user is logged in
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        await loadUserData();
      } else {
        localStorage.removeItem('token');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  // Load user data from database
  const loadUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const [attemptsRes, storiesRes] = await Promise.all([
        fetch('/api/user/attempts', {
          headers: { 'Authorization': `Bearer ${token}` },
          credentials: 'include'
        }),
        fetch('/api/user/stories', {
          headers: { 'Authorization': `Bearer ${token}` },
          credentials: 'include'
        })
      ]);

      if (attemptsRes.ok) {
        const { attempts: userAttempts } = await attemptsRes.json();
        setAttempts(userAttempts);
      }

      if (storiesRes.ok) {
        const { stories: userStories } = await storiesRes.json();
        setStarStories(userStories);
      }
    } catch (error) {
      console.error('Failed to load user data:', error);
    }
  };

  const handleLoginSuccess = (userData: any) => {
    setUser(userData);
    loadUserData();
  };

  const handleLogout = () => {
    setUser(null);
    setAttempts([]);
    setStarStories([]);
    setShowProfile(false);
    localStorage.removeItem('token');
  };

  // Streaks and statistics calculation
  const stats = React.useMemo<UserStats>(() => {
    const totalSessions = attempts.length;
    const evaluatedAttempts = attempts.filter(a => a.evaluation);
    const totalEvaluations = evaluatedAttempts.length;

    // Streak logic: simple check on consecutive dates
    let streak = 0;
    if (attempts.length > 0) {
      const dates = attempts.map(a => new Date(a.submittedAt).toDateString());
      const uniqueDates = Array.from(new Set(dates)).map((d) => new Date(d as string));
      uniqueDates.sort((a, b) => b.getTime() - a.getTime()); // desc

      const today = new Date();
      const yesterday = new Date();
      yesterday.setDate(today.getDate() - 1);

      // check if active today or yesterday to continue streak
      const hasActivityRecent = uniqueDates.some(d => d.toDateString() === today.toDateString() || d.toDateString() === yesterday.toDateString());
      
      if (hasActivityRecent) {
        streak = 1;
        for (let i = 0; i < uniqueDates.length - 1; i++) {
          const diffTime = Math.abs(uniqueDates[i].getTime() - uniqueDates[i+1].getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          if (diffDays === 1) {
            streak++;
          } else if (diffDays > 1) {
            break;
          }
        }
      }
    }

    return {
      streak,
      lastActive: attempts.length > 0 ? attempts[attempts.length - 1].submittedAt : null,
      totalSessions,
      totalEvaluations,
      rollingAverages: {} // Handled inline or as helper
    };
  }, [attempts]);

  const handleSaveAttempt = async (newAttempt: ResponseAttempt) => {
    const updated = [...attempts, newAttempt];
    setAttempts(updated);
    
    // Save to database
    try {
      const token = localStorage.getItem('token');
      await fetch('/api/user/attempts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
        body: JSON.stringify({ attempt: newAttempt })
      });
    } catch (error) {
      console.error('Failed to save attempt to database:', error);
    }
  };

  const handleSaveStarStory = async (newStory: STARStory) => {
    // Check if duplicate questionId, replace if so
    const existingIndex = starStories.findIndex(s => s.questionId === newStory.questionId);
    let updated: STARStory[];
    if (existingIndex > -1) {
      updated = [...starStories];
      updated[existingIndex] = newStory;
    } else {
      updated = [...starStories, newStory];
    }
    setStarStories(updated);
    
    // Save to database
    try {
      const token = localStorage.getItem('token');
      await fetch('/api/user/stories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
        body: JSON.stringify({ story: newStory })
      });
    } catch (error) {
      console.error('Failed to save story to database:', error);
    }
  };

  const handleResetToDemo = () => {
    const seed = generateMockData();
    setAttempts(seed.attempts);
    setStarStories(seed.starStories);
    setActiveTab('dashboard');
  };

  // Show loading spinner
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-600 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  // Show auth screen if not logged in
  if (!user) {
    return <Auth onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div id="app-root" className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Dynamic Navigation Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200/80 px-6 py-4 backdrop-blur-md bg-white/95">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo with clean styling */}
          <button 
            onClick={() => setActiveTab('dashboard')} 
            className="flex items-center space-x-2.5 text-left group"
          >
            <div className="p-2 bg-blue-600 rounded-xl text-white shadow-xs group-hover:bg-blue-700 transition">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <span className="font-display font-extrabold text-slate-800 text-base tracking-tight block">
                Placement Prep
              </span>
              <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider block">
                AI Interview Coach
              </span>
            </div>
          </button>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center space-x-1 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all duration-150 ${
                activeTab === 'dashboard' ? 'bg-white text-slate-800 shadow-2xs' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('communication')}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all duration-150 ${
                activeTab === 'communication' ? 'bg-white text-slate-800 shadow-2xs' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Communication Lab
            </button>
            <button
              onClick={() => setActiveTab('hr')}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all duration-150 ${
                activeTab === 'hr' ? 'bg-white text-slate-800 shadow-2xs' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              HR Simulator
            </button>
            <button
              onClick={() => setActiveTab('technical')}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all duration-150 ${
                activeTab === 'technical' ? 'bg-white text-slate-800 shadow-2xs' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Technical Simulator
            </button>
          </nav>

          {/* User Streak Pill */}
          <div className="flex items-center space-x-3">
            <button
              onClick={handleResetToDemo}
              className="flex items-center space-x-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200/80 px-3 py-1.5 rounded-full text-xs font-bold text-slate-700 transition"
              title="Resets evaluation metrics & timeline to illustrate 17 days of active progressive history"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Load 17-Day Demo</span>
            </button>
            <div className="flex items-center space-x-1.5 bg-amber-50 border border-amber-100 px-3 py-1.5 rounded-full shrink-0">
              <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span className="text-xs font-bold text-amber-700 font-display">{stats.streak} Days</span>
            </div>
            <button
              onClick={() => setShowProfile(true)}
              className="flex items-center space-x-2 bg-blue-50 hover:bg-blue-100 border border-blue-100 px-3 py-1.5 rounded-full transition"
            >
              <User className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-bold text-blue-700 hidden sm:inline">{user.name}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'dashboard' && (
              <Dashboard 
                attempts={attempts}
                starStories={starStories}
                stats={stats}
                onSelectAttempt={setSelectedAttemptForReview}
                onNavigateToModule={setActiveTab}
              />
            )}

            {activeTab === 'communication' && (
              <CommunicationLab 
                questions={STARTER_QUESTIONS}
                onSaveAttempt={handleSaveAttempt}
                onNavigateHome={() => setActiveTab('dashboard')}
              />
            )}

            {activeTab === 'hr' && (
              <HrSimulator 
                questions={STARTER_QUESTIONS}
                onSaveAttempt={handleSaveAttempt}
                onSaveStarStory={handleSaveStarStory}
                onNavigateHome={() => setActiveTab('dashboard')}
              />
            )}

            {activeTab === 'technical' && (
              <TechnicalSimulator 
                questions={STARTER_QUESTIONS}
                onSaveAttempt={handleSaveAttempt}
                onNavigateHome={() => setActiveTab('dashboard')}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-400 mt-12">
        <p>© 2026 Placement Prep Platform • Powered by Gemini AI Studio • All Rights Reserved</p>
      </footer>

      {/* Profile Modal */}
      <AnimatePresence>
        {showProfile && (
          <Profile 
            user={user} 
            onLogout={handleLogout} 
            onClose={() => setShowProfile(false)} 
          />
        )}
      </AnimatePresence>

      {/* Detailed Evaluation Review Modal */}
      <AnimatePresence>
        {selectedAttemptForReview && (
          <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-xs">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl w-full max-w-3xl overflow-hidden shadow-xl flex flex-col border border-slate-100 max-h-[85vh]"
            >
              {/* Modal Header */}
              <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider bg-white/20 px-2 py-0.5 rounded mr-2">
                    {selectedAttemptForReview.module} Attempt
                  </span>
                  <span className="text-xs text-slate-300">
                    {new Date(selectedAttemptForReview.submittedAt).toLocaleString()}
                  </span>
                </div>
                <button 
                  onClick={() => setSelectedAttemptForReview(null)}
                  className="text-slate-400 hover:text-white transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Scroll Content */}
              <div className="p-6 overflow-y-auto space-y-6">
                {/* Score */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="font-bold text-slate-800 text-base">Historical Score Overview</h3>
                    <p className="text-xs text-slate-400">Archived on client storage.</p>
                  </div>
                  <div className="text-2xl font-black text-blue-600 bg-blue-50 px-4 py-2 rounded-xl border border-blue-100">
                    {selectedAttemptForReview.evaluation?.overallScore}%
                  </div>
                </div>

                {/* User Answer / Code Block */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-700">Your Submitted Response</h4>
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 max-h-48 overflow-y-auto font-mono text-xs text-slate-600 whitespace-pre-wrap leading-relaxed">
                    {selectedAttemptForReview.module === 'technical' ? (
                      <div className="space-y-3">
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">CODE</span>
                          <pre className="p-2 bg-slate-100 rounded mt-1 overflow-x-auto">{selectedAttemptForReview.code}</pre>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">THINK-ALOUD</span>
                          <p className="mt-1">{selectedAttemptForReview.thinkAloudText}</p>
                        </div>
                      </div>
                    ) : (
                      selectedAttemptForReview.rawText
                    )}
                  </div>
                </div>

                {/* Rubric scores */}
                {selectedAttemptForReview.evaluation && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-700">AI Scoring Metrics</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedAttemptForReview.evaluation.dimensionScores.map((ds, idx) => (
                        <div key={idx} className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-700">{ds.name}</span>
                            <span className="text-xs font-bold text-blue-600">{ds.score}/5</span>
                          </div>
                          <p className="text-[11px] text-slate-500 leading-normal">{ds.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Strengths and Suggestions */}
                {selectedAttemptForReview.evaluation && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 space-y-2">
                      <span className="text-xs font-bold text-emerald-700 block">Feedback Highlights</span>
                      <ul className="space-y-1 text-slate-600 text-xs list-disc pl-4 leading-normal">
                        {selectedAttemptForReview.evaluation.strengths.map((s, i) => (
                          <li key={i}>{s}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 space-y-2">
                      <span className="text-xs font-bold text-amber-700 block">Actionable Upgrades</span>
                      <ul className="space-y-1 text-slate-600 text-xs list-disc pl-4 leading-normal">
                        {selectedAttemptForReview.evaluation.improvements.map((s, i) => (
                          <li key={i}>{s}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>

              {/* Close Button Footer */}
              <div className="bg-slate-50 border-t border-slate-100 p-4 flex justify-end">
                <button
                  onClick={() => setSelectedAttemptForReview(null)}
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition"
                >
                  Close Review
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
