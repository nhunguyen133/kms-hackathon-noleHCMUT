import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  CheckCircle2, 
  Circle, 
  PlayCircle, 
  Lock, 
  ArrowLeft,
  Sparkles,
  RefreshCw,
  BrainCircuit,
  Play
} from 'lucide-react';
import api from '../api/axios';
import Button from '../components/Button';
import clsx from 'clsx';

const CourseDetail = () => {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [learningPath, setLearningPath] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recalculating, setRecalculating] = useState(false);

  const fetchData = async () => {
    try {
      const { data: courses } = await api.get('/courses');
      const found = courses.find(c => c.id === courseId);
      setCourse(found);

      const { data: path } = await api.get(`/learning-path/${courseId}`);
      setLearningPath(path);
    } catch (err) {
      console.error("Failed to fetch course data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [courseId]);

  const handleRecalculate = async () => {
    setRecalculating(true);
    try {
      const { data } = await api.post(`/learning-path/${courseId}/recalculate`);
      setLearningPath(data);
    } catch (err) {
      console.error("Failed to recalculate path:", err);
    } finally {
      setRecalculating(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-[60vh]"><RefreshCw className="animate-spin text-indigo-500" size={48} /></div>;

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-left-4 duration-700 pb-12">
      <Link to="/dashboard" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
        <ArrowLeft size={16} /> Back to Dashboard
      </Link>

      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">{course?.subject}</span>
          <h1 className="text-4xl font-bold text-white">{course?.title}</h1>
          <p className="text-slate-400 max-w-2xl">{course?.description}</p>
        </div>
        <Button 
          variant="outline" 
          onClick={handleRecalculate} 
          loading={recalculating}
          className="whitespace-nowrap"
        >
          <RefreshCw size={16} className={clsx(recalculating && "animate-spin")} />
          Recalculate Path
        </Button>
      </header>

      {/* Video Placeholder Section */}
      <div className="w-full aspect-video bg-slate-900 rounded-3xl overflow-hidden relative group border border-slate-800 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-tr from-indigo-900/40 to-slate-900/40 mix-blend-overlay" />
        <img 
          src="https://images.unsplash.com/photo-1610484826967-09c5720778c7?auto=format&fit=crop&q=80&w=2000" 
          alt="Course Video Thumbnail" 
          className="w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity duration-500"
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
          <div className="w-20 h-20 bg-indigo-600/90 text-white rounded-full flex items-center justify-center cursor-pointer hover:bg-indigo-500 hover:scale-110 transition-all shadow-[0_0_50px_rgba(79,70,229,0.5)]">
            <Play size={32} className="ml-2" />
          </div>
          <p className="text-white font-bold text-lg drop-shadow-md">Course Introduction</p>
        </div>
      </div>

      <div className="space-y-6 pt-4">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Sparkles className="text-indigo-400" size={24} /> Your Personalized Path
        </h2>
        
        <div className="space-y-4 relative">
          {/* Timeline Connector */}
          <div className="absolute left-[1.35rem] top-8 bottom-8 w-0.5 bg-slate-800" />

          {learningPath.map((step, i) => {
            const isCurrent = step.status === 'current';
            const isCompleted = step.status === 'completed';
            
            return (
              <div 
                key={step.lesson_id} 
                className={clsx(
                  "relative pl-14 transition-all duration-300",
                  !isCurrent && !isCompleted && "opacity-60"
                )}
              >
                {/* Status Icon */}
                <div className="absolute left-0 top-1/2 -translate-y-1/2 z-10">
                  {isCompleted ? (
                    <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center ring-4 ring-slate-950">
                      <CheckCircle2 size={24} />
                    </div>
                  ) : isCurrent ? (
                    <div className="w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center ring-4 ring-slate-950 shadow-lg shadow-indigo-500/40 animate-pulse">
                      <PlayCircle size={24} />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-slate-800 text-slate-600 flex items-center justify-center ring-4 ring-slate-950">
                      <Lock size={20} />
                    </div>
                  )}
                </div>

                <div className={clsx(
                  "glass p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 group",
                  isCurrent && "border-indigo-500/30 bg-indigo-500/5 shadow-[0_0_30px_rgba(79,70,229,0.05)]"
                )}>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-400 bg-slate-800 px-2 py-1 rounded-md">Step {step.step}</span>
                      <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">{step.topic}</span>
                    </div>
                    <h3 className="text-xl font-bold text-white group-hover:text-indigo-300 transition-colors">{step.title}</h3>
                    {isCurrent && <p className="text-sm text-slate-400">Master this topic to progress further in your path.</p>}
                  </div>
                  
                  {isCurrent && (
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Link to={`/lessons/${step.lesson_id}`}>
                        <Button variant="secondary" className="w-full sm:w-auto flex items-center gap-2">
                          <PlayCircle size={18} /> Watch Lesson
                        </Button>
                      </Link>
                      <Link to={`/quiz/${step.lesson_id}`}>
                        <Button variant="primary" className="w-full sm:w-auto flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 border-none shadow-lg shadow-indigo-500/30">
                          <BrainCircuit size={18} /> Adaptive Quiz
                        </Button>
                      </Link>
                    </div>
                  )}
                  {isCompleted && (
                    <span className="text-sm font-bold text-emerald-400 flex items-center gap-2 bg-emerald-500/10 px-4 py-2 rounded-xl">
                      <CheckCircle2 size={18} /> Completed
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
