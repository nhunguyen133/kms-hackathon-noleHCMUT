import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Send, 
  Sparkles, 
  ChevronLeft,
  GraduationCap,
  MessageSquare
} from 'lucide-react';
import api from '../api/axios';
import Button from '../components/Button';
import clsx from 'clsx';

const LessonView = () => {
  const { lessonId } = useParams();
  const [lesson, setLesson] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef(null);
  const sessionId = useRef(crypto.randomUUID());

  useEffect(() => {
    const fetchLesson = async () => {
      try {
        const { data } = await api.get(`/lessons/${lessonId}`);
        setLesson(data);
      } catch (err) {
        console.error("Failed to fetch lesson:", err);
      }
    };
    fetchLesson();
  }, [lessonId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || chatLoading) return;

    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setChatLoading(true);

    try {
      const { data } = await api.post('/chat', {
        message: input,
        sessionId: sessionId.current,
        lessonId,
        subject: lesson ? `${lesson.topic} - ${lesson.title}` : 'Chưa xác định',
        performanceLevel: 'Trung bình' // Placeholder, có thể tích hợp thực tế sau
      });
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
    } catch (err) {
      console.error("Chat error:", err);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-160px)] flex gap-6">
      {/* Lesson Content */}
      <div className="flex-1 glass rounded-3xl overflow-hidden flex flex-col">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to={-1} className="p-2 rounded-lg hover:bg-slate-800 text-slate-400">
              <ChevronLeft size={20} />
            </Link>
            <div>
              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">{lesson?.topic}</span>
              <h1 className="text-xl font-bold text-white">{lesson?.title}</h1>
            </div>
          </div>
          <Link to={`/quiz/${lessonId}`}>
            <Button variant="primary">Take Quiz</Button>
          </Link>
        </div>
        
        <div className="flex-1 overflow-auto p-8 prose prose-invert max-w-none">
          <div dangerouslySetInnerHTML={{ __html: lesson?.content }} />
          {/* Mock content if none exists */}
          {!lesson?.content && (
            <div className="space-y-6 text-slate-300">
              <p className="text-lg">Welcome to this lesson on <span className="text-white font-bold">{lesson?.topic}</span>.</p>
              <p>In this session, we will explore the core concepts and principles that define this subject. Use the AI Tutor on the right if you have any questions or need clarification on specific points.</p>
              <div className="bg-indigo-600/10 border border-indigo-500/20 p-6 rounded-2xl space-y-3">
                <h3 className="text-indigo-400 flex items-center gap-2 m-0"><GraduationCap size={20} /> Key Learning Objectives</h3>
                <ul className="m-0 list-disc list-inside space-y-1">
                  <li>Understand the fundamental definitions</li>
                  <li>Identify practical applications in real-world scenarios</li>
                  <li>Master the basic problem-solving techniques</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Socratic AI Chat Sidebar */}
      <div className="w-96 glass rounded-3xl flex flex-col overflow-hidden border-indigo-500/10">
        <div className="p-4 border-b border-slate-800 bg-indigo-600/5 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
            <MessageSquare size={18} />
          </div>
          <div>
            <h2 className="font-bold text-white text-sm">Socratic AI Tutor</h2>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-tight">Active Guidance</span>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-500">
                <Sparkles size={24} />
              </div>
              <p className="text-sm text-slate-400">
                Ask me anything about this lesson. I'll help you think through the answers!
              </p>
            </div>
          )}
          {messages.map((msg, i) => (
            <div 
              key={i} 
              className={clsx(
                "max-w-[85%] p-3 rounded-2xl text-sm animate-in fade-in slide-in-from-bottom-2",
                msg.role === 'user' 
                  ? "ml-auto bg-indigo-600 text-white rounded-br-none" 
                  : "mr-auto bg-slate-800 text-slate-200 rounded-bl-none border border-slate-700"
              )}
            >
              {msg.content}
            </div>
          ))}
          {chatLoading && (
            <div className="mr-auto bg-slate-800 p-3 rounded-2xl rounded-bl-none border border-slate-700 flex gap-1">
              <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
              <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
              <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" />
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-800 bg-slate-900/50">
          <div className="relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2.5 pl-4 pr-12 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
            />
            <button 
              type="submit"
              disabled={!input.trim() || chatLoading}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-indigo-400 hover:text-indigo-300 disabled:opacity-50"
            >
              <Send size={18} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LessonView;
