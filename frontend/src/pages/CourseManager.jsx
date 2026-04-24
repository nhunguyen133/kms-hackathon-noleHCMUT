import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import clsx from 'clsx';
import { BookOpen, ArrowLeft, Save, Trash2, Plus } from 'lucide-react';
import api from '../api/axios';
import Button from '../components/Button';

const CourseManager = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(courseId);

  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    description: ''
  });
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isEditing) {
      const fetchCourse = async () => {
        try {
          const { data: courses } = await api.get('/courses');
          const found = courses.find(c => c.id === courseId);
          if (found) {
            setFormData({
              title: found.title,
              subject: found.subject,
              description: found.description
            });
          }
          
          // Fetch lessons for this course
          const { data: lessonsData } = await api.get(`/courses/${courseId}/lessons`);
          setLessons(lessonsData);
        } catch (err) {
          console.error("Failed to fetch course details:", err);
        } finally {
          setLoading(false);
        }
      };
      fetchCourse();
    }
  }, [courseId, isEditing]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (isEditing) {
        await api.put(`/courses/${courseId}`, formData);
      } else {
        const { data } = await api.post('/courses', formData);
        navigate(`/instructor/courses/${data.id}/edit`);
      }
    } catch (err) {
      console.error("Failed to save course:", err);
      alert("Error saving course");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this course?")) return;
    try {
      await api.delete(`/courses/${courseId}`);
      navigate('/dashboard');
    } catch (err) {
      console.error("Failed to delete course:", err);
      alert("Error deleting course");
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-400">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-left-4 duration-500">
      <Link to="/dashboard" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
        <ArrowLeft size={16} /> Back to Dashboard
      </Link>

      <header className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <BookOpen className="text-indigo-400" />
          {isEditing ? 'Edit Course' : 'Create New Course'}
        </h1>
        {isEditing && (
          <Button variant="danger" onClick={handleDelete} className="flex items-center gap-2">
            <Trash2 size={16} /> Delete Course
          </Button>
        )}
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <form onSubmit={handleSave} className="glass p-8 rounded-2xl space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Course Title</label>
                <input
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-3 px-4 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  placeholder="e.g. Advanced Calculus"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Subject</label>
                <input
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-3 px-4 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  placeholder="e.g. Mathematics"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-3 px-4 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  placeholder="Brief description of the course..."
                />
              </div>
            </div>

            <Button type="submit" variant="primary" loading={saving} className="w-full py-3">
              <Save size={18} /> {isEditing ? 'Save Changes' : 'Create Course'}
            </Button>
          </form>
        </div>

        {isEditing && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">Lessons</h3>
              <Button variant="ghost" className="text-indigo-400 px-2">
                <Plus size={20} />
              </Button>
            </div>
            
            <div className="space-y-3">
              {lessons.length > 0 ? (
                lessons.map(lesson => (
                  <div key={lesson.id} className="glass p-4 rounded-xl border-l-4 border-l-indigo-500 hover:bg-slate-800/50 transition-colors cursor-pointer">
                    <span className="text-xs font-bold text-indigo-400 uppercase">Topic: {lesson.topic}</span>
                    <h4 className="text-white font-medium line-clamp-1">{lesson.title}</h4>
                  </div>
                ))
              ) : (
                <div className="glass p-6 text-center rounded-xl text-slate-400 text-sm">
                  No lessons added yet. Click + to add one.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseManager;
