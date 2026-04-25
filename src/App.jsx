import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminForms from './pages/AdminForms';
import AdminSubmissions from './pages/AdminSubmissions';
import AdminRewards from './pages/AdminRewards';
import StudentForm from './pages/StudentForm';
import AdminLayout from './components/AdminLayout';

function App() {
  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={<AdminLogin />} />
        
        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="forms" element={<AdminForms />} />
          <Route path="submissions/:formId" element={<AdminSubmissions />} />
          <Route path="rewards/:formId" element={<AdminRewards />} />
        </Route>

        {/* Public Routes */}
        <Route path="/form/:slug" element={<StudentForm />} />
        
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
