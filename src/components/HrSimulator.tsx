import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MessageSquare, 
  Mic, 
  Square, 
  Send, 
  ChevronRight, 
  Sparkles, 
  Check, 
  AlertCircle,
  HelpCircle,
  Play,
  ArrowRight,
  BookOpen,
  ArrowLeft,
  Briefcase,
  History,
  Info,
  RefreshCw
} from 'lucide-react';
import { Question, ResponseAttempt, Evaluation, STARStory } from '../types';

interface HrSimulatorProps {
  questions: Question[];
  onSaveAttempt: (attempt: ResponseAttempt) => void;
  onSaveStarStory: (story: STARStory) => void;
  onNavigateHome: () => void;
}

export default function HrSimulator({ 
  questions, 
  onSaveAttempt, 
  onSaveStarStory, 
  onNavigateHome 
}: HrSimulatorProps) {
  
  const hrQuestions = questions.filter(q => q.module === 'hr');
  
  const [selectedQuestion, setSelectedQuestion] = useState<Question>(hrQuestions[0]);
  const [useStarHelper, setUseStarHelper] = useState(false);
  
  // Freeform response
  const [responseText, setResponseText] = useState('');
  
  // STAR Helper inputs
  const [situation, setSituation] = useState('');
  const [task, setTask] = useState('');
  const [action, setAction] = useState('');
  const [result, setResult] = useState('');
  const [reflection, setReflection] = useState('');

  // States
  const [isRecording, setIsRecording] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  // Multi-turn follow-up loop state
  const [followUpAnswer, setFollowUpAnswer] = useState('');
  const [followUpEvaluating, setFollowUpEvaluating] = useState(false);
  const [finalEvaluation, setFinalEvaluation] = useState<Evaluation | null>(null);
  const [followUpSubmitted, setFollowUpSubmitted] = useState(false);

  // Speech recording Web Speech API
  const recognitionRef = useRef<any>(null);
  const [recognitionSupported, setRecognitionSupported] = useState(true);
  const [activeVoiceField, setActiveVoiceField] = useState<'freeform' | 'situation' | 'task' | 'action' | 'result' | 'reflection' | 'followup' | null>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setRecognitionSupported(false);
    } else {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = 'en-US';

      rec.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            transcript += event.results[i][0].transcript;
          }
        }

        if (transcript) {
          if (activeVoiceField === 'freeform') {
            setResponseText(prev => prev + (prev ? ' ' : '') + transcript);
          } else if (activeVoiceField === 'situation') {
            setSituation(prev => prev + (prev ? ' ' : '') + transcript);
          } else if (activeVoiceField === 'task') {
            setTask(prev => prev + (prev ? ' ' : '') + transcript);
          } else if (activeVoiceField === 'action') {
            setAction(prev => prev + (prev ? ' ' : '') + transcript);
          } else if (activeVoiceField === 'result') {
            setResult(prev => prev + (prev ? ' ' : '') + transcript);
          } else if (activeVoiceField === 'reflection') {
            setReflection(prev => prev + (prev ? ' ' : '') + transcript);
          } else if (activeVoiceField === 'followup') {
            setFollowUpAnswer(prev => prev + (prev ? ' ' : '') + transcript);
          }
        }
      };

      rec.onerror = (event: any) => {
        console.error(event.error);
        setIsRecording(false);
        setActiveVoiceField(null);
      };

      rec.onend = () => {
        setIsRecording(false);
        setActiveVoiceField(null);
      };

      recognitionRef.current = rec;
    }
  }, [activeVoiceField]);

  const startVoiceCapture = (field: typeof activeVoiceField) => {
    if (!recognitionRef.current) return;
    setApiError(null);
    try {
      setActiveVoiceField(field);
      setIsRecording(true);
      recognitionRef.current.start();
    } catch (e) {
      console.error(e);
      setIsRecording(false);
    }
  };

  const stopVoiceCapture = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.error(e);
      }
    }
    setIsRecording(false);
    setActiveVoiceField(null);
  };

  const getCombinedResponse = () => {
    if (useStarHelper) {
      return `SITUATION: ${situation}\n\nTASK: ${task}\n\nACTION: ${action}\n\nRESULT: ${result}\n\nREFLECTION: ${reflection}`;
    }
    return responseText;
  };

  const handleEvaluate = async () => {
    const combined = getCombinedResponse();
    if (!combined.trim()) {
      setApiError('Please provide a response before submitting.');
      return;
    }

    setIsEvaluating(true);
    setApiError(null);
    setEvaluation(null);

    try {
      const response = await fetch('/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          module: 'hr',
          questionText: selectedQuestion.promptText,
          responseText: combined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Server error during evaluation.');
      }

      const newEval: Evaluation = {
        id: `eval-${Date.now()}`,
        responseId: `resp-${Date.now()}`,
        overallScore: data.overallScore,
        dimensionScores: data.dimensionScores,
        strengths: data.strengths,
        improvements: data.improvements,
        followUpQuestion: data.followUpQuestion,
        evaluatedAt: new Date().toISOString()
      };

      setEvaluation(newEval);

    } catch (err: any) {
      console.error(err);
      setApiError(err.message || 'An error occurred during AI grading.');
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleEvaluateFollowUp = async () => {
    if (!followUpAnswer.trim() || !evaluation) return;

    setFollowUpEvaluating(true);
    setApiError(null);

    try {
      const combinedResponse = `${getCombinedResponse()}\n\n[Interviewer Follow-Up]: ${evaluation.followUpQuestion}\n[User Follow-Up Response]: ${followUpAnswer}`;
      
      const response = await fetch('/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          module: 'hr',
          questionText: `${selectedQuestion.promptText} (Includes follow-up: ${evaluation.followUpQuestion})`,
          responseText: combinedResponse,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Server error during follow-up grading.');
      }

      const finalEval: Evaluation = {
        id: `eval-final-${Date.now()}`,
        responseId: evaluation.responseId,
        overallScore: data.overallScore,
        dimensionScores: data.dimensionScores,
        strengths: data.strengths,
        improvements: data.improvements,
        evaluatedAt: new Date().toISOString()
      };

      setFinalEvaluation(finalEval);
      setFollowUpSubmitted(true);

      // Save complete thread to global attempts list
      const attempt: ResponseAttempt = {
        id: evaluation.responseId,
        questionId: selectedQuestion.id,
        module: 'hr',
        rawText: getCombinedResponse(),
        submittedAt: new Date().toISOString(),
        evaluation: finalEval,
        followUpAnswers: [
          {
            question: evaluation.followUpQuestion || '',
            answer: followUpAnswer,
            evaluation: finalEval
          }
        ]
      };
      
      onSaveAttempt(attempt);

    } catch (err: any) {
      console.error(err);
      setApiError(err.message || 'Error evaluating follow-up response.');
    } finally {
      setFollowUpEvaluating(false);
    }
  };

  const handleSaveToStoryBank = () => {
    const finalEval = finalEvaluation || evaluation;
    if (!finalEval) return;

    const story: STARStory = {
      id: `story-${Date.now()}`,
      competency: selectedQuestion.topic,
      questionId: selectedQuestion.id,
      questionText: selectedQuestion.promptText,
      situation: useStarHelper ? situation : 'Refer to full answer text.',
      task: useStarHelper ? task : 'Refer to full answer text.',
      action: useStarHelper ? action : 'Refer to full answer text.',
      result: useStarHelper ? result : 'Refer to full answer text.',
      reflection: useStarHelper ? reflection : '',
      lastUpdated: new Date().toISOString()
    };

    onSaveStarStory(story);
    alert('STAR Story successfully saved to your dashboard story bank!');
  };

  const handleReset = () => {
    setResponseText('');
    setSituation('');
    setTask('');
    setAction('');
    setResult('');
    setReflection('');
    setFollowUpAnswer('');
    setEvaluation(null);
    setFinalEvaluation(null);
    setFollowUpSubmitted(false);
    setApiError(null);
    setIsRecording(false);
  };

  const handleSelectQuestion = (q: Question) => {
    setSelectedQuestion(q);
    handleReset();
  };

  return (
    <div id="hr-simulator-root" className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Left Column: Topics and company styles */}
      <div className="lg:col-span-4 space-y-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
          <h3 className="font-display font-bold text-slate-800 text-base flex items-center space-x-2">
            <Briefcase className="w-5 h-5 text-emerald-500" />
            <span>Behavioral Topics</span>
          </h3>
          <div className="space-y-2">
            {hrQuestions.map((q) => {
              const isSelected = selectedQuestion.id === q.id;
              return (
                <button
                  key={q.id}
                  onClick={() => handleSelectQuestion(q)}
                  className={`w-full text-left p-3 rounded-xl transition flex items-start space-x-3 text-xs ${
                    isSelected 
                      ? 'bg-emerald-50 border border-emerald-200 text-emerald-900 font-medium' 
                      : 'hover:bg-slate-50 border border-transparent text-slate-600'
                  }`}
                >
                  <span className="bg-slate-100 text-slate-500 text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0">
                    {q.companyStyle}
                  </span>
                  <div className="space-y-0.5">
                    <div className="font-semibold">{q.topic}</div>
                    <div className="text-slate-400 text-[10px] uppercase font-bold">{q.difficulty}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <button 
          onClick={onNavigateHome}
          className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-700 text-xs font-semibold transition"
        >
          Return to Dashboard
        </button>
      </div>

      {/* Right Column: Interaction Workspace */}
      <div className="lg:col-span-8 space-y-6">
        {/* Active Prompt Information */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-bold uppercase tracking-wide bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded">
              Competency: {selectedQuestion.topic}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wide bg-slate-100 text-slate-700 px-2.5 py-1 rounded">
              Interviewer Style: {selectedQuestion.companyStyle}
            </span>
          </div>
          <h2 className="text-xl font-bold font-display text-slate-800 leading-snug">
            "{selectedQuestion.promptText}"
          </h2>
          <div className="text-xs text-slate-400 flex items-center space-x-1.5">
            <Info className="w-4 h-4 text-slate-300" />
            <span>Structure your story cleanly around Situation, Task, Action, and Result (STAR).</span>
          </div>
        </div>

        {/* Input/Recording Workspace */}
        <AnimatePresence mode="wait">
          {!evaluation ? (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4"
            >
              {/* Option to toggle STAR Helper */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-xs font-semibold text-slate-700">Answer Formulation Style</span>
                <button
                  onClick={() => setUseStarHelper(!useStarHelper)}
                  className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center space-x-1"
                >
                  <span>{useStarHelper ? 'Switch to Freeform Text' : 'Enable STAR Structure Builder'}</span>
                </button>
              </div>

              {!useStarHelper ? (
                /* Freeform Text area */
                <div className="space-y-4">
                  <div className="relative">
                    <textarea
                      value={responseText}
                      onChange={(e) => setResponseText(e.target.value)}
                      placeholder="Type or voice record your complete behavioral story here..."
                      className="w-full h-64 p-4 border border-slate-200 focus:border-emerald-500 rounded-xl text-sm leading-relaxed outline-none resize-none transition"
                      disabled={isEvaluating}
                    />

                    {isRecording && activeVoiceField === 'freeform' && (
                      <div className="absolute inset-x-0 bottom-4 flex items-center justify-center space-x-1 bg-white/95 py-3 border-t border-slate-100">
                        <span className="text-xs font-semibold text-emerald-600 mr-2 flex items-center space-x-1">
                          <span className="w-2 h-2 rounded-full bg-red-500 animate-ping mr-1" />
                          Listening...
                        </span>
                        <div className="h-4 w-1 bg-emerald-500 rounded animate-bounce [animation-delay:0.1s]" />
                        <div className="h-6 w-1 bg-emerald-500 rounded animate-bounce [animation-delay:0.2s]" />
                        <div className="h-8 w-1 bg-emerald-500 rounded animate-bounce [animation-delay:0.3s]" />
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    {recognitionSupported && (
                      !isRecording ? (
                        <button
                          onClick={() => startVoiceCapture('freeform')}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-4 py-2 rounded-xl flex items-center space-x-1 transition shadow-sm"
                        >
                          <Mic className="w-4 h-4" />
                          <span>Record Answer</span>
                        </button>
                      ) : (
                        <button
                          onClick={stopVoiceCapture}
                          className="bg-red-600 hover:bg-red-700 text-white font-semibold text-xs px-4 py-2 rounded-xl flex items-center space-x-1 transition shadow-sm"
                        >
                          <Square className="w-4 h-4" />
                          <span>Stop</span>
                        </button>
                      )
                    )}
                  </div>
                </div>
              ) : (
                /* STAR builder assistant inputs */
                <div className="space-y-4">
                  {/* S */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-700">Situation (The Context)</label>
                      {recognitionSupported && (
                        <button 
                          onClick={() => isRecording && activeVoiceField === 'situation' ? stopVoiceCapture() : startVoiceCapture('situation')}
                          className="text-[10px] text-slate-500 hover:text-emerald-600 flex items-center space-x-0.5"
                        >
                          <Mic className={`w-3 h-3 ${isRecording && activeVoiceField === 'situation' ? 'text-red-500 animate-pulse' : ''}`} />
                          <span>{isRecording && activeVoiceField === 'situation' ? 'Stop' : 'Voice'}</span>
                        </button>
                      )}
                    </div>
                    <textarea
                      value={situation}
                      onChange={(e) => setSituation(e.target.value)}
                      placeholder="What was the project, company context, or setup?"
                      className="w-full h-20 p-2.5 border border-slate-200 focus:border-emerald-500 rounded-xl text-xs outline-none"
                    />
                  </div>

                  {/* T */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-700">Task (The Challenge/Responsibility)</label>
                      {recognitionSupported && (
                        <button 
                          onClick={() => isRecording && activeVoiceField === 'task' ? stopVoiceCapture() : startVoiceCapture('task')}
                          className="text-[10px] text-slate-500 hover:text-emerald-600 flex items-center space-x-0.5"
                        >
                          <Mic className={`w-3 h-3 ${isRecording && activeVoiceField === 'task' ? 'text-red-500 animate-pulse' : ''}`} />
                          <span>{isRecording && activeVoiceField === 'task' ? 'Stop' : 'Voice'}</span>
                        </button>
                      )}
                    </div>
                    <textarea
                      value={task}
                      onChange={(e) => setTask(e.target.value)}
                      placeholder="What was the specific objective or difficulty you had to address?"
                      className="w-full h-20 p-2.5 border border-slate-200 focus:border-emerald-500 rounded-xl text-xs outline-none"
                    />
                  </div>

                  {/* A */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-700">Action (What YOU actually did)</label>
                      {recognitionSupported && (
                        <button 
                          onClick={() => isRecording && activeVoiceField === 'action' ? stopVoiceCapture() : startVoiceCapture('action')}
                          className="text-[10px] text-slate-500 hover:text-emerald-600 flex items-center space-x-0.5"
                        >
                          <Mic className={`w-3 h-3 ${isRecording && activeVoiceField === 'action' ? 'text-red-500 animate-pulse' : ''}`} />
                          <span>{isRecording && activeVoiceField === 'action' ? 'Stop' : 'Voice'}</span>
                        </button>
                      )}
                    </div>
                    <textarea
                      value={action}
                      onChange={(e) => setAction(e.target.value)}
                      placeholder="Explain your technical ownership. What decisions did you make? Use 'I', not 'we'."
                      className="w-full h-24 p-2.5 border border-slate-200 focus:border-emerald-500 rounded-xl text-xs outline-none"
                    />
                  </div>

                  {/* R */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-700">Result (Measurable Outcome)</label>
                      {recognitionSupported && (
                        <button 
                          onClick={() => isRecording && activeVoiceField === 'result' ? stopVoiceCapture() : startVoiceCapture('result')}
                          className="text-[10px] text-slate-500 hover:text-emerald-600 flex items-center space-x-0.5"
                        >
                          <Mic className={`w-3 h-3 ${isRecording && activeVoiceField === 'result' ? 'text-red-500 animate-pulse' : ''}`} />
                          <span>{isRecording && activeVoiceField === 'result' ? 'Stop' : 'Voice'}</span>
                        </button>
                      )}
                    </div>
                    <textarea
                      value={result}
                      onChange={(e) => setResult(e.target.value)}
                      placeholder="What was the impact? Be specific. Use metrics (e.g., 'reduced latency by 30%', 'saved 10 hours/week')."
                      className="w-full h-20 p-2.5 border border-slate-200 focus:border-emerald-500 rounded-xl text-xs outline-none"
                    />
                  </div>

                  {/* Reflection */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-700">Reflection (What you learned)</label>
                      {recognitionSupported && (
                        <button 
                          onClick={() => isRecording && activeVoiceField === 'reflection' ? stopVoiceCapture() : startVoiceCapture('reflection')}
                          className="text-[10px] text-slate-500 hover:text-emerald-600 flex items-center space-x-0.5"
                        >
                          <Mic className={`w-3 h-3 ${isRecording && activeVoiceField === 'reflection' ? 'text-red-500 animate-pulse' : ''}`} />
                          <span>{isRecording && activeVoiceField === 'reflection' ? 'Stop' : 'Voice'}</span>
                        </button>
                      )}
                    </div>
                    <textarea
                      value={reflection}
                      onChange={(e) => setReflection(e.target.value)}
                      placeholder="Looking back, what did you learn, or what would you do differently next time?"
                      className="w-full h-20 p-2.5 border border-slate-200 focus:border-emerald-500 rounded-xl text-xs outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Submit panel */}
              <div className="flex justify-end pt-2">
                <button
                  onClick={handleEvaluate}
                  disabled={isRecording || isEvaluating}
                  className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 disabled:bg-slate-100 disabled:text-slate-400 text-white text-xs font-bold px-6 py-2.5 rounded-xl flex items-center justify-center space-x-1.5 shadow-xs transition"
                >
                  {isEvaluating ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Analysing STAR story...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span>Evaluate Story</span>
                    </>
                  )}
                </button>
              </div>

              {apiError && (
                <div className="bg-red-50 border border-red-200/60 rounded-xl p-4 text-red-700 text-xs flex items-start space-x-2.5">
                  <AlertCircle className="w-5 h-5 shrink-0 text-red-500 mt-0.5" />
                  <span>{apiError}</span>
                </div>
              )}
            </motion.div>
          ) : (
            /* Evaluation and Follow-up Multi-turn Workspace */
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="space-y-6"
            >
              {/* Overall Score Badge */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="space-y-1 text-center md:text-left">
                  <h3 className="text-lg font-bold font-display text-slate-800">STAR Behavioral Evaluation</h3>
                  <p className="text-slate-500 text-xs">Graded against structural metrics of principal-level interview boards.</p>
                </div>
                <div className="flex items-center space-x-3 bg-emerald-50 border border-emerald-100 px-5 py-3 rounded-2xl shrink-0">
                  <div className="text-center">
                    <span className="text-4xl font-black font-display text-emerald-600">
                      {finalEvaluation ? finalEvaluation.overallScore : evaluation.overallScore}%
                    </span>
                    <span className="text-xs text-emerald-500 font-semibold block">Performance Score</span>
                  </div>
                </div>
              </div>

              {/* Rubric Dimensions */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
                <h4 className="font-bold text-slate-800 text-sm md:text-base border-b border-slate-100 pb-2">Rubric Breakdown</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(finalEvaluation || evaluation).dimensionScores.map((ds, index) => (
                    <div key={index} className="bg-slate-50 border border-slate-100 rounded-xl p-4 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-700">{ds.name}</span>
                        <span className="text-xs font-bold text-emerald-600">{ds.score}/5</span>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-relaxed">{ds.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Strengths & Improvements */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-3">
                  <h4 className="font-bold text-slate-800 text-sm flex items-center space-x-1.5">
                    <Check className="w-4 h-4 text-emerald-500" />
                    <span>Story Strengths</span>
                  </h4>
                  <ul className="space-y-2">
                    {(finalEvaluation || evaluation).strengths.map((str, i) => (
                      <li key={i} className="text-xs text-slate-600 leading-relaxed flex items-start space-x-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                        <span>{str}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-3">
                  <h4 className="font-bold text-slate-800 text-sm flex items-center space-x-1.5">
                    <AlertCircle className="w-4 h-4 text-amber-500" />
                    <span>Constructive Improvement</span>
                  </h4>
                  <ul className="space-y-2">
                    {(finalEvaluation || evaluation).improvements.map((imp, i) => (
                      <li key={i} className="text-xs text-slate-600 leading-relaxed flex items-start space-x-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                        <span>{imp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Dynamic Follow-Up Multi-turn Module */}
              {evaluation.followUpQuestion && !followUpSubmitted && (
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/60 rounded-2xl p-6 shadow-xs space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-emerald-100 rounded-lg text-emerald-700 shrink-0 mt-0.5">
                      <MessageSquare className="w-5 h-5 animate-pulse" />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 block">Interviewer Follow-Up Question</span>
                      <p className="text-sm font-bold text-slate-800 leading-relaxed">
                        "{evaluation.followUpQuestion}"
                      </p>
                    </div>
                  </div>

                  {/* Reply Input */}
                  <div className="space-y-3 pt-2">
                    <div className="relative">
                      <textarea
                        value={followUpAnswer}
                        onChange={(e) => setFollowUpAnswer(e.target.value)}
                        placeholder="Explain further details here to address the interviewer's follow-up..."
                        className="w-full h-32 p-4 bg-white border border-slate-200 focus:border-emerald-500 rounded-xl text-xs outline-none"
                        disabled={followUpEvaluating}
                      />

                      {isRecording && activeVoiceField === 'followup' && (
                        <div className="absolute inset-x-0 bottom-3 flex items-center justify-center space-x-1 bg-white/95 py-2 border-t border-slate-100">
                          <span className="text-xs font-semibold text-emerald-600 mr-2 flex items-center">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping mr-1" />
                            Listening...
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      {recognitionSupported && (
                        !isRecording ? (
                          <button
                            onClick={() => startVoiceCapture('followup')}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[11px] px-3 py-1.5 rounded-lg transition"
                          >
                            Voice Record Reply
                          </button>
                        ) : (
                          <button
                            onClick={stopVoiceCapture}
                            className="bg-red-600 hover:bg-red-700 text-white font-semibold text-[11px] px-3 py-1.5 rounded-lg transition"
                          >
                            Stop Recording
                          </button>
                        )
                      )}

                      <button
                        onClick={handleEvaluateFollowUp}
                        disabled={!followUpAnswer.trim() || followUpEvaluating}
                        className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-5 py-2 rounded-xl transition flex items-center space-x-1"
                      >
                        {followUpEvaluating ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Grading combined response...</span>
                          </>
                        ) : (
                          <>
                            <span>Submit Reply</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Show Follow Up Completed Note */}
              {followUpSubmitted && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-emerald-800 text-xs">
                  <span className="font-bold">Follow-Up Complete!</span> Your combined responses have been fully evaluated and saved.
                </div>
              )}

              {/* Story Bank Integration buttons */}
              <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-5 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-indigo-900 flex items-center space-x-1">
                    <BookOpen className="w-4 h-4" />
                    <span>Save to STAR Story Bank</span>
                  </h4>
                  <p className="text-xs text-indigo-700 max-w-lg leading-normal">
                    Securely save this story onto your Dashboard story bank so you can easily reference it, iterate on it, or practice it before target employer deadlines!
                  </p>
                </div>
                <button
                  onClick={handleSaveToStoryBank}
                  className="w-full md:w-auto shrink-0 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition flex items-center justify-center space-x-1"
                >
                  <span>Save Story</span>
                </button>
              </div>

              {/* Reset / Retry actions */}
              <div className="flex space-x-3">
                <button
                  onClick={handleReset}
                  className="flex-1 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center justify-center space-x-1.5 transition"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Practice Another Question</span>
                </button>
                <button
                  onClick={onNavigateHome}
                  className="py-3 px-6 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition"
                >
                  Return Home
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
