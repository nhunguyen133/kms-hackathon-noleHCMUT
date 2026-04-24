import React, { useState } from 'react';
import clsx from 'clsx';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, Mail, Lock, User, Sparkles, GraduationCap, Briefcase } from 'lucide-react';
import api from '../api/axios';
import Button from '../components/Button';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await api.post('/auth/register', formData);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-900/20 via-slate-900 to-slate-900">
      <div className="w-full max-w-md glass p-8 rounded-2xl shadow-2xl space-y-8 animate-in fade-in zoom-in duration-500">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-600/20 text-indigo-400 mb-4 ring-1 ring-indigo-500/20">
            <UserPlus size={32} />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Join ThinkFirst</h1>
          <p className="text-slate-400">Start your active learning journey</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-6">
          <div className="space-y-4">
            <div className="relative group">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={20} />
              <input
                type="text"
                placeholder="Full name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-3 pl-11 pr-4 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
              />
            </div>
            <div className="relative group">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={20} />
              <input
                type="email"
                placeholder="Email address"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-3 pl-11 pr-4 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
              />
            </div>
            <div className="relative group">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={20} />
              <input
                type="password"
                placeholder="Password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                required
                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-3 pl-11 pr-4 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4 pt-2">
              <button
                type="button"
                onClick={() => setFormData({...formData, role: 'student'})}
                className={clsx(
                  "p-4 rounded-xl border flex flex-col items-center gap-2 transition-all",
                  formData.role === 'student' 
                    ? "bg-indigo-600/20 border-indigo-500 text-indigo-400" 
                    : "bg-slate-800/50 border-slate-700 text-slate-500 hover:border-slate-600"
                )}
              >
                <GraduationCap size={24} />
                <span className="text-sm font-medium">Student</span>
              </button>
              <button
                type="button"
                onClick={() => setFormData({...formData, role: 'instructor'})}
                className={clsx(
                  "p-4 rounded-xl border flex flex-col items-center gap-2 transition-all",
                  formData.role === 'instructor' 
                    ? "bg-indigo-600/20 border-indigo-500 text-indigo-400" 
                    : "bg-slate-800/50 border-slate-700 text-slate-500 hover:border-slate-600"
                )}
              >
                <Briefcase size={24} />
                <span className="text-sm font-medium">Instructor</span>
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full py-3" loading={loading}>
            Create Account
          </Button>
        </form>

        <p className="text-center text-slate-400 text-sm">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-medium underline underline-offset-4">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
