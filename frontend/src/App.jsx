import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CourseDetail from './pages/CourseDetail';
import LessonView from './pages/LessonView';
import QuizView from './pages/QuizView';
import CourseManager from './pages/CourseManager';
import ChatView from './pages/ChatView';
import MyCourses from './pages/MyCourses';
import MainLayout from './layouts/MainLayout';

// Simple Protected Route wrapper
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" replace />;
  return <MainLayout>{children}</MainLayout>;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Protected Application Routes */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/courses" 
          element={
            <ProtectedRoute>
              <MyCourses />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/courses/:courseId" 
          element={
            <ProtectedRoute>
              <CourseDetail />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/lessons/:lessonId" 
          element={
            <ProtectedRoute>
              <LessonView />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/quiz/:lessonId" 
          element={
            <ProtectedRoute>
              <QuizView />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/chat" 
          element={
            <ProtectedRoute>
              <ChatView />
            </ProtectedRoute>
          } 
        />

        {/* Instructor Routes */}
        <Route 
          path="/instructor/courses/new" 
          element={
            <ProtectedRoute>
              <CourseManager />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/instructor/courses/:courseId/edit" 
          element={
            <ProtectedRoute>
              <CourseManager />
            </ProtectedRoute>
          } 
        />

        {/* Redirects */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
