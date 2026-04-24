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
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const { data: courseData } = await api.get(`/courses/${courseId}`);
      setCourse(courseData);

      const { data: lessonsData } = await api.get(`/lessons?courseId=${courseId}`);
      setLessons(lessonsData);
    } catch (err) {
      console.error("Failed to fetch course data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [courseId]);

  if (loading) return <div className="flex items-center justify-center h-[60vh]"><RefreshCw className="animate-spin text-indigo-500" size={48} /></div>;

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-left-4 duration-700 pb-12">
      <Link to="/dashboard" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
        <ArrowLeft size={16} /> Back to Dashboard
      </Link>

      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">{course?.subject || 'Course'}</span>
          <h1 className="text-4xl font-bold text-white">{course?.title}</h1>
          <p className="text-slate-400 max-w-2xl">{course?.description}</p>
        </div>
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

      {/* Quick Actions Bar - Only show if there are lessons */}
      {lessons.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center gap-4 p-6 glass rounded-2xl border border-indigo-500/20 shadow-[0_0_40px_rgba(79,70,229,0.1)]">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <BrainCircuit className="text-indigo-400" /> Ready to test your knowledge?
            </h3>
            <p className="text-sm text-slate-400">Take the adaptive quiz for this course.</p>
          </div>
          <Link to={`/quiz/${lessons[0].id}`} className="w-full sm:w-auto">
            <Button variant="primary" className="w-full sm:w-auto py-3 px-8 text-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-lg shadow-indigo-500/25 border-none">
              Take Adaptive Quiz
            </Button>
          </Link>
        </div>
      )}

      <div className="space-y-6 pt-4">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Sparkles className="text-indigo-400" size={24} /> Course Curriculum
        </h2>
        
        <div className="space-y-4">
          {lessons.length === 0 ? (
            <div className="text-center py-12 glass rounded-2xl">
              <p className="text-slate-400">No lessons available in this course yet.</p>
            </div>
          ) : lessons.map((lesson, i) => {
            return (
              <Link 
                to={`/lessons/${lesson.id}`} 
                key={lesson.id} 
                className="block group"
              >
                <div className="glass p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-indigo-500/30 hover:bg-indigo-500/5 transition-all duration-300">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center ring-4 ring-slate-950 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                      <PlayCircle size={24} />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-400 bg-slate-800 px-2 py-1 rounded-md group-hover:text-slate-300">Lesson {i + 1}</span>
                        <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">{lesson.topic}</span>
                      </div>
                      <h3 className="text-xl font-bold text-white group-hover:text-indigo-300 transition-colors">{lesson.title}</h3>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button variant="secondary" className="w-full sm:w-auto flex items-center gap-2 pointer-events-none">
                      Watch Lesson
                    </Button>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
