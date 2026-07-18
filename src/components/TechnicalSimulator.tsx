import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Code2, 
  Mic, 
  Square, 
  Sparkles, 
  Check, 
  AlertCircle, 
  Play, 
  HelpCircle,
  BookOpen,
  History,
  Terminal,
  RefreshCw,
  Award,
  BookMarked
} from 'lucide-react';
import Editor from '@monaco-editor/react';
import { Question, ResponseAttempt, Evaluation } from '../types';

interface TechnicalSimulatorProps {
  questions: Question[];
  onSaveAttempt: (attempt: ResponseAttempt) => void;
  onNavigateHome: () => void;
}

export default function TechnicalSimulator({ 
  questions, 
  onSaveAttempt, 
  onNavigateHome 
}: TechnicalSimulatorProps) {

  const techQuestions = questions.filter(q => q.module === 'technical');
  const [selectedQuestion, setSelectedQuestion] = useState<Question>(techQuestions[0]);
  const [codeValue, setCodeValue] = useState(selectedQuestion.codeTemplate || '');
  const [thinkAloudText, setThinkAloudText] = useState('');
  
  // Evaluation States
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  
  // Voice Recording state for Think-Aloud
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);
  const [recognitionSupported, setRecognitionSupported] = useState(true);

  useEffect(() => {
    // Reset code value when selected question changes
    setCodeValue(selectedQuestion.codeTemplate || '');
    setThinkAloudText('');
    setEvaluation(null);
    setApiError(null);
  }, [selectedQuestion]);

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
          setThinkAloudText(prev => prev + (prev ? ' ' : '') + transcript);
        }
      };

      rec.onerror = (event: any) => {
        console.error(event.error);
        setIsRecording(false);
      };

      rec.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = rec;
    }
  }, []);

  const handleStartRecording = () => {
    if (!recognitionRef.current) return;
    setApiError(null);
    try {
      setIsRecording(true);
      recognitionRef.current.start();
    } catch (e) {
      console.error(e);
      setIsRecording(false);
    }
  };

  const handleStopRecording = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.error(e);
      }
    }
    setIsRecording(false);
  };

  const handleEvaluate = async () => {
    if (!codeValue.trim()) {
      setApiError('Please write some code before submitting.');
      return;
    }
    if (!thinkAloudText.trim()) {
      setApiError('The "Think Aloud" approach explanation is a mandatory field. Most interview failures occur due to lack of verbal clarification, not coding. Please briefly summarize your approach, edge cases, or complexity in the text/voice block.');
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
          module: 'technical',
          questionText: selectedQuestion.promptText,
          responseText: thinkAloudText, // Representing approach description
          code: codeValue,
          thinkAloudText: thinkAloudText
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Server error during evaluation.');
      }

      const newEval: Evaluation = {
        id: `eval-tech-${Date.now()}`,
        responseId: `resp-tech-${Date.now()}`,
        overallScore: data.overallScore,
        dimensionScores: data.dimensionScores,
        strengths: data.strengths,
        improvements: data.improvements,
        suggestedCodeSolution: data.suggestedCodeSolution,
        evaluatedAt: new Date().toISOString()
      };

      setEvaluation(newEval);

      // Save to global app attempts list
      const attempt: ResponseAttempt = {
        id: newEval.responseId,
        questionId: selectedQuestion.id,
        module: 'technical',
        rawText: thinkAloudText,
        code: codeValue,
        thinkAloudText: thinkAloudText,
        submittedAt: new Date().toISOString(),
        evaluation: newEval
      };
      
      onSaveAttempt(attempt);

    } catch (err: any) {
      console.error(err);
      setApiError(err.message || 'An error occurred during technical evaluation.');
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleReset = () => {
    setCodeValue(selectedQuestion.codeTemplate || '');
    setThinkAloudText('');
    setEvaluation(null);
    setApiError(null);
    setIsRecording(false);
  };

  return (
    <div id="tech-simulator-root" className="space-y-6">
      {/* Selector bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-indigo-50 rounded-xl text-indigo-600">
            <Code2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-display font-bold text-slate-800 text-base">Coding & DSA Workspace</h2>
            <p className="text-xs text-slate-400">Code optimal solutions while verbalizing your step-by-step thinking.</p>
          </div>
        </div>

        {/* Dropdown question selector */}
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <select
            value={selectedQuestion.id}
            onChange={(e) => {
              const q = techQuestions.find(qt => qt.id === e.target.value);
              if (q) setSelectedQuestion(q);
            }}
            className="border border-slate-200 text-xs font-semibold text-slate-700 bg-white px-3 py-2 rounded-xl focus:border-indigo-500"
          >
            {techQuestions.map((q) => (
              <option key={q.id} value={q.id}>
                [{q.topic}] {q.promptText.slice(0, 35)}...
              </option>
            ))}
          </select>

          <button 
            onClick={onNavigateHome}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-700 text-xs font-semibold transition"
          >
            Return Home
          </button>
        </div>
      </div>

      {/* Main Workspace split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Column: Problem description & Constraints */}
        <div className="lg:col-span-4 flex flex-col justify-between space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4 flex-1">
            <div className="flex items-center space-x-2">
              <span className={`text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded ${
                selectedQuestion.difficulty === 'easy' ? 'bg-emerald-100 text-emerald-800' :
                selectedQuestion.difficulty === 'medium' ? 'bg-amber-100 text-amber-800' :
                'bg-red-100 text-red-800'
              }`}>
                {selectedQuestion.difficulty}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wide bg-slate-100 text-slate-700 px-2.5 py-1 rounded">
                {selectedQuestion.topic}
              </span>
            </div>

            <div className="space-y-3">
              <h3 className="font-display font-bold text-slate-800 text-lg leading-tight">
                Problem Description
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed font-normal whitespace-pre-wrap">
                {selectedQuestion.promptText}
              </p>
            </div>

            {/* Coding Guidance */}
            <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-4 space-y-2">
              <h4 className="text-xs font-bold text-indigo-900 flex items-center space-x-1">
                <Terminal className="w-3.5 h-3.5" />
                <span>Interview Rubric Hint</span>
              </h4>
              <p className="text-[11px] text-indigo-700 leading-normal">
                Avoid silence. Principal interviewers rate clarifying questions and analytical approach reasoning (e.g., comparing time complexities) as highly as code correctness. Be structured in your "Think Aloud" block.
              </p>
            </div>
          </div>
        </div>

        {/* Center/Right Column: Code Editor & Speech box */}
        <div className="lg:col-span-8 flex flex-col space-y-4">
          <AnimatePresence mode="wait">
            {!evaluation ? (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4 flex flex-col h-full"
              >
                {/* Monaco Editor Container */}
                <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs bg-white flex-1 min-h-[350px] flex flex-col">
                  <div className="bg-slate-50 border-b border-slate-200 px-4 py-2.5 flex items-center justify-between shrink-0">
                    <span className="text-xs font-bold text-slate-700 flex items-center space-x-1.5">
                      <Code2 className="w-4 h-4 text-indigo-500" />
                      <span>Code Solution ({selectedQuestion.language === 'markdown' ? 'Markdown Architecture' : 'TypeScript'})</span>
                    </span>
                  </div>
                  <div className="flex-1 min-h-[300px]">
                    <Editor
                      height="100%"
                      language={selectedQuestion.language || 'typescript'}
                      theme="light"
                      value={codeValue}
                      onChange={(val) => setCodeValue(val || '')}
                      options={{
                        minimap: { enabled: false },
                        fontSize: 12,
                        lineNumbers: 'on',
                        automaticLayout: true,
                        scrollBeyondLastLine: false,
                        tabSize: 2,
                      }}
                    />
                  </div>
                </div>

                {/* Required "Explain approach out loud" Block */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <h4 className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
                      <Mic className="w-4 h-4 text-emerald-500 animate-pulse" />
                      <span>"Think Aloud" Approach Explanation (MANDATORY)</span>
                    </h4>
                    {recognitionSupported && (
                      !isRecording ? (
                        <button
                          onClick={handleStartRecording}
                          className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 flex items-center space-x-1"
                        >
                          <span>Record Speech</span>
                        </button>
                      ) : (
                        <button
                          onClick={handleStopRecording}
                          className="text-[11px] font-bold text-red-600 hover:text-red-700 flex items-center space-x-1"
                        >
                          <span>Stop Recording</span>
                        </button>
                      )
                    )}
                  </div>

                  <div className="relative">
                    <textarea
                      value={thinkAloudText}
                      onChange={(e) => setThinkAloudText(e.target.value)}
                      placeholder="Discuss your approach out loud here. What is the Big O Time and Space complexity? What edge cases (e.g., null bounds, large inputs) did you consider?"
                      className="w-full h-24 p-3 border border-slate-100 focus:border-indigo-400 rounded-xl text-xs outline-none resize-none bg-slate-50"
                      disabled={isEvaluating}
                    />

                    {isRecording && (
                      <div className="absolute inset-x-0 bottom-2 flex items-center justify-center space-x-1 bg-white/95 py-2">
                        <span className="text-[11px] font-semibold text-emerald-600">
                          Listening to voice explanations...
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Submit panel */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <button
                    onClick={handleReset}
                    className="text-xs font-bold text-slate-500 hover:text-slate-700"
                  >
                    Reset Code to Template
                  </button>

                  <button
                    onClick={handleEvaluate}
                    disabled={isEvaluating}
                    className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-6 py-2.5 rounded-xl flex items-center justify-center space-x-1.5 shadow-xs transition"
                  >
                    {isEvaluating ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>AI Board Reviewing...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-amber-400" />
                        <span>Submit Code & Approach</span>
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
              /* Results Dashboard view */
              <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="space-y-6"
              >
                {/* Score panel */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="space-y-1 text-center md:text-left">
                    <h3 className="text-lg font-bold font-display text-slate-800">DSA Board Interview Scores</h3>
                    <p className="text-slate-500 text-xs">Evaluated using FAANG calibration rubrics.</p>
                  </div>
                  <div className="flex items-center space-x-3 bg-indigo-50 border border-indigo-100 px-5 py-3 rounded-2xl shrink-0">
                    <div className="text-center">
                      <span className="text-4xl font-black font-display text-indigo-600">{evaluation.overallScore}%</span>
                      <span className="text-xs text-indigo-500 font-semibold block">Combined Rating</span>
                    </div>
                  </div>
                </div>

                {/* Score breakdown bar charts or list */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
                  <h4 className="font-bold text-slate-800 text-sm md:text-base border-b border-slate-100 pb-2">Rubric Calibration</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {evaluation.dimensionScores.map((ds, index) => (
                      <div key={index} className="bg-slate-50 border border-slate-100 rounded-xl p-4 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-slate-700">{ds.name}</span>
                          <span className="text-xs font-bold text-indigo-600">{ds.score}/5</span>
                        </div>
                        <p className="text-[11px] text-slate-500 leading-relaxed">{ds.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Strengths & suggestions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-3">
                    <h4 className="font-bold text-slate-800 text-sm flex items-center space-x-1.5">
                      <Check className="w-4 h-4 text-emerald-500" />
                      <span>Key Highlights</span>
                    </h4>
                    <ul className="space-y-2">
                      {evaluation.strengths.map((str, i) => (
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
                      <span>Optimizations</span>
                    </h4>
                    <ul className="space-y-2">
                      {evaluation.improvements.map((imp, i) => (
                        <li key={i} className="text-xs text-slate-600 leading-relaxed flex items-start space-x-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                          <span>{imp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Suggested Optimal Solution Block */}
                {evaluation.suggestedCodeSolution && (
                  <div className="bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 shadow-sm flex flex-col">
                    <div className="bg-slate-950 border-b border-slate-800 px-4 py-2.5 flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-300 flex items-center space-x-1.5">
                        <BookMarked className="w-4 h-4 text-indigo-400" />
                        <span>Recommended Optimal Reference Solution</span>
                      </span>
                    </div>
                    <div className="p-4 overflow-x-auto font-mono text-xs text-indigo-300 bg-slate-950/70 leading-relaxed">
                      <pre className="whitespace-pre">{evaluation.suggestedCodeSolution}</pre>
                    </div>
                  </div>
                )}

                {/* Reset or change prompt */}
                <div className="flex space-x-3">
                  <button
                    onClick={handleReset}
                    className="flex-1 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center justify-center space-x-1.5 transition"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Practice Next Challenge</span>
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
    </div>
  );
}
