import React, { useEffect, useState } from 'react';
import { BookOpen, Search, PlayCircle } from 'lucide-react';
import api from '../api/axios';
import Button from '../components/Button';
import { Link } from 'react-router-dom';

const MyCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEnrolledCourses = async () => {
      try {
        const { data } = await api.get('/courses/enrolled');
        setCourses(data);
      } catch (err) {
        console.error("Failed to fetch enrolled courses:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchEnrolledCourses();
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <BookOpen className="text-indigo-400" /> My Courses
        </h1>
        <p className="text-slate-400">Continue your learning journey.</p>
      </header>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass h-64 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.length > 0 ? (
            courses.map((course) => (
              <div key={course.id} className="glass group overflow-hidden rounded-2xl flex flex-col hover:border-indigo-500/50 transition-all duration-300">
                <div className="h-32 bg-indigo-600/20 flex items-center justify-center group-hover:bg-indigo-600/30 transition-colors">
                  <BookOpen size={48} className="text-indigo-400 group-hover:scale-110 transition-transform duration-500" />
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex-1 space-y-2">
                    <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">{course.subject}</span>
                    <h3 className="text-xl font-bold text-white group-hover:text-indigo-300 transition-colors">{course.title}</h3>
                    <p className="text-slate-400 text-sm line-clamp-2">{course.description}</p>
                  </div>
                  <div className="pt-6 mt-6 border-t border-slate-800 flex items-center justify-between">
                    <div className="flex flex-col w-full space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500">Progress</span>
                        <span className="font-bold text-white">45%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500 w-[45%]" />
                      </div>
                      <Link to={`/courses/${course.id}`} className="mt-2 block">
                        <Button variant="primary" className="w-full py-2 flex items-center justify-center gap-2">
                          <PlayCircle size={16} /> Continue Learning
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full glass p-12 text-center space-y-4">
              <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto text-slate-500">
                <Search size={32} />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white">No courses yet</h3>
                <p className="text-slate-500">You haven't enrolled in any courses. Explore the Dashboard to find new topics.</p>
              </div>
              <Link to="/dashboard">
                <Button variant="primary">Explore Catalog</Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MyCourses;
