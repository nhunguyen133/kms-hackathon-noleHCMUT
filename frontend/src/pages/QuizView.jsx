import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  CheckCircle2, 
  XCircle, 
  ChevronRight, 
  Trophy,
  BrainCircuit,
  Timer,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';
import api from '../api/axios';
import Button from '../components/Button';
import clsx from 'clsx';

const QuizView = () => {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quizState, setQuizState] = useState(null); // Contains { question, sessionState }
  const [selectedOption, setSelectedOption] = useState(null);
  const [feedback, setFeedback] = useState(null); // { isCorrect, correctAnswer }
  const [submitting, setSubmitting] = useState(false);
  const [summary, setSummary] = useState(null);

  const startQuiz = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get(`/quiz/${lessonId}/start`);
      setQuizState(data);
    } catch (err) {
      console.error("Failed to start quiz:", err);
      setError(err.response?.data?.error || "This lesson does not have a quiz set up yet.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    startQuiz();
  }, [lessonId]);

  const handleSubmit = async () => {
    if (!selectedOption || submitting) return;
    setSubmitting(true);

    try {
      const { data } = await api.post('/quiz/answer', {
        questionId: quizState.question.id,
        answer: selectedOption,
        lessonId,
        sessionState: quizState.sessionState
      });

      setFeedback({
        isCorrect: data.isCorrect,
        correctAnswer: data.correctAnswer
      });

      if (data.done) {
        setSummary(data.summary);
      } else {
        // Prepare next question but wait for user to click "Next"
        setQuizState(prev => ({
          ...prev,
          nextQuestion: data.nextQuestion,
          nextSessionState: data.updatedState
        }));
      }
    } catch (err) {
      console.error("Failed to submit answer:", err);
      alert("Error submitting answer.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleNext = () => {
    setQuizState({
      question: quizState.nextQuestion,
      sessionState: quizState.nextSessionState
    });
    setSelectedOption(null);
    setFeedback(null);
  };

  if (loading) return <div className="flex items-center justify-center h-[60vh]"><RefreshCw className="animate-spin text-indigo-500" size={48} /></div>;

  if (error) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="glass p-12 rounded-3xl text-center space-y-6 max-w-md">
          <div className="w-20 h-20 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto ring-8 ring-red-500/5">
            <AlertTriangle size={40} />
          </div>
          <h2 className="text-2xl font-bold text-white">Oops!</h2>
          <p className="text-slate-400">{error}</p>
          <Button variant="primary" onClick={() => navigate(-1)} className="w-full">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  if (summary) {
    return (
      <div className="max-w-2xl mx-auto glass p-12 rounded-3xl text-center space-y-8 animate-in zoom-in duration-500">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-indigo-600/20 text-indigo-400 ring-8 ring-indigo-500/10">
          <Trophy size={48} />
        </div>
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-white">Quiz Completed!</h1>
          <p className="text-slate-400 text-lg">Great job challenging yourself today.</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700">
            <p className="text-sm text-slate-500 font-medium uppercase tracking-wider">Your Score</p>
            <p className="text-3xl font-bold text-white">{Math.round(summary.score)}%</p>
          </div>
          <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700">
            <p className="text-sm text-slate-500 font-medium uppercase tracking-wider">Correct</p>
            <p className="text-3xl font-bold text-emerald-400">{summary.correctCount} / {summary.totalQuestions}</p>
          </div>
        </div>

        {summary.weakTopics.length > 0 && (
          <div className="bg-amber-500/10 border border-amber-500/20 p-6 rounded-2xl space-y-3 text-left">
            <h3 className="text-amber-400 font-bold flex items-center gap-2 m-0 text-sm uppercase"><BrainCircuit size={18} /> Focused Revision Needed</h3>
            <p className="text-xs text-slate-400 m-0">Based on your answers, we've identified topics that need a bit more practice:</p>
            <div className="flex flex-wrap gap-2 pt-1">
              {summary.weakTopics.map(topic => (
                <span key={topic} className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold border border-amber-500/30">
                  {topic}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-4">
          <Button variant="secondary" className="flex-1 py-4" onClick={() => navigate('/dashboard')}>
            Exit to Dashboard
          </Button>
          <Button variant="primary" className="flex-1 py-4" onClick={() => navigate(-1)}>
            Back to Lesson
          </Button>
        </div>
      </div>
    );
  }

  const { question, sessionState } = quizState;
  const progress = (sessionState.answers.length / 10) * 100;

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
            <BrainCircuit size={20} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Adaptive Quiz</h2>
            <div className="flex items-center gap-2">
              <span className="text-white font-bold">Level:</span>
              <span className={clsx(
                "px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                sessionState.currentDifficulty === 'easy' && "bg-emerald-500/20 text-emerald-400",
                sessionState.currentDifficulty === 'medium' && "bg-amber-500/20 text-amber-400",
                sessionState.currentDifficulty === 'hard' && "bg-red-500/20 text-red-400",
              )}>
                {sessionState.currentDifficulty}
              </span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-500 font-bold uppercase mb-1">Progress</p>
          <div className="w-32 h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
            <div 
              className="h-full bg-indigo-500 transition-all duration-500" 
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      <div className="glass p-8 rounded-3xl space-y-8 border-indigo-500/10 shadow-indigo-500/5 shadow-2xl">
        <div className="space-y-4">
          <span className="text-indigo-400 font-bold text-sm uppercase tracking-wider">{question.topic}</span>
          <h1 className="text-2xl md:text-3xl font-bold text-white leading-tight">
            {question.content}
          </h1>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {question.options.map((option) => {
            const isSelected = selectedOption === option.key;
            const isCorrectFeedback = feedback?.isCorrect && isSelected;
            const isWrongFeedback = feedback && !feedback.isCorrect && isSelected;
            const isActuallyCorrect = feedback && !feedback.isCorrect && option.key === feedback.correctAnswer;

            return (
              <button
                key={option.key}
                disabled={!!feedback}
                onClick={() => setSelectedOption(option.key)}
                className={clsx(
                  "p-4 rounded-2xl text-left border transition-all duration-200 flex items-center justify-between group",
                  isSelected && !feedback && "bg-indigo-600/10 border-indigo-500 text-white",
                  !isSelected && !feedback && "bg-slate-800/40 border-slate-700 text-slate-300 hover:bg-slate-800 hover:border-slate-600",
                  isCorrectFeedback && "bg-emerald-500/10 border-emerald-500 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.1)]",
                  isWrongFeedback && "bg-red-500/10 border-red-500 text-red-400",
                  isActuallyCorrect && "bg-emerald-500/10 border-emerald-500/50 text-emerald-400",
                  feedback && !isSelected && !isActuallyCorrect && "opacity-40"
                )}
              >
                <div className="flex items-center gap-4">
                  <span className={clsx(
                    "w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm border transition-colors",
                    isSelected ? "bg-indigo-500 text-white border-indigo-400" : "bg-slate-900 text-slate-500 border-slate-700 group-hover:border-slate-500"
                  )}>
                    {option.key}
                  </span>
                  <span className="font-medium">{option.text}</span>
                </div>
                {isCorrectFeedback && <CheckCircle2 size={24} className="text-emerald-500" />}
                {isWrongFeedback && <XCircle size={24} className="text-red-500" />}
              </button>
            );
          })}
        </div>

        {!feedback ? (
          <Button 
            className="w-full py-4 text-lg" 
            disabled={!selectedOption} 
            onClick={handleSubmit}
            loading={submitting}
          >
            Submit Answer
          </Button>
        ) : (
          <Button 
            className="w-full py-4 text-lg bg-emerald-600 hover:bg-emerald-700" 
            onClick={handleNext}
          >
            Next Question <ChevronRight size={20} />
          </Button>
        )}
      </div>
    </div>
  );
};

export default QuizView;
