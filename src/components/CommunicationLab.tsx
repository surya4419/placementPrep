import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Mic, 
  Square, 
  Send, 
  ChevronRight, 
  Sparkles, 
  Check, 
  AlertCircle,
  HelpCircle,
  Volume2,
  RefreshCw,
  Plus,
  Compass,
  ArrowRight,
  Info
} from 'lucide-react';
import { Question, ResponseAttempt, Evaluation } from '../types';

interface CommunicationLabProps {
  questions: Question[];
  onSaveAttempt: (attempt: ResponseAttempt) => void;
  onNavigateHome: () => void;
}

export default function CommunicationLab({ questions, onSaveAttempt, onNavigateHome }: CommunicationLabProps) {
  const commQuestions = questions.filter(q => q.module === 'communication');
  
  const [selectedQuestion, setSelectedQuestion] = useState<Question>(commQuestions[0]);
  const [textResponse, setTextResponse] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  
  // Web Speech API reference
  const recognitionRef = useRef<any>(null);
  const [recognitionSupported, setRecognitionSupported] = useState(true);

  useEffect(() => {
    // Check Speech Recognition support
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setRecognitionSupported(false);
    } else {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = 'en-US';

      rec.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        // Always update with final results
        if (finalTranscript) {
          console.log('Final transcript:', finalTranscript);
          setTextResponse(prev => {
            const newText = prev ? prev + ' ' + finalTranscript : finalTranscript;
            console.log('Updated text response:', newText);
            return newText;
          });
        }
        
        // Show interim results in console for debugging
        if (interimTranscript) {
          console.log('Interim transcript:', interimTranscript);
        }
      };

      rec.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        
        // Ignore 'aborted' errors - they happen during normal stop operations
        if (event.error === 'aborted') {
          console.log('Recognition aborted - this is normal when stopping');
          setIsRecording(false);
          return;
        }
        
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          setApiError('Microphone access was denied. Please allow microphone permission in your browser settings or type your response.');
        } else if (event.error === 'no-speech') {
          setApiError('No speech detected. Please try speaking louder or check your microphone.');
        } else if (event.error === 'audio-capture') {
          setApiError('Microphone not found or not working. Please check your microphone connection or type your response.');
        } else if (event.error === 'network') {
          setApiError('Network error occurred. Speech recognition requires an internet connection.');
        } else {
          setApiError(`Speech recognition error: ${event.error}. Please try again or type your response.`);
        }
        setIsRecording(false);
      };

      rec.onstart = () => {
        console.log('Speech recognition started successfully');
      };

      rec.onend = () => {
        console.log('Speech recognition ended');
        setIsRecording(false);
      };

      rec.onaudiostart = () => {
        console.log('Audio capturing started');
      };

      rec.onaudioend = () => {
        console.log('Audio capturing ended');
      };

      rec.onspeechstart = () => {
        console.log('Speech detected');
      };

      rec.onspeechend = () => {
        console.log('Speech ended');
      };

      recognitionRef.current = rec;
    }
  }, []);

  const handleStartRecording = async () => {
    setApiError(null);
    if (!recognitionRef.current) {
      setApiError('Speech recognition is not supported on this browser. Please use Chrome, Edge, or Safari.');
      return;
    }
    
    // Prevent starting if already recording
    if (isRecording) return;
    
    // Request microphone permission first
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      setIsRecording(true);
      
      // Small delay to ensure clean state
      setTimeout(() => {
        try {
          recognitionRef.current.start();
        } catch (err: any) {
          if (err.message?.includes('already started')) {
            // Already running, just ignore
            console.log('Recognition already started');
          } else {
            console.error('Start error:', err);
            setApiError('Could not start recording. Please try again.');
            setIsRecording(false);
          }
        }
      }, 100);
    } catch (e: any) {
      console.error('Microphone access error:', e);
      if (e.name === 'NotAllowedError' || e.name === 'PermissionDeniedError') {
        setApiError('Microphone access denied. Please allow microphone permission in your browser settings or type your response instead.');
      } else if (e.name === 'NotFoundError') {
        setApiError('No microphone found. Please connect a microphone or type your response instead.');
      } else {
        setApiError('Could not access microphone. Please type your response instead.');
      }
      setIsRecording(false);
    }
  };

  const handleStopRecording = () => {
    if (recognitionRef.current && isRecording) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.error('Stop error:', e);
      }
    }
    setIsRecording(false);
  };

  const handleEvaluate = async () => {
    if (!textResponse.trim()) {
      setApiError('Please type or record a response first.');
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
          module: 'communication',
          questionText: selectedQuestion.promptText,
          responseText: textResponse,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Server returned an error.');
      }

      const newEval: Evaluation = {
        id: `eval-${Date.now()}`,
        responseId: `resp-${Date.now()}`,
        overallScore: data.overallScore,
        dimensionScores: data.dimensionScores,
        strengths: data.strengths,
        improvements: data.improvements,
        rewrittenSentence: data.rewrittenSentence,
        evaluatedAt: new Date().toISOString()
      };

      setEvaluation(newEval);

      // Save to global app attempts list
      const attempt: ResponseAttempt = {
        id: newEval.responseId,
        questionId: selectedQuestion.id,
        module: 'communication',
        rawText: textResponse,
        submittedAt: new Date().toISOString(),
        evaluation: newEval
      };
      
      onSaveAttempt(attempt);

    } catch (err: any) {
      console.error(err);
      setApiError(err.message || 'An error occurred. Check backend or API connection.');
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleReset = () => {
    setTextResponse('');
    setEvaluation(null);
    setApiError(null);
    setIsRecording(false);
  };

  const handleSelectQuestion = (q: Question) => {
    setSelectedQuestion(q);
    handleReset();
  };

  return (
    <div id="comm-lab-root" className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Left Column: Topics & Prompts */}
      <div className="lg:col-span-4 space-y-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
          <h3 className="font-display font-bold text-slate-800 text-base flex items-center space-x-2">
            <Compass className="w-5 h-5 text-blue-500" />
            <span>Select Prompt Topic</span>
          </h3>
          <div className="space-y-2">
            {commQuestions.map((q) => {
              const isSelected = selectedQuestion.id === q.id;
              return (
                <button
                  key={q.id}
                  onClick={() => handleSelectQuestion(q)}
                  className={`w-full text-left p-3 rounded-xl transition flex items-start space-x-3 text-xs ${
                    isSelected 
                      ? 'bg-blue-50 border border-blue-200 text-blue-900 font-medium' 
                      : 'hover:bg-slate-50 border border-transparent text-slate-600'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                    q.difficulty === 'easy' ? 'bg-emerald-400' :
                    q.difficulty === 'medium' ? 'bg-amber-400' :
                    'bg-red-400'
                  }`} />
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

      {/* Right Column: Interaction & Evaluation Workspace */}
      <div className="lg:col-span-8 space-y-6">
        {/* Active Prompt Information */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-bold uppercase tracking-wide bg-blue-100 text-blue-800 px-2.5 py-1 rounded">
              Active Topic: {selectedQuestion.topic}
            </span>
          </div>
          <h2 className="text-xl font-bold font-display text-slate-800 leading-snug">
            {selectedQuestion.promptText}
          </h2>
          <div className="text-xs text-slate-400 flex items-center space-x-1.5">
            <Info className="w-4 h-4 text-slate-300" />
            <span>Speak or write a concise, organized answer. Take your time!</span>
          </div>
        </div>

        {/* Input/Recording Panel */}
        <AnimatePresence mode="wait">
          {!evaluation ? (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4"
            >
              {/* Fallback alert if speech recognition is unsupported */}
              {!recognitionSupported && (
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-500 flex items-center space-x-2">
                  <Volume2 className="w-4 h-4 shrink-0 text-slate-400" />
                  <span>Speech-to-text transcription isn't fully supported on this browser. Direct typing is fully functional!</span>
                </div>
              )}

              {/* Text Area */}
              <div className="relative">
                <textarea
                  value={textResponse}
                  onChange={(e) => setTextResponse(e.target.value)}
                  placeholder="Record your voice or type your professional answer here... (minimum 2 sentences recommended for a rigorous evaluation)"
                  className="w-full h-44 p-4 border border-slate-200 focus:border-blue-500 rounded-xl text-sm leading-relaxed outline-none resize-none transition"
                  disabled={isRecording || isEvaluating}
                />
                
                {/* Visual Audio Waveform if Recording */}
                {isRecording && (
                  <div className="absolute inset-0 bg-blue-50/30 border-2 border-blue-500 rounded-xl pointer-events-none">
                    <div className="absolute inset-x-0 bottom-4 flex items-center justify-center space-x-1 bg-white/95 py-3 border-t border-slate-100">
                      <span className="text-xs font-semibold text-blue-600 mr-2 flex items-center space-x-1">
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-ping mr-1" />
                        Listening... Speak now!
                      </span>
                      <div className="h-4 w-1 bg-blue-500 rounded animate-bounce [animation-delay:0.1s]" />
                      <div className="h-6 w-1 bg-blue-500 rounded animate-bounce [animation-delay:0.2s]" />
                      <div className="h-8 w-1 bg-blue-500 rounded animate-bounce [animation-delay:0.3s]" />
                      <div className="h-5 w-1 bg-blue-500 rounded animate-bounce [animation-delay:0.4s]" />
                      <div className="h-3 w-1 bg-blue-500 rounded animate-bounce [animation-delay:0.5s]" />
                    </div>
                  </div>
                )}
              </div>

              {/* Control Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center space-x-2">
                  {recognitionSupported && (
                    !isRecording ? (
                      <button
                        onClick={handleStartRecording}
                        disabled={isEvaluating}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-4 py-2.5 rounded-xl flex items-center space-x-1.5 shadow-sm transition"
                      >
                        <Mic className="w-4 h-4" />
                        <span>Record Voice</span>
                      </button>
                    ) : (
                      <button
                        onClick={handleStopRecording}
                        className="bg-red-600 hover:bg-red-700 text-white font-semibold text-xs px-4 py-2.5 rounded-xl flex items-center space-x-1.5 shadow-sm transition"
                      >
                        <Square className="w-4 h-4 animate-pulse" />
                        <span>Stop Recording</span>
                      </button>
                    )
                  )}

                  {textResponse.trim() && (
                    <button
                      onClick={() => setTextResponse('')}
                      disabled={isRecording || isEvaluating}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold px-4 py-2.5 rounded-xl transition"
                    >
                      Clear
                    </button>
                  )}
                </div>

                <button
                  onClick={handleEvaluate}
                  disabled={isRecording || isEvaluating || !textResponse.trim()}
                  className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 disabled:bg-slate-100 disabled:text-slate-400 text-white text-xs font-bold px-6 py-2.5 rounded-xl flex items-center justify-center space-x-1.5 shadow-xs transition"
                >
                  {isEvaluating ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>AI Coaching Grading...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span>Submit response</span>
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
            /* Results Panel */
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="space-y-6"
            >
              {/* Header Score Card */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="space-y-1.5 text-center md:text-left">
                  <h3 className="text-lg font-bold font-display text-slate-800">Your Communication Evaluation</h3>
                  <p className="text-slate-500 text-xs">Graded against professional leadership delivery metrics.</p>
                </div>
                <div className="flex items-center space-x-3 bg-blue-50 border border-blue-100 px-5 py-3 rounded-2xl shrink-0">
                  <div className="text-center">
                    <span className="text-4xl font-black font-display text-blue-600">{evaluation.overallScore}</span>
                    <span className="text-xs text-blue-500 font-semibold block">Overall Score</span>
                  </div>
                </div>
              </div>

              {/* Rubric Dimensions */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
                <h4 className="font-bold text-slate-800 text-sm md:text-base border-b border-slate-100 pb-2">Rubric Breakdown</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {evaluation.dimensionScores.map((ds, index) => (
                    <div key={index} className="bg-slate-50 border border-slate-100 rounded-xl p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-700">{ds.name}</span>
                        <div className="flex space-x-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span 
                              key={star} 
                              className={`text-sm ${star <= ds.score ? 'text-amber-500 font-bold' : 'text-slate-200'}`}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-relaxed">{ds.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Strengths & Improvements */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Strengths */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-3">
                  <h4 className="font-bold text-slate-800 text-sm flex items-center space-x-1.5">
                    <Check className="w-4 h-4 text-emerald-500" />
                    <span>Key Strengths</span>
                  </h4>
                  <ul className="space-y-2">
                    {evaluation.strengths.map((str, i) => (
                      <li key={i} className="text-xs text-slate-600 leading-relaxed flex items-start space-x-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                        <span>{str}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Improvements */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-3">
                  <h4 className="font-bold text-slate-800 text-sm flex items-center space-x-1.5">
                    <AlertCircle className="w-4 h-4 text-amber-500" />
                    <span>Opportunities to Improve</span>
                  </h4>
                  <ul className="space-y-2">
                    {evaluation.improvements.map((imp, i) => (
                      <li key={i} className="text-xs text-slate-600 leading-relaxed flex items-start space-x-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                        <span>{imp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Sentence Polisher / Rewriting Block */}
              {evaluation.rewrittenSentence && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/60 rounded-2xl p-6 shadow-xs space-y-3">
                  <h4 className="font-bold text-slate-800 text-sm flex items-center space-x-1.5">
                    <Sparkles className="w-4 h-4 text-blue-500" />
                    <span>Sentence Polisher & Rewriter</span>
                  </h4>
                  <p className="text-xs text-slate-400">Our coach identified a filler-heavy or weak sentence and optimized it for executive-level impact:</p>
                  <div className="bg-white rounded-xl p-4 border border-blue-100 space-y-3 shadow-2xs">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Original Sentence</span>
                      <p className="text-xs text-slate-500 italic line-clamp-2">"{textResponse.slice(0, 160)}..."</p>
                    </div>
                    <div className="border-t border-slate-100 pt-2 space-y-1">
                      <span className="text-[10px] font-bold uppercase text-blue-600 tracking-wider">Polished Exec Version</span>
                      <p className="text-xs text-blue-900 font-medium leading-relaxed">"{evaluation.rewrittenSentence}"</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Next Actions */}
              <div className="flex space-x-3">
                <button
                  onClick={handleReset}
                  className="flex-1 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center justify-center space-x-1.5 transition"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Try Again / Practice Next</span>
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
