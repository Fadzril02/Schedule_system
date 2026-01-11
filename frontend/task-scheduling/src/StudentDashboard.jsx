import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './StudentPortal.css'; // This will now match AdminDashboard.css

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);

  // Define the grid structure (Rows and Columns)
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const times = ['09:40', '10:00']; // The specific duty slots

  // --- FETCH DATA (ON LOAD) ---
  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      // Use the student-specific route that filters for "Published" status only
      const response = await axios.get("http://localhost:5000/api/student/all-schedules");
      setSchedules(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching schedules:", error);
      setLoading(false);
    }
  };

  // --- HELPER: FIND TASKS FOR SPECIFIC SLOT ---
  // Returns an ARRAY of tasks because multiple students might work at the same time
  const getTasksForSlot = (day, timeLabel) => {
    if (!schedules || schedules.length === 0) return [];

    return schedules.filter((task) => {
      if (!task.day_of_week || !task.start_time) return false;
      const isDayMatch = task.day_of_week === day;
      const isTimeMatch = task.start_time.substring(0, 5) === timeLabel;
      return isDayMatch && isTimeMatch;
    });
  };

  return (
    <div className="dashboard-container">
      
      {/* SIDEBAR NAVIGATION (Identical to Admin) */}
      <div className="sidebar">
        <div className="logo">UTM LIBRARY</div>
        <div className="nav-item active">Duty Roster</div>
        <div className="nav-item">My Profile</div>
        <div className="nav-item bottom" onClick={() => navigate('/')}>Logout</div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="main-content">
        
        {/* Header */}
        <div className="top-bar">
          <div>
            <h1>Student Dashboard</h1>
            <p className="subtitle">School Library Management System &bull; Semester 1 2026</p>
          </div>
          <div className="user-profile">
            <span>Welcome, <strong>Student</strong></span>
            <div className="avatar-circle">S</div>
          </div>
        </div>

        {/* Action Buttons (Read Only View) */}
        <div className="actions-bar">
          <div style={{ fontStyle: 'italic', color: '#7f8c8d' }}>
            Viewing Public Roster (Read-Only)
          </div>
          <div style={{ color: '#7f8c8d', fontSize: '14px' }}>
            Current Week: <strong>Week 4</strong>
          </div>
        </div>

        {/* --- THE SCHEDULE GRID --- */}
        <div className="schedule-grid">
          
          {/* 1. Header Row (The Days) */}
          <div className="grid-header" style={{ background: '#ecf0f1' }}>Time</div>
          {days.map((day) => (
            <div key={day} className="grid-header">
              {day}
            </div>
          ))}

          {/* 2. Data Rows (The Times) */}
          {times.map((time) => (
            <React.Fragment key={time}>
              
              {/* The Time Column */}
              <div className="time-label">
                <span style={{ fontSize: '14px', fontWeight: 'bold' }}>{time}</span>
              </div>

              {/* The 5 Day Columns for this Time */}
              {days.map((day) => {
                const tasks = getTasksForSlot(day, time);
                
                return (
                  <div key={`${day}-${time}`} className="grid-cell">
                    {tasks.length > 0 ? (
                      tasks.map((task, index) => (
                        <div key={index} className={`duty-card ${task.task_type === 'Heavy Duty' ? 'heavy-duty' : 'light-duty'}`}>
                          
                          {/* Header: Name & Class Name */}
                          <div className="student-header">
                            <span className="student-name">
                               {task.student_name ? task.student_name.split(' ')[0] : 'Student'}
                            </span>
                            <span className="student-class">
                               {task.class_name || 'N/A'}
                            </span>
                          </div>
                          
                          {/* The Main Focus: THE TASK */}
                          <div className="task-main">
                            {task.duty_name}
                          </div>

                        </div>
                      ))
                    ) : (
                      <div className="empty-slot">--</div>
                    )}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>

      </div>
    </div>
  );
};

export default StudentDashboard;