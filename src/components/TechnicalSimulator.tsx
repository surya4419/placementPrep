import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Code2, Mic, Square, Sparkles, Check, AlertCircle, Terminal, RefreshCw, BookMarked } from 'lucide-react';
import Editor from '@monaco-editor/react';
import { Question, ResponseAttempt, Evaluation } from '../types';
import { useAudioRecorder } from '../hooks/useAudioRecorder';

interface TechnicalSimulatorProps {
  questions: Question[];
  onSaveAttempt: (attempt: ResponseAttempt) => void;
  onNavigateHome: () => void;
}

export default function TechnicalSimulator({ questions, onSaveAttempt, onNavigateHome }: TechnicalSimulatorProps) {
  const techQuestions = questions.filter(q => q.module === 'technical');
  const [selectedQuestion, setSelectedQuestion] = useState<Question>(techQuestions[0]);
  const [codeValue, setCodeValue] = useState(selectedQuestion.codeTemplate || '');
  const [thinkAloudText, setThinkAloudText] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  const { isRecording, isTranscribing, startRecording, stopRecording } = useAudioRecorder({
    onTranscript: (text) => setThinkAloudText(prev => prev ? prev + ' ' + text : text),
    onError: (msg) => setApiError(msg),
  });

  useEffect(() => {
    setCodeValue(selectedQuestion.codeTemplate || '');
    setThinkAloudText('');
    setEvaluation(null);
    setApiError(null);
  }, [selectedQuestion]);

  const handleEvaluate = async () => {
    if (!codeValue.trim()) { setApiError('Please write some code before submitting.'); return; }
    if (!thinkAloudText.trim()) { setApiError('The "Think Aloud" explanation is mandatory. Use the Voice button to explain your approach.'); return; }
    setIsEvaluating(true); setApiError(null); setEvaluation(null);
    try {
      const res = await fetch('/api/evaluate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ module: 'technical', questionText: selectedQuestion.promptText, responseText: thinkAloudText, code: codeValue, thinkAloudText }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Server error');
      const newEval: Evaluation = { id: `eval-tech-${Date.now()}`, responseId: `resp-tech-${Date.now()}`, overallScore: data.overallScore, dimensionScores: data.dimensionScores, strengths: data.strengths, improvements: data.improvements, suggestedCodeSolution: data.suggestedCodeSolution, evaluatedAt: new Date().toISOString() };
      setEvaluation(newEval);
      onSaveAttempt({ id: newEval.responseId, questionId: selectedQuestion.id, module: 'technical', rawText: thinkAloudText, code: codeValue, thinkAloudText, submittedAt: new Date().toISOString(), evaluation: newEval });
    } catch (err: any) { setApiError(err.message || 'Technical evaluation failed.'); }
    finally { setIsEvaluating(false); }
  };

  const handleReset = () => { setCodeValue(selectedQuestion.codeTemplate || ''); setThinkAloudText(''); setEvaluation(null); setApiError(null); };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-indigo-50 rounded-xl text-indigo-600"><Code2 className="w-5 h-5" /></div>
          <div><h2 className="font-display font-bold text-slate-800 text-base">Coding & DSA Workspace</h2><p className="text-xs text-slate-400">Code solutions while verbalizing your approach.</p></div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <select value={selectedQuestion.id} onChange={e => { const q = techQuestions.find(qt => qt.id === e.target.value); if (q) setSelectedQuestion(q); }}
            className="border border-slate-200 text-xs font-semibold text-slate-700 bg-white px-3 py-2 rounded-xl focus:border-indigo-500">
            {techQuestions.map(q => <option key={q.id} value={q.id}>[{q.topic}] {q.promptText.slice(0, 35)}...</option>)}
          </select>
          <button onClick={onNavigateHome} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-700 text-xs font-semibold transition">Return Home</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Problem description */}
        <div className="lg:col-span-4 flex flex-col space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4 flex-1">
            <div className="flex items-center space-x-2">
              <span className={`text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded ${selectedQuestion.difficulty === 'easy' ? 'bg-emerald-100 text-emerald-800' : selectedQuestion.difficulty === 'medium' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'}`}>{selectedQuestion.difficulty}</span>
              <span className="text-[10px] font-bold uppercase tracking-wide bg-slate-100 text-slate-700 px-2.5 py-1 rounded">{selectedQuestion.topic}</span>
            </div>
            <div className="space-y-3">
              <h3 className="font-display font-bold text-slate-800 text-lg leading-tight">Problem Description</h3>
              <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">{selectedQuestion.promptText}</p>
            </div>
            <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-4 space-y-2">
              <h4 className="text-xs font-bold text-indigo-900 flex items-center space-x-1"><Terminal className="w-3.5 h-3.5" /><span>Interview Hint</span></h4>
              <p className="text-[11px] text-indigo-700 leading-normal">Avoid silence. Interviewers rate verbal approach explanation as heavily as code correctness. Use the Voice button to speak your thinking.</p>
            </div>
          </div>
        </div>

        {/* Editor + Think Aloud */}
        <div className="lg:col-span-8 flex flex-col space-y-4">
          <AnimatePresence mode="wait">
            {!evaluation ? (
              <motion.div key="input" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4 flex flex-col h-full">
                {/* Code editor */}
                <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs bg-white flex-1 min-h-[350px] flex flex-col">
                  <div className="bg-slate-50 border-b border-slate-200 px-4 py-2.5 flex items-center justify-between shrink-0">
                    <span className="text-xs font-bold text-slate-700 flex items-center space-x-1.5"><Code2 className="w-4 h-4 text-indigo-500" /><span>Code Solution</span></span>
                  </div>
                  <div className="flex-1 min-h-[300px]">
                    <Editor height="100%" language={selectedQuestion.language || 'typescript'} theme="light" value={codeValue} onChange={val => setCodeValue(val || '')}
                      options={{ minimap: { enabled: false }, fontSize: 12, lineNumbers: 'on', automaticLayout: true, scrollBeyondLastLine: false, tabSize: 2 }} />
                  </div>
                </div>

                {/* Think Aloud */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <h4 className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
                      <Mic className="w-4 h-4 text-emerald-500" /><span>"Think Aloud" Explanation (MANDATORY)</span>
                    </h4>
                    {!isRecording ? (
                      <button onClick={startRecording} disabled={isTranscribing}
                        className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 flex items-center space-x-1 bg-emerald-50 px-3 py-1 rounded-lg transition">
                        <Mic className="w-3 h-3 mr-1" />Record Speech
                      </button>
                    ) : (
                      <button onClick={stopRecording}
                        className="text-[11px] font-bold text-red-600 hover:text-red-700 flex items-center space-x-1 bg-red-50 px-3 py-1 rounded-lg transition animate-pulse">
                        <Square className="w-3 h-3 mr-1" />Stop Recording
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <textarea value={thinkAloudText} onChange={e => setThinkAloudText(e.target.value)}
                      placeholder="Click 'Record Speech', explain your approach out loud (complexity, edge cases, trade-offs), then Stop. Gemini transcribes it."
                      className="w-full h-28 p-3 border border-slate-100 focus:border-indigo-400 rounded-xl text-xs outline-none resize-none bg-slate-50" disabled={isEvaluating} />
                    {isRecording && <div className="absolute inset-0 bg-indigo-50/40 border-2 border-indigo-500 rounded-xl pointer-events-none flex items-center justify-center"><div className="bg-white/95 rounded-xl px-4 py-2 flex items-center space-x-2"><span className="w-2 h-2 rounded-full bg-red-500 animate-ping" /><span className="text-xs font-semibold text-indigo-600">Recording your approach — click Stop when done</span></div></div>}
                    {isTranscribing && <div className="absolute inset-0 bg-amber-50/60 border-2 border-amber-400 rounded-xl pointer-events-none flex items-center justify-center"><div className="bg-white rounded-xl px-4 py-2 flex items-center space-x-2 shadow-sm"><RefreshCw className="w-4 h-4 animate-spin text-amber-500" /><span className="text-xs font-semibold text-amber-700">Transcribing with Gemini...</span></div></div>}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <button onClick={handleReset} className="text-xs font-bold text-slate-500 hover:text-slate-700">Reset to Template</button>
                  <button onClick={handleEvaluate} disabled={isRecording || isTranscribing || isEvaluating}
                    className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 disabled:bg-slate-100 disabled:text-slate-400 text-white text-xs font-bold px-6 py-2.5 rounded-xl flex items-center justify-center space-x-1.5 transition">
                    {isEvaluating ? <><RefreshCw className="w-4 h-4 animate-spin" /><span>AI Board Reviewing...</span></> : <><Sparkles className="w-4 h-4 text-amber-400" /><span>Submit Code & Approach</span></>}
                  </button>
                </div>
                {apiError && <div className="bg-red-50 border border-red-200/60 rounded-xl p-4 text-red-700 text-xs flex items-start space-x-2"><AlertCircle className="w-5 h-5 shrink-0 text-red-500 mt-0.5" /><span>{apiError}</span></div>}
              </motion.div>
            ) : (
              <motion.div key="results" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} className="space-y-6">
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
                  <div><h3 className="text-lg font-bold font-display text-slate-800">DSA Board Interview Scores</h3><p className="text-slate-500 text-xs">Evaluated using FAANG calibration rubrics.</p></div>
                  <div className="bg-indigo-50 border border-indigo-100 px-5 py-3 rounded-2xl text-center"><span className="text-4xl font-black font-display text-indigo-600">{evaluation.overallScore}%</span><span className="text-xs text-indigo-500 font-semibold block">Combined Rating</span></div>
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
                  <h4 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-2">Rubric Calibration</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {evaluation.dimensionScores.map((ds, i) => (<div key={i} className="bg-slate-50 border border-slate-100 rounded-xl p-4 space-y-1.5"><div className="flex items-center justify-between"><span className="text-xs font-semibold text-slate-700">{ds.name}</span><span className="text-xs font-bold text-indigo-600">{ds.score}/5</span></div><p className="text-[11px] text-slate-500 leading-relaxed">{ds.description}</p></div>))}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-3"><h4 className="font-bold text-slate-800 text-sm flex items-center space-x-1.5"><Check className="w-4 h-4 text-emerald-500" /><span>Key Highlights</span></h4><ul className="space-y-2">{evaluation.strengths.map((s, i) => <li key={i} className="text-xs text-slate-600 flex items-start space-x-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" /><span>{s}</span></li>)}</ul></div>
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-3"><h4 className="font-bold text-slate-800 text-sm flex items-center space-x-1.5"><AlertCircle className="w-4 h-4 text-amber-500" /><span>Optimizations</span></h4><ul className="space-y-2">{evaluation.improvements.map((s, i) => <li key={i} className="text-xs text-slate-600 flex items-start space-x-1.5"><span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" /><span>{s}</span></li>)}</ul></div>
                </div>
                {evaluation.suggestedCodeSolution && (
                  <div className="bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 shadow-sm">
                    <div className="bg-slate-950 border-b border-slate-800 px-4 py-2.5 flex items-center"><BookMarked className="w-4 h-4 text-indigo-400 mr-2" /><span className="text-xs font-bold text-slate-300">Optimal Reference Solution</span></div>
                    <div className="p-4 overflow-x-auto font-mono text-xs text-indigo-300 bg-slate-950/70 leading-relaxed"><pre className="whitespace-pre">{evaluation.suggestedCodeSolution}</pre></div>
                  </div>
                )}
                <div className="flex space-x-3">
                  <button onClick={handleReset} className="flex-1 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center justify-center space-x-1.5 transition"><RefreshCw className="w-4 h-4" /><span>Practice Next Challenge</span></button>
                  <button onClick={onNavigateHome} className="py-3 px-6 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition">Return Home</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
