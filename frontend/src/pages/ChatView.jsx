import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Bot, User, Trash2, BookOpen } from 'lucide-react';
import api from '../api/axios';
import clsx from 'clsx';
import Button from '../components/Button';

const ChatView = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Context selection states
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [lessons, setLessons] = useState([]);
  const [selectedLesson, setSelectedLesson] = useState('');

  // Keep the same session ID per page load so the backend retains context
  const sessionId = useRef(crypto.randomUUID());
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Fetch enrolled courses for context selection
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const { data } = await api.get('/courses/enrolled');
        setCourses(data);
      } catch (err) {
        console.error("Failed to fetch courses:", err);
      }
    };
    fetchCourses();
  }, []);

  // Fetch lessons when a course is selected
  useEffect(() => {
    const fetchLessons = async () => {
      if (!selectedCourse) {
        setLessons([]);
        setSelectedLesson('');
        return;
      }
      try {
        const { data } = await api.get(`/lessons?courseId=${selectedCourse}`);
        setLessons(data);
      } catch (err) {
        console.error("Failed to fetch lessons:", err);
      }
    };
    fetchLessons();
  }, [selectedCourse]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const payload = {
        message: input,
        sessionId: sessionId.current,
      };
      if (selectedLesson) {
        payload.lessonId = selectedLesson;
      }

      const { data } = await api.post('/chat', payload);
      
      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }]);
    } catch (err) {
      console.error("Failed to send message:", err);
      setMessages((prev) => [...prev, { 
        role: 'system', 
        content: 'There was an error communicating with the AI Tutor. Please try again.' 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    if (window.confirm('Are you sure you want to start a new chat session?')) {
      setMessages([]);
      sessionId.current = crypto.randomUUID();
    }
  };

  return (
    <div className="max-w-5xl mx-auto h-[calc(100vh-120px)] flex flex-col glass rounded-3xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <header className="p-6 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/50 backdrop-blur-md z-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 ring-1 ring-indigo-500/50">
            <Bot size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              Socratic AI Tutor <Sparkles className="text-indigo-400" size={16} />
            </h1>
            <p className="text-sm text-slate-400">I won't give you the answers, but I'll help you find them.</p>
          </div>
        </div>
        <Button variant="ghost" className="text-slate-400 hover:text-red-400" onClick={handleClearChat}>
          <Trash2 size={18} /> New Session
        </Button>
      </header>

      {/* Context Selection Bar */}
      <div className="px-6 py-3 bg-slate-800/30 border-b border-slate-800 flex flex-col sm:flex-row gap-4 items-center z-10">
        <div className="flex items-center gap-2 text-sm text-slate-400 w-full sm:w-auto flex-shrink-0">
          <BookOpen size={16} className="text-indigo-400" />
          <span>Context:</span>
        </div>
        <select 
          className="bg-slate-900 border border-slate-700 text-slate-300 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:max-w-xs p-2.5 outline-none"
          value={selectedCourse}
          onChange={(e) => setSelectedCourse(e.target.value)}
        >
          <option value="">General Chat (No specific course)</option>
          {courses.map(course => (
            <option key={course.id} value={course.id}>{course.title}</option>
          ))}
        </select>

        {selectedCourse && (
          <select 
            className="bg-slate-900 border border-slate-700 text-slate-300 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:max-w-xs p-2.5 outline-none"
            value={selectedLesson}
            onChange={(e) => setSelectedLesson(e.target.value)}
          >
            <option value="">Whole Course</option>
            {lessons.map(lesson => (
              <option key={lesson.id} value={lesson.id}>{lesson.title}</option>
            ))}
          </select>
        )}
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-auto p-6 space-y-6">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-6">
            <div className="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center text-indigo-400 ring-8 ring-slate-800/50">
              <Sparkles size={40} />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white">How can I help you think today?</h2>
              <p className="text-slate-400">
                Ask me about a concept you're struggling with, a problem you can't solve, or a topic you want to explore deeper.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 justify-center">
              {['Explain Newton\'s laws', 'I\'m stuck on a math problem', 'How does photosynthesis work?'].map((suggestion, i) => (
                <button 
                  key={i}
                  onClick={() => setInput(suggestion)}
                  className="px-4 py-2 rounded-full border border-slate-700 bg-slate-800/50 text-slate-300 text-sm hover:border-indigo-500 hover:text-indigo-400 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg, i) => (
            <div 
              key={i} 
              className={clsx(
                "flex gap-4 max-w-[85%] animate-in fade-in slide-in-from-bottom-2",
                msg.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto",
                msg.role === 'system' && "mx-auto max-w-full justify-center"
              )}
            >
              {msg.role !== 'system' && (
                <div className={clsx(
                  "w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center mt-1",
                  msg.role === 'user' ? "bg-indigo-600/20 text-indigo-400 ring-1 ring-indigo-500/30" : "bg-slate-800 text-slate-300 ring-1 ring-slate-700"
                )}>
                  {msg.role === 'user' ? <User size={20} /> : <Bot size={20} />}
                </div>
              )}
              
              <div className={clsx(
                "p-4 rounded-2xl",
                msg.role === 'user' && "bg-indigo-600 text-white rounded-tr-sm shadow-lg shadow-indigo-500/10",
                msg.role === 'assistant' && "bg-slate-800 text-slate-200 rounded-tl-sm border border-slate-700 shadow-xl",
                msg.role === 'system' && "bg-red-500/10 text-red-400 border border-red-500/20 text-sm text-center"
              )}>
                {msg.role === 'assistant' ? (
                  <div className="prose prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-pre:bg-slate-900 prose-pre:border prose-pre:border-slate-700" dangerouslySetInnerHTML={{ 
                    // Very simple markdown replacement for bold and code blocks, since we don't have a markdown parser installed
                    __html: msg.content
                      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                      .replace(/```([\s\S]*?)```/g, '<pre className="p-4 rounded-lg bg-slate-900 my-2 overflow-x-auto"><code>$1</code></pre>')
                      .replace(/\n/g, '<br/>')
                  }} />
                ) : (
                  msg.content
                )}
              </div>
            </div>
          ))
        )}
        
        {loading && (
          <div className="flex gap-4 max-w-[85%] mr-auto animate-in fade-in">
            <div className="w-10 h-10 rounded-xl bg-slate-800 flex-shrink-0 flex items-center justify-center ring-1 ring-slate-700 text-slate-300">
              <Bot size={20} />
            </div>
            <div className="p-4 rounded-2xl rounded-tl-sm bg-slate-800 border border-slate-700 flex items-center gap-2">
              <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
              <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
              <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" />
            </div>
          </div>
        )}
        <div ref={chatEndRef} className="h-4" />
      </div>

      {/* Input Area */}
      <div className="p-6 bg-slate-900/80 border-t border-slate-800 backdrop-blur-xl">
        <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto relative group">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            placeholder="Type your question here... I'll help you find the answer."
            className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl py-4 pl-6 pr-16 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 focus:bg-slate-800 transition-all shadow-inner disabled:opacity-50"
          />
          <button 
            type="submit"
            disabled={!input.trim() || loading}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl disabled:opacity-50 disabled:hover:bg-indigo-600 transition-colors shadow-md"
          >
            <Send size={20} className={clsx(loading && "animate-pulse")} />
          </button>
        </form>
        <p className="text-center text-xs text-slate-500 mt-3">
          ThinkFirst AI uses Socratic questioning. It will guide you, not just give you the answer.
        </p>
      </div>
    </div>
  );
};

export default ChatView;
