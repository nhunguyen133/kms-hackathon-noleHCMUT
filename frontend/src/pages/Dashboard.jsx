import React, { useEffect, useState } from 'react';
import clsx from 'clsx';
import { 
  BookOpen, TrendingUp, Clock, Award, ChevronRight, Sparkles, AlertTriangle, Users, Plus, PlayCircle
} from 'lucide-react';
import api from '../api/axios';
import Button from '../components/Button';
import { Link, useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [catalogCourses, setCatalogCourses] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [atRiskStudents, setAtRiskStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isInstructor = user.role === 'instructor';
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const { data: catalog } = await api.get('/courses');
        setCatalogCourses(catalog);

        if (isInstructor) {
          const { data: riskData } = await api.get('/early-warning/at-risk');
          setAtRiskStudents(riskData);
        } else {
          const { data: enrolled } = await api.get('/courses/enrolled');
          setEnrolledCourses(enrolled);
        }
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [isInstructor]);

  const studentStats = [
    { label: 'Active Courses', value: enrolledCourses.length, icon: BookOpen, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
    { label: 'Study Streak', value: '5 days', icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: 'Time Spent', value: '12.5 hrs', icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { label: 'Points Earned', value: '1,250', icon: Award, color: 'text-purple-400', bg: 'bg-purple-500/10' },
  ];

  const instructorStats = [
    { label: 'My Courses', value: catalogCourses.filter(c => c.teacher_id === user.id).length, icon: BookOpen, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
    { label: 'Total Students', value: '128', icon: Users, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: 'At-Risk Students', value: atRiskStudents.length, icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-500/10' },
  ];

  const stats = isInstructor ? instructorStats : studentStats;
  const recentCourse = enrolledCourses.length > 0 ? enrolledCourses[0] : null;

  const handleEnroll = async (courseId) => {
    try {
      await api.post(`/courses/${courseId}/enroll`);
      navigate(`/courses/${courseId}`);
    } catch(err) {
      console.error(err);
      alert("Failed to enroll");
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="space-y-2 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            Welcome back, {user.name?.split(' ')[0]}! <Sparkles className="text-amber-400" />
          </h1>
          <p className="text-slate-400">
            {isInstructor ? "Here's an overview of your teaching metrics." : "You're making great progress. Keep it up!"}
          </p>
        </div>
        {isInstructor && (
          <Button variant="primary" onClick={() => navigate('/instructor/courses/new')}>
            <Plus size={20} /> Create Course
          </Button>
        )}
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="glass p-6 rounded-2xl space-y-3">
            <div className={clsx("w-12 h-12 rounded-xl flex items-center justify-center", stat.bg, stat.color)}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-slate-400 text-sm font-medium">{stat.label}</p>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className={clsx("grid gap-8", isInstructor ? "grid-cols-1 lg:grid-cols-3" : "grid-cols-1")}>
        
        {/* Main Section */}
        <section className={clsx("space-y-8", isInstructor ? "lg:col-span-2" : "col-span-1")}>
          
          {/* STUDENT ONLY: Continue Learning Banner */}
          {!isInstructor && recentCourse && (
            <div className="glass p-8 rounded-3xl border-indigo-500/20 bg-indigo-900/10 flex items-center justify-between shadow-[0_0_40px_rgba(99,102,241,0.05)]">
              <div className="space-y-3">
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                  <PlayCircle size={14} /> Jump back in
                </span>
                <h2 className="text-2xl font-bold text-white">{recentCourse.title}</h2>
                <div className="flex items-center gap-4 text-sm text-slate-400">
                  <span>Next: Advanced Concepts</span>
                  <span>•</span>
                  <span>45% Complete</span>
                </div>
              </div>
              <Link to={`/courses/${recentCourse.id}`}>
                <Button variant="primary" className="py-3 px-8 shadow-indigo-500/20">
                  Continue
                </Button>
              </Link>
            </div>
          )}

          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">{isInstructor ? 'Manage Courses' : 'Explore Catalog'}</h2>
            <Link to={isInstructor ? '#' : '/courses'}>
              <Button variant="ghost" className="text-indigo-400 hover:text-indigo-300">
                View All <ChevronRight size={16} />
              </Button>
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => <div key={i} className="glass h-64 rounded-2xl animate-pulse" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {catalogCourses.length > 0 ? (
                // If instructor, show only their courses. If student, show catalog.
                catalogCourses
                  .filter(c => isInstructor ? c.teacher_id === user.id : true)
                  .map((course) => {
                    const isEnrolled = enrolledCourses.some(ec => ec.id === course.id);
                    return (
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
                            {isInstructor ? (
                              <Link to={`/instructor/courses/${course.id}/edit`} className="w-full">
                                <Button variant="secondary" className="w-full py-2">Edit Course</Button>
                              </Link>
                            ) : (
                              isEnrolled ? (
                                <Link to={`/courses/${course.id}`} className="w-full">
                                  <Button variant="secondary" className="w-full py-2">Go to Course</Button>
                                </Link>
                              ) : (
                                <Button variant="outline" className="w-full py-2" onClick={() => handleEnroll(course.id)}>Enroll Now</Button>
                              )
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })
              ) : (
                <div className="col-span-full glass p-12 text-center space-y-4">
                  <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto text-slate-500">
                    <BookOpen size={32} />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-white">No courses found</h3>
                    <p className="text-slate-500">
                      {isInstructor ? "You haven't created any courses yet." : "There are no courses available in the catalog."}
                    </p>
                  </div>
                  {isInstructor && <Button variant="primary" onClick={() => navigate('/instructor/courses/new')}>Create First Course</Button>}
                </div>
              )}
            </div>
          )}
        </section>

        {/* Early Warning Section (Instructor Only) */}
        {isInstructor && (
          <section className="space-y-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <AlertTriangle className="text-amber-400" /> Early Warning
            </h2>
            <div className="glass rounded-2xl p-6 space-y-4">
              <p className="text-sm text-slate-400 border-b border-slate-800 pb-4">
                Students requiring immediate attention based on their recent quiz performance and weak topics.
              </p>
              
              {loading ? (
                 <div className="space-y-3">
                   {[1, 2, 3].map(i => <div key={i} className="h-16 bg-slate-800 rounded-xl animate-pulse" />)}
                 </div>
              ) : atRiskStudents.length > 0 ? (
                <div className="space-y-3">
                  {atRiskStudents.map((student) => (
                    <div key={student.user_id} className="bg-slate-800/50 border border-slate-700 p-4 rounded-xl space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-bold text-white">{student.name}</p>
                          <p className="text-xs text-slate-500">{student.email}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-bold text-amber-400 uppercase">Avg Score</p>
                          <p className="text-lg font-bold text-white">{Math.round(student.avg_score)}%</p>
                        </div>
                      </div>
                      
                      {student.weak_topics?.length > 0 && (
                        <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-700">
                          {student.weak_topics.map(topic => (
                            <span key={topic} className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-red-500/20 text-red-400 border border-red-500/30">
                              {topic}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Sparkles size={24} />
                  </div>
                  <p className="text-slate-300 font-medium">All clear!</p>
                  <p className="text-sm text-slate-500">No students are currently marked as at-risk.</p>
                </div>
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
