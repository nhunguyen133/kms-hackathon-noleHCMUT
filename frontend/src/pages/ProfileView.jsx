import React, { useEffect, useState } from 'react';
import { User, Mail, Target, Book, Brain, Flame, Calendar, Save, RefreshCw } from 'lucide-react';
import api from '../api/axios';
import Button from '../components/Button';
import clsx from 'clsx';

const ProfileView = () => {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    learning_style: '',
    goals: '',
    weekly_study_goal: 5,
    weak_topics: ''
  });

  const fetchProfile = async () => {
    try {
      const { data } = await api.get('/profile');
      setProfileData(data);
      setFormData({
        name: data.name || '',
        learning_style: data.profile?.learning_style || '',
        goals: data.profile?.goals || '',
        weekly_study_goal: data.profile?.weekly_study_goal || 5,
        weak_topics: data.profile?.weak_topics ? data.profile.weak_topics.join(', ') : ''
      });
    } catch (err) {
      console.error("Failed to fetch profile:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');
    
    try {
      // Convert comma-separated string back to array
      const weakTopicsArray = formData.weak_topics
        .split(',')
        .map(t => t.trim())
        .filter(t => t.length > 0);

      const payload = {
        name: formData.name,
        learning_style: formData.learning_style,
        goals: formData.goals,
        weekly_study_goal: parseInt(formData.weekly_study_goal) || 5,
        weak_topics: weakTopicsArray
      };

      const { data } = await api.put('/profile', payload);
      setProfileData(data);
      
      // Update local storage user info
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      localStorage.setItem('user', JSON.stringify({ ...currentUser, name: data.name }));
      
      setSuccessMsg('Profile updated successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.error("Failed to update profile:", err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-[60vh]"><RefreshCw className="animate-spin text-indigo-500" size={48} /></div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
      <header className="space-y-2">
        <h1 className="text-4xl font-bold text-white flex items-center gap-3">
          <User className="text-indigo-400" size={36} /> My Profile
        </h1>
        <p className="text-slate-400">Manage your personal information and learning preferences.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column - Stats & Read Only Info */}
        <div className="space-y-6">
          <div className="glass p-6 rounded-2xl flex flex-col items-center text-center space-y-4">
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-indigo-500/30">
              {profileData?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{profileData?.name}</h2>
              <p className="text-sm text-slate-400 capitalize">{profileData?.role}</p>
            </div>
            <div className="w-full flex items-center gap-2 px-4 py-2 bg-slate-800/50 rounded-xl justify-center text-slate-300 text-sm">
              <Mail size={16} className="text-indigo-400" />
              {profileData?.email}
            </div>
          </div>

          <div className="glass p-6 rounded-2xl space-y-4">
            <h3 className="font-bold text-white mb-2">Learning Stats</h3>
            <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl">
              <div className="flex items-center gap-3 text-slate-300">
                <Flame size={20} className="text-orange-500" /> Streak
              </div>
              <span className="font-bold text-white">{profileData?.profile?.streak_count || 0} days</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl">
              <div className="flex items-center gap-3 text-slate-300">
                <Calendar size={20} className="text-emerald-500" /> Last Active
              </div>
              <span className="font-bold text-white">
                {profileData?.profile?.last_active_date 
                  ? new Date(profileData.profile.last_active_date).toLocaleDateString() 
                  : 'Never'}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column - Edit Form */}
        <div className="md:col-span-2 glass p-6 md:p-8 rounded-3xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-indigo-400 border-b border-slate-800 pb-2">Personal Information</h3>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-bold text-purple-400 border-b border-slate-800 pb-2 mt-6">Learning Preferences</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Learning Style</label>
                  <div className="relative">
                    <Brain className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <select
                      name="learning_style"
                      value={formData.learning_style}
                      onChange={handleInputChange}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all appearance-none"
                    >
                      <option value="">Select style...</option>
                      <option value="Visual">Visual</option>
                      <option value="Auditory">Auditory</option>
                      <option value="Reading/Writing">Reading/Writing</option>
                      <option value="Kinesthetic">Kinesthetic</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Weekly Goal (Hours)</label>
                  <div className="relative">
                    <Target className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input
                      type="number"
                      name="weekly_study_goal"
                      min="1"
                      max="100"
                      value={formData.weekly_study_goal}
                      onChange={handleInputChange}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Primary Goal</label>
                <textarea
                  name="goals"
                  value={formData.goals}
                  onChange={handleInputChange}
                  rows={2}
                  placeholder="What do you want to achieve?"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Weak Topics (Comma separated)</label>
                <div className="relative">
                  <Book className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input
                    type="text"
                    name="weak_topics"
                    value={formData.weak_topics}
                    onChange={handleInputChange}
                    placeholder="e.g. Calculus, Physics, Programming"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between">
              {successMsg ? (
                <span className="text-emerald-400 text-sm font-medium animate-in fade-in">{successMsg}</span>
              ) : (
                <span /> // Spacer
              )}
              <Button type="submit" variant="primary" className="px-8" loading={saving}>
                <Save size={18} className="mr-2" />
                Save Changes
              </Button>
            </div>
            
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfileView;
