import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, Square, Sparkles, Check, AlertCircle, RefreshCw, Compass, Info } from 'lucide-react';
import { Question, ResponseAttempt, Evaluation } from '../types';
import { useAudioRecorder } from '../hooks/useAudioRecorder';

interface CommunicationLabProps {
  questions: Question[];
  onSaveAttempt: (attempt: ResponseAttempt) => void;
  onNavigateHome: () => void;
}

export default function CommunicationLab({ questions, onSaveAttempt, onNavigateHome }: CommunicationLabProps) {
  const commQuestions = questions.filter(q => q.module === 'communication');
  const [selectedQuestion, setSelectedQuestion] = useState<Question>(commQuestions[0]);
  const [textResponse, setTextResponse] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  const { isRecording, isTranscribing, startRecording, stopRecording } = useAudioRecorder({
    onTranscript: (text) => setTextResponse(prev => prev ? prev + ' ' + text : text),
    onError: (msg) => setApiError(msg),
  });

  const handleEvaluate = async () => {
    if (!textResponse.trim()) { setApiError('Please record or type a response first.'); return; }
    setIsEvaluating(true); setApiError(null); setEvaluation(null);
    try {
      const res = await fetch('/api/evaluate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ module: 'communication', questionText: selectedQuestion.promptText, responseText: textResponse }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Server error');
      const newEval: Evaluation = { id: `eval-${Date.now()}`, responseId: `resp-${Date.now()}`, overallScore: data.overallScore, dimensionScores: data.dimensionScores, strengths: data.strengths, improvements: data.improvements, rewrittenSentence: data.rewrittenSentence, evaluatedAt: new Date().toISOString() };
      setEvaluation(newEval);
      onSaveAttempt({ id: newEval.responseId, questionId: selectedQuestion.id, module: 'communication', rawText: textResponse, submittedAt: new Date().toISOString(), evaluation: newEval });
    } catch (err: any) { setApiError(err.message || 'An error occurred.'); }
    finally { setIsEvaluating(false); }
  };

  const handleReset = () => { setTextResponse(''); setEvaluation(null); setApiError(null); };
  const handleSelectQuestion = (q: Question) => { setSelectedQuestion(q); handleReset(); };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Left: Question selector */}
      <div className="lg:col-span-4 space-y-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
          <h3 className="font-display font-bold text-slate-800 text-base flex items-center space-x-2">
            <Compass className="w-5 h-5 text-blue-500" /><span>Select Prompt Topic</span>
          </h3>
          <div className="space-y-2">
            {commQuestions.map((q) => (
              <button key={q.id} onClick={() => handleSelectQuestion(q)}
                className={`w-full text-left p-3 rounded-xl transition flex items-start space-x-3 text-xs ${selectedQuestion.id === q.id ? 'bg-blue-50 border border-blue-200 text-blue-900 font-medium' : 'hover:bg-slate-50 border border-transparent text-slate-600'}`}>
                <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${q.difficulty === 'easy' ? 'bg-emerald-400' : q.difficulty === 'medium' ? 'bg-amber-400' : 'bg-red-400'}`} />
                <div><div className="font-semibold">{q.topic}</div><div className="text-slate-400 text-[10px] uppercase font-bold">{q.difficulty}</div></div>
              </button>
            ))}
          </div>
        </div>
        <button onClick={onNavigateHome} className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-700 text-xs font-semibold transition">Return to Dashboard</button>
      </div>

      {/* Right: Recording + Evaluation */}
      <div className="lg:col-span-8 space-y-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <span className="text-[10px] font-bold uppercase tracking-wide bg-blue-100 text-blue-800 px-2.5 py-1 rounded">Active Topic: {selectedQuestion.topic}</span>
          <h2 className="text-xl font-bold font-display text-slate-800 leading-snug">{selectedQuestion.promptText}</h2>
          <div className="text-xs text-slate-400 flex items-center space-x-1.5"><Info className="w-4 h-4 text-slate-300" /><span>Speak or write your answer. Click Record, speak, then Stop — Gemini will transcribe it.</span></div>
        </div>

        <AnimatePresence mode="wait">
          {!evaluation ? (
            <motion.div key="input" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
              {/* Textarea */}
              <div className="relative">
                <textarea value={textResponse} onChange={(e) => setTextResponse(e.target.value)}
                  placeholder="Click 'Record Voice', speak your answer, then click 'Stop'. Gemini will transcribe everything accurately. Or type directly here."
                  className="w-full h-44 p-4 border border-slate-200 focus:border-blue-500 rounded-xl text-sm leading-relaxed outline-none resize-none transition"
                  disabled={isRecording || isTranscribing || isEvaluating} />
                {isRecording && (
                  <div className="absolute inset-0 bg-blue-50/30 border-2 border-blue-500 rounded-xl pointer-events-none flex items-end justify-center pb-4">
                    <div className="bg-white/95 rounded-xl px-4 py-2 flex items-center space-x-2">
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                      <span className="text-xs font-semibold text-blue-600">Recording... speak now, click Stop when done</span>
                      {[0.1,0.2,0.3,0.2,0.1].map((d, i) => <div key={i} className="h-5 w-1 bg-blue-500 rounded animate-bounce" style={{ animationDelay: `${d}s` }} />)}
                    </div>
                  </div>
                )}
                {isTranscribing && (
                  <div className="absolute inset-0 bg-amber-50/60 border-2 border-amber-400 rounded-xl pointer-events-none flex items-center justify-center">
                    <div className="bg-white rounded-xl px-4 py-2 flex items-center space-x-2 shadow-sm">
                      <RefreshCw className="w-4 h-4 animate-spin text-amber-500" />
                      <span className="text-xs font-semibold text-amber-700">Transcribing with Gemini AI...</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center space-x-2">
                  {!isRecording ? (
                    <button onClick={startRecording} disabled={isEvaluating || isTranscribing}
                      className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-semibold text-xs px-4 py-2.5 rounded-xl flex items-center space-x-1.5 shadow-sm transition">
                      <Mic className="w-4 h-4" /><span>Record Voice</span>
                    </button>
                  ) : (
                    <button onClick={stopRecording}
                      className="bg-red-600 hover:bg-red-700 text-white font-semibold text-xs px-4 py-2.5 rounded-xl flex items-center space-x-1.5 shadow-sm transition animate-pulse">
                      <Square className="w-4 h-4" /><span>Stop Recording</span>
                    </button>
                  )}
                  {textResponse.trim() && !isRecording && !isTranscribing && (
                    <button onClick={() => setTextResponse('')} disabled={isEvaluating} className="bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold px-4 py-2.5 rounded-xl transition">Clear</button>
                  )}
                </div>
                <button onClick={handleEvaluate} disabled={isRecording || isTranscribing || isEvaluating || !textResponse.trim()}
                  className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 disabled:bg-slate-100 disabled:text-slate-400 text-white text-xs font-bold px-6 py-2.5 rounded-xl flex items-center justify-center space-x-1.5 transition">
                  {isEvaluating ? <><RefreshCw className="w-4 h-4 animate-spin" /><span>Grading...</span></> : <><Sparkles className="w-4 h-4 text-amber-400" /><span>Submit Response</span></>}
                </button>
              </div>

              {apiError && <div className="bg-red-50 border border-red-200/60 rounded-xl p-4 text-red-700 text-xs flex items-start space-x-2.5"><AlertCircle className="w-5 h-5 shrink-0 text-red-500 mt-0.5" /><span>{apiError}</span></div>}
            </motion.div>
          ) : (
            <motion.div key="results" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} className="space-y-6">
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
                <div><h3 className="text-lg font-bold font-display text-slate-800">Communication Evaluation</h3><p className="text-slate-500 text-xs">Graded against professional leadership delivery metrics.</p></div>
                <div className="bg-blue-50 border border-blue-100 px-5 py-3 rounded-2xl text-center"><span className="text-4xl font-black font-display text-blue-600">{evaluation.overallScore}</span><span className="text-xs text-blue-500 font-semibold block">Overall Score</span></div>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
                <h4 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-2">Rubric Breakdown</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {evaluation.dimensionScores.map((ds, i) => (
                    <div key={i} className="bg-slate-50 border border-slate-100 rounded-xl p-4 space-y-2">
                      <div className="flex items-center justify-between"><span className="text-xs font-semibold text-slate-700">{ds.name}</span><div className="flex space-x-0.5">{[1,2,3,4,5].map(s => <span key={s} className={`text-sm ${s <= ds.score ? 'text-amber-500 font-bold' : 'text-slate-200'}`}>★</span>)}</div></div>
                      <p className="text-[11px] text-slate-500 leading-relaxed">{ds.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-3">
                  <h4 className="font-bold text-slate-800 text-sm flex items-center space-x-1.5"><Check className="w-4 h-4 text-emerald-500" /><span>Key Strengths</span></h4>
                  <ul className="space-y-2">{evaluation.strengths.map((s, i) => <li key={i} className="text-xs text-slate-600 flex items-start space-x-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" /><span>{s}</span></li>)}</ul>
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-3">
                  <h4 className="font-bold text-slate-800 text-sm flex items-center space-x-1.5"><AlertCircle className="w-4 h-4 text-amber-500" /><span>Opportunities to Improve</span></h4>
                  <ul className="space-y-2">{evaluation.improvements.map((s, i) => <li key={i} className="text-xs text-slate-600 flex items-start space-x-2"><span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" /><span>{s}</span></li>)}</ul>
                </div>
              </div>

              {evaluation.rewrittenSentence && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/60 rounded-2xl p-6 shadow-xs space-y-3">
                  <h4 className="font-bold text-slate-800 text-sm flex items-center space-x-1.5"><Sparkles className="w-4 h-4 text-blue-500" /><span>Sentence Polisher</span></h4>
                  <div className="bg-white rounded-xl p-4 border border-blue-100 space-y-3">
                    <div><span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Original</span><p className="text-xs text-slate-500 italic mt-1">"{textResponse.slice(0, 160)}..."</p></div>
                    <div className="border-t border-slate-100 pt-2"><span className="text-[10px] font-bold uppercase text-blue-600 tracking-wider">Polished</span><p className="text-xs text-blue-900 font-medium leading-relaxed mt-1">"{evaluation.rewrittenSentence}"</p></div>
                  </div>
                </div>
              )}

              <div className="flex space-x-3">
                <button onClick={handleReset} className="flex-1 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center justify-center space-x-1.5 transition"><RefreshCw className="w-4 h-4" /><span>Try Again</span></button>
                <button onClick={onNavigateHome} className="py-3 px-6 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition">Return Home</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
