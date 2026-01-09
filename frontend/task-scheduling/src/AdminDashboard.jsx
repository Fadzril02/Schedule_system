import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminDashboard.css';

const AdminDashboard = () => {
  // --- 1. STATE MANAGEMENT ---
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);

  // Define the grid structure (Rows and Columns)
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const times = ['09:40', '10:00']; // The specific duty slots

  // --- 2. FETCH DATA (ON LOAD) ---
  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/task-scheduling/");
      setSchedules(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching schedules:", error);
      setLoading(false);
    }
  };

  // --- 3. AUTO-ASSIGN FUNCTION (The Magic Button) ---
  const handleAutoAssign = async () => {
    try {
      setLoading(true);
      // Calls your backend logic
      const response = await axios.post("http://localhost:5000/api/task-scheduling/auto-assign");
      
      alert("System Update: " + response.data.message);
      
      // Refresh grid immediately to show new assignments
      fetchSchedules();
    } catch (error) {
      console.error("Auto-Assign failed:", error);
      alert("Failed to auto-assign duties. Check console for details.");
      setLoading(false);
    }
  };

  const handlePublish = () => {
    alert("Schedule Published! Emails sent to students.");
    // You can add backend logic here later
  };

  // --- 4. HELPER: FIND TASK FOR SPECIFIC SLOT ---
  const getTaskForSlot = (day, timeLabel) => {
    if (!schedules || schedules.length === 0) return null;

    return schedules.find((task) => {
      // Safety Check: Prevent crashes if database data is incomplete
      if (!task.day_of_week || !task.start_time) return false;

      // Match Day: e.g., "Monday" === "Monday"
      const isDayMatch = task.day_of_week === day;

      // Match Time: Compare first 5 chars "09:40" === "09:40"
      const isTimeMatch = task.start_time.substring(0, 5) === timeLabel;

      return isDayMatch && isTimeMatch;
    });
  };

  // --- 5. RENDER THE DASHBOARD ---
  return (
    <div className="dashboard-container">
      
      {/* SIDEBAR NAVIGATION */}
      <div className="sidebar">
        <div className="logo">UTM LIBRARY</div>
        <div className="nav-item active">Dashboard</div>
        <div className="nav-item">Student List</div>
        <div className="nav-item">Duty Types</div>
        <div className="nav-item">Reports</div>
        <div className="nav-item bottom">Settings</div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="main-content">
        
        {/* Header */}
        <div className="top-bar">
          <div>
            <h1>Admin Dashboard</h1>
            <p className="subtitle">School Library Management System &bull; Semester 1 2026</p>
          </div>
          <div className="user-profile">
            <span>Welcome, <strong>Admin Ahmad</strong></span>
            <div className="avatar-circle">A</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="actions-bar">
          <div>
            <button className="btn-auto" onClick={handleAutoAssign} disabled={loading}>
              {loading ? "Processing..." : "Auto-Assign Duties"}
            </button>
            <button className="btn-publish" onClick={handlePublish}>
              Publish Schedule
            </button>
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
              
              {/* The Time Column - CLEAN DISPLAY */}
              <div className="time-label">
                <span style={{ fontSize: '14px', fontWeight: 'bold' }}>{time}</span>
                <br/> 
                <span style={{ fontSize: '11px', color: '#95a5a6', textTransform: 'uppercase' }}>
               
                </span>
              </div>

              {/* The 5 Day Columns for this Time */}
              {days.map((day) => {
                const task = getTaskForSlot(day, time);
                
                return (
                  <div key={`${day}-${time}`} className="grid-cell">
                    {task ? (
                      <div className={`duty-card ${task.task_type === 'Heavy Duty' ? 'heavy-duty' : 'light-duty'}`}>
                        {/* Student Name */}
                        <strong>{task.student_name}</strong>
                        
                        {/* Task Name */}
                        <div style={{ fontSize: '12px', marginTop: '4px', color: '#555' }}>
                          {task.duty_name}
                        </div>

                        {/* CLEAN BADGE: Only Junior or Senior */}
                        <div style={{ marginTop: '8px' }}>
                            <span style={{ 
                                fontSize: '10px', 
                                background: task.task_type === 'Heavy Duty' ? '#e67e22' : '#3498db',
                                color: 'white', 
                                padding: '3px 8px', 
                                borderRadius: '10px',
                                textTransform: 'uppercase',
                                fontWeight: 'bold'
                            }}>
                                {task.task_type === 'Heavy Duty' ? 'Senior' : 'Junior'}
                            </span>
                        </div>
                      </div>
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

export default AdminDashboard;