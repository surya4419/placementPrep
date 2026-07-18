import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, Mic, Square, Sparkles, Check, AlertCircle, Briefcase, Info, RefreshCw } from 'lucide-react';
import { Question, ResponseAttempt, Evaluation, STARStory } from '../types';
import { useAudioRecorder } from '../hooks/useAudioRecorder';

interface HrSimulatorProps {
  questions: Question[];
  onSaveAttempt: (attempt: ResponseAttempt) => void;
  onSaveStarStory: (story: STARStory) => void;
  onNavigateHome: () => void;
}

export default function HrSimulator({ questions, onSaveAttempt, onSaveStarStory, onNavigateHome }: HrSimulatorProps) {
  const hrQuestions = questions.filter(q => q.module === 'hr');
  const [selectedQuestion, setSelectedQuestion] = useState<Question>(hrQuestions[0]);
  const [useStarHelper, setUseStarHelper] = useState(false);
  const [responseText, setResponseText] = useState('');
  const [situation, setSituation] = useState('');
  const [task, setTask] = useState('');
  const [action, setAction] = useState('');
  const [result, setResult] = useState('');
  const [reflection, setReflection] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [followUpAnswer, setFollowUpAnswer] = useState('');
  const [followUpEvaluating, setFollowUpEvaluating] = useState(false);
  const [finalEvaluation, setFinalEvaluation] = useState<Evaluation | null>(null);
  const [followUpSubmitted, setFollowUpSubmitted] = useState(false);
  const activeFieldRef = useRef<string | null>(null);

  const { isRecording, isTranscribing, startRecording, stopRecording } = useAudioRecorder({
    onTranscript: (text) => {
      const f = activeFieldRef.current;
      if (f === 'freeform') setResponseText(p => p ? p + ' ' + text : text);
      else if (f === 'situation') setSituation(p => p ? p + ' ' + text : text);
      else if (f === 'task') setTask(p => p ? p + ' ' + text : text);
      else if (f === 'action') setAction(p => p ? p + ' ' + text : text);
      else if (f === 'result') setResult(p => p ? p + ' ' + text : text);
      else if (f === 'reflection') setReflection(p => p ? p + ' ' + text : text);
      else if (f === 'followup') setFollowUpAnswer(p => p ? p + ' ' + text : text);
      activeFieldRef.current = null;
    },
    onError: (msg) => { setApiError(msg); activeFieldRef.current = null; },
  });

  const recordField = (field: string) => {
    if (isRecording) { stopRecording(); return; }
    activeFieldRef.current = field;
    startRecording();
  };

  const getCombined = () => useStarHelper
    ? `SITUATION: ${situation}\n\nTASK: ${task}\n\nACTION: ${action}\n\nRESULT: ${result}\n\nREFLECTION: ${reflection}`
    : responseText;

  const handleEvaluate = async () => {
    const combined = getCombined();
    if (!combined.trim()) { setApiError('Please provide a response.'); return; }
    setIsEvaluating(true); setApiError(null); setEvaluation(null);
    try {
      const res = await fetch('/api/evaluate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ module: 'hr', questionText: selectedQuestion.promptText, responseText: combined }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Server error');
      setEvaluation({ id: `eval-${Date.now()}`, responseId: `resp-${Date.now()}`, overallScore: data.overallScore, dimensionScores: data.dimensionScores, strengths: data.strengths, improvements: data.improvements, followUpQuestion: data.followUpQuestion, evaluatedAt: new Date().toISOString() });
    } catch (err: any) { setApiError(err.message || 'AI grading failed.'); }
    finally { setIsEvaluating(false); }
  };

  const handleEvaluateFollowUp = async () => {
    if (!followUpAnswer.trim() || !evaluation) return;
    setFollowUpEvaluating(true); setApiError(null);
    try {
      const combined = `${getCombined()}\n\n[Follow-Up]: ${evaluation.followUpQuestion}\n[Answer]: ${followUpAnswer}`;
      const res = await fetch('/api/evaluate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ module: 'hr', questionText: selectedQuestion.promptText, responseText: combined }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Server error');
      const fe: Evaluation = { id: `eval-f-${Date.now()}`, responseId: evaluation.responseId, overallScore: data.overallScore, dimensionScores: data.dimensionScores, strengths: data.strengths, improvements: data.improvements, evaluatedAt: new Date().toISOString() };
      setFinalEvaluation(fe); setFollowUpSubmitted(true);
      onSaveAttempt({ id: evaluation.responseId, questionId: selectedQuestion.id, module: 'hr', rawText: getCombined(), submittedAt: new Date().toISOString(), evaluation: fe, followUpAnswers: [{ question: evaluation.followUpQuestion || '', answer: followUpAnswer, evaluation: fe }] });
    } catch (err: any) { setApiError(err.message); }
    finally { setFollowUpEvaluating(false); }
  };

  const handleReset = () => { setResponseText(''); setSituation(''); setTask(''); setAction(''); setResult(''); setReflection(''); setFollowUpAnswer(''); setEvaluation(null); setFinalEvaluation(null); setFollowUpSubmitted(false); setApiError(null); };

  const VoiceBtn = ({ field }: { field: string }) => (
    <button onClick={() => recordField(field)} disabled={isTranscribing}
      className={`text-[10px] flex items-center space-x-0.5 transition px-2 py-0.5 rounded ${isRecording && activeFieldRef.current === field ? 'text-red-600 font-bold bg-red-50' : 'text-slate-400 hover:text-emerald-600'}`}>
      {isRecording && activeFieldRef.current === field ? <><Square className="w-3 h-3 mr-0.5" />Stop</> : <><Mic className="w-3 h-3 mr-0.5" />Voice</>}
    </button>
  );

  const displayEval = finalEvaluation || evaluation;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-4 space-y-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
          <h3 className="font-display font-bold text-slate-800 text-base flex items-center space-x-2"><Briefcase className="w-5 h-5 text-emerald-500" /><span>Behavioral Topics</span></h3>
          <div className="space-y-2">
            {hrQuestions.map(q => (
              <button key={q.id} onClick={() => { setSelectedQuestion(q); handleReset(); }}
                className={`w-full text-left p-3 rounded-xl transition flex items-start space-x-3 text-xs ${selectedQuestion.id === q.id ? 'bg-emerald-50 border border-emerald-200 text-emerald-900 font-medium' : 'hover:bg-slate-50 border border-transparent text-slate-600'}`}>
                <span className="bg-slate-100 text-slate-500 text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0">{q.companyStyle}</span>
                <div><div className="font-semibold">{q.topic}</div><div className="text-slate-400 text-[10px] uppercase font-bold">{q.difficulty}</div></div>
              </button>
            ))}
          </div>
        </div>
        <button onClick={onNavigateHome} className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-700 text-xs font-semibold transition">Return to Dashboard</button>
      </div>

      <div className="lg:col-span-8 space-y-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-bold uppercase tracking-wide bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded">{selectedQuestion.topic}</span>
            <span className="text-[10px] font-bold uppercase tracking-wide bg-slate-100 text-slate-700 px-2.5 py-1 rounded">{selectedQuestion.companyStyle}</span>
          </div>
          <h2 className="text-xl font-bold font-display text-slate-800 leading-snug">"{selectedQuestion.promptText}"</h2>
          <div className="text-xs text-slate-400 flex items-center space-x-1.5"><Info className="w-4 h-4 text-slate-300" /><span>Click Voice next to any field, speak, then Stop — Gemini transcribes it accurately.</span></div>
        </div>

        <AnimatePresence mode="wait">
          {!evaluation ? (
            <motion.div key="input" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-xs font-semibold text-slate-700">Answer Style</span>
                <button onClick={() => setUseStarHelper(!useStarHelper)} className="text-xs font-bold text-emerald-600 hover:text-emerald-700">{useStarHelper ? 'Switch to Freeform' : 'Enable STAR Builder'}</button>
              </div>

              {!useStarHelper ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between"><span className="text-xs font-bold text-slate-700">Your Full Answer</span><VoiceBtn field="freeform" /></div>
                  <div className="relative">
                    <textarea value={responseText} onChange={e => setResponseText(e.target.value)}
                      placeholder="Click Voice, speak your STAR story, click Stop. Gemini will transcribe it perfectly." rows={8}
                      className="w-full p-4 border border-slate-200 focus:border-emerald-500 rounded-xl text-sm leading-relaxed outline-none resize-none transition" disabled={isEvaluating} />
                    {isRecording && activeFieldRef.current === 'freeform' && <div className="absolute inset-0 bg-emerald-50/30 border-2 border-emerald-500 rounded-xl pointer-events-none flex items-end justify-center pb-3"><div className="bg-white/95 rounded-xl px-4 py-2 flex items-center space-x-2"><span className="w-2 h-2 rounded-full bg-red-500 animate-ping" /><span className="text-xs font-semibold text-emerald-600">Recording — click Stop when done</span></div></div>}
                    {isTranscribing && <div className="absolute inset-0 bg-amber-50/60 border-2 border-amber-400 rounded-xl pointer-events-none flex items-center justify-center"><div className="bg-white rounded-xl px-4 py-2 flex items-center space-x-2 shadow-sm"><RefreshCw className="w-4 h-4 animate-spin text-amber-500" /><span className="text-xs font-semibold text-amber-700">Transcribing with Gemini...</span></div></div>}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {([['Situation (Context)', 'situation', situation, setSituation, 'What was the background?', 'h-20'],
                    ['Task (Challenge)', 'task', task, setTask, 'What was the specific objective?', 'h-20'],
                    ['Action (What YOU did)', 'action', action, setAction, "Your specific actions. Use 'I' not 'we'.", 'h-24'],
                    ['Result (Outcome)', 'result', result, setResult, 'Quantified impact — numbers, percentages, timelines.', 'h-20'],
                    ['Reflection (Learning)', 'reflection', reflection, setReflection, 'What did you learn or would do differently?', 'h-20'],
                  ] as [string, string, string, React.Dispatch<React.SetStateAction<string>>, string, string][]).map(([label, field, val, set, ph, h]) => (
                    <div key={field} className="space-y-1">
                      <div className="flex items-center justify-between"><label className="text-xs font-bold text-slate-700">{label}</label><VoiceBtn field={field} /></div>
                      <div className="relative">
                        <textarea value={val} onChange={e => set(e.target.value)} placeholder={ph} className={`w-full ${h} p-2.5 border border-slate-200 focus:border-emerald-500 rounded-xl text-xs outline-none`} />
                        {isRecording && activeFieldRef.current === field && <div className="absolute inset-0 bg-emerald-50/40 border-2 border-emerald-500 rounded-xl pointer-events-none flex items-center justify-center"><div className="bg-white/90 rounded-lg px-3 py-1 flex items-center space-x-1"><span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" /><span className="text-[10px] font-semibold text-emerald-700">Recording...</span></div></div>}
                        {isTranscribing && activeFieldRef.current === null && field === 'situation' && <div className="absolute inset-0 bg-amber-50/60 border-2 border-amber-400 rounded-xl pointer-events-none flex items-center justify-center"><div className="bg-white rounded-lg px-3 py-1 flex items-center space-x-1"><RefreshCw className="w-3 h-3 animate-spin text-amber-500" /><span className="text-[10px] font-semibold text-amber-700">Transcribing...</span></div></div>}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-end pt-2">
                <button onClick={handleEvaluate} disabled={isRecording || isTranscribing || isEvaluating}
                  className="bg-slate-900 hover:bg-slate-800 disabled:bg-slate-100 disabled:text-slate-400 text-white text-xs font-bold px-6 py-2.5 rounded-xl flex items-center space-x-1.5 transition">
                  {isEvaluating ? <><RefreshCw className="w-4 h-4 animate-spin" /><span>Analysing...</span></> : <><Sparkles className="w-4 h-4 text-amber-400" /><span>Evaluate Story</span></>}
                </button>
              </div>
              {apiError && <div className="bg-red-50 border border-red-200/60 rounded-xl p-4 text-red-700 text-xs flex items-start space-x-2"><AlertCircle className="w-5 h-5 shrink-0 text-red-500 mt-0.5" /><span>{apiError}</span></div>}
            </motion.div>
          ) : (
            <motion.div key="results" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} className="space-y-6">
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
                <div><h3 className="text-lg font-bold font-display text-slate-800">STAR Behavioral Evaluation</h3><p className="text-slate-500 text-xs">Graded against principal-level interview rubrics.</p></div>
                <div className="bg-emerald-50 border border-emerald-100 px-5 py-3 rounded-2xl text-center"><span className="text-4xl font-black font-display text-emerald-600">{displayEval?.overallScore}%</span><span className="text-xs text-emerald-500 font-semibold block">Score</span></div>
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
                <h4 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-2">Rubric Breakdown</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {displayEval?.dimensionScores.map((ds, i) => (<div key={i} className="bg-slate-50 border border-slate-100 rounded-xl p-4 space-y-1.5"><div className="flex items-center justify-between"><span className="text-xs font-semibold text-slate-700">{ds.name}</span><span className="text-xs font-bold text-emerald-600">{ds.score}/5</span></div><p className="text-[11px] text-slate-500 leading-relaxed">{ds.description}</p></div>))}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-3"><h4 className="font-bold text-slate-800 text-sm flex items-center space-x-1.5"><Check className="w-4 h-4 text-emerald-500" /><span>Strengths</span></h4><ul className="space-y-2">{displayEval?.strengths.map((s, i) => <li key={i} className="text-xs text-slate-600 flex items-start space-x-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" /><span>{s}</span></li>)}</ul></div>
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-3"><h4 className="font-bold text-slate-800 text-sm flex items-center space-x-1.5"><AlertCircle className="w-4 h-4 text-amber-500" /><span>Improvements</span></h4><ul className="space-y-2">{displayEval?.improvements.map((s, i) => <li key={i} className="text-xs text-slate-600 flex items-start space-x-1.5"><span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" /><span>{s}</span></li>)}</ul></div>
              </div>
              {evaluation.followUpQuestion && !followUpSubmitted && (
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/60 rounded-2xl p-6 shadow-xs space-y-4">
                  <div className="flex items-start space-x-3"><div className="p-2 bg-emerald-100 rounded-lg text-emerald-700 shrink-0"><MessageSquare className="w-5 h-5" /></div><div><span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 block">Interviewer Follow-Up</span><p className="text-sm font-bold text-slate-800 mt-1">"{evaluation.followUpQuestion}"</p></div></div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between"><span className="text-xs font-semibold text-slate-700">Your Answer</span><VoiceBtn field="followup" /></div>
                    <div className="relative">
                      <textarea value={followUpAnswer} onChange={e => setFollowUpAnswer(e.target.value)} placeholder="Answer the follow-up..." rows={3} className="w-full p-3 border border-emerald-200 focus:border-emerald-500 rounded-xl text-sm outline-none resize-none" />
                      {isTranscribing && <div className="absolute inset-0 bg-amber-50/60 border-2 border-amber-400 rounded-xl pointer-events-none flex items-center justify-center"><div className="bg-white rounded-lg px-3 py-1.5 flex items-center space-x-2"><RefreshCw className="w-3 h-3 animate-spin text-amber-500" /><span className="text-xs font-semibold text-amber-700">Transcribing...</span></div></div>}
                    </div>
                    <button onClick={handleEvaluateFollowUp} disabled={!followUpAnswer.trim() || followUpEvaluating || isRecording || isTranscribing} className="bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs font-bold px-5 py-2 rounded-xl flex items-center space-x-1.5 transition">
                      {followUpEvaluating ? <><RefreshCw className="w-4 h-4 animate-spin" /><span>Grading...</span></> : <><Sparkles className="w-4 h-4 text-amber-300" /><span>Submit Follow-Up</span></>}
                    </button>
                  </div>
                </div>
              )}
              {apiError && <div className="bg-red-50 border border-red-200/60 rounded-xl p-4 text-red-700 text-xs flex items-start space-x-2"><AlertCircle className="w-5 h-5 shrink-0 text-red-500 mt-0.5" /><span>{apiError}</span></div>}
              <div className="flex space-x-3">
                <button onClick={handleReset} className="flex-1 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center justify-center space-x-1.5 transition"><RefreshCw className="w-4 h-4" /><span>Practice Again</span></button>
                <button onClick={onNavigateHome} className="py-3 px-6 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition">Return Home</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
