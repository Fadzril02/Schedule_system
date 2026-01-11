import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Import your pages
import AdminDashboard from './AdminDashboard';
import StudentDashboard from './StudentDashboard';
import Login from './Login'; // <--- Ensure this file exists

const App = () => {
  return (
    <Router>
      <div className="app-container">
        <Routes>
          {/* 1. DEFAULT ROUTE: The Login/Email Entry Page */}
          <Route path="/" element={<Login />} />

          {/* 2. ADMIN ROUTE: The Main Dashboard */}
          <Route path="/admin-dashboard" element={<AdminDashboard />} />

          {/* 3. STUDENT ROUTE: View specific student schedule */}
          <Route path="/student-view/:id" element={<StudentDashboard />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;