import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);

  // Separate data buckets
  const [publishedTasks, setPublishedTasks] = useState([]);
  const [pendingTasks, setPendingTasks] = useState([]);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const times = ['09:40', '10:00']; 

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/task-scheduling/");
      const allTasks = response.data;
      setSchedules(allTasks);

      // SPLIT THE DATA HERE
      setPublishedTasks(allTasks.filter(t => t.status === 'Published'));
      setPendingTasks(allTasks.filter(t => t.status === 'Pending'));
      
      setLoading(false);
    } catch (error) {
      console.error("Error:", error);
      setLoading(false);
    }
  };

  // --- ACTIONS ---
  const handleAutoAssign = async () => {
    try {
      setLoading(true);
      const response = await axios.post("http://localhost:5000/api/task-scheduling/auto-assign");
      alert(response.data.message);
      fetchSchedules();
    } catch (error) {
      alert("Auto-Assign Failed");
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    if(!window.confirm("CONFIRM: Replace the Live Schedule with the Drafts?")) return;
    try {
      await axios.post('http://localhost:5000/api/task-scheduling/publish');
      alert("✅ Published!");
      fetchSchedules(); 
    } catch (error) {
      alert("Publish Failed");
    }
  };

  const handleClearAll = async () => {
    if(!window.confirm("WARNING: This will wipe EVERYTHING (Live & Drafts). Continue?")) return;
    try {
      await axios.post('http://localhost:5000/api/task-scheduling/clear-all');
      alert("🗑️ Cleared.");
      fetchSchedules();
    } catch (error) {
      alert("Clear Failed");
    }
  }

  // Helper: Filter a specific list (Published or Pending)
  const getTasks = (sourceList, day, timeLabel) => {
    return sourceList.filter((task) => {
      if (!task.day_of_week || !task.start_time) return false;
      return task.day_of_week === day && task.start_time.substring(0, 5) === timeLabel;
    });
  };

  return (
    <div className="dashboard-container">
      
      {/* SIDEBAR */}
      <div className="sidebar">
        <div className="logo">UTM LIBRARY</div>
        <div className="nav-item active">Dashboard</div>
        <div className="nav-item">Student List</div>
        <div className="nav-item bottom">Logout</div>
      </div>

      {/* MAIN CONTENT - SCROLLABLE */}
      <div className="main-content">
        
        {/* Header */}
        <div className="top-bar">
          <div>
            <h1>Admin Dashboard</h1>
            <p className="subtitle">Manage Duty Roster</p>
          </div>
          <div className="user-profile">
            <span>Admin</span>
            <div className="avatar-circle">A</div>
          </div>
        </div>

        {/* CONTROLS BAR */}
        <div className="actions-bar sticky-bar">
          <div style={{ display: 'flex', gap: '15px' }}>
             {/* 1. Generate New Draft */}
            <button className="btn-auto" onClick={handleAutoAssign} disabled={loading}>
              ⚡ 1. Auto-Assign New Draft
            </button>

            {/* 2. Push to Live */}
            <button className="btn-publish" onClick={handlePublish} disabled={pendingTasks.length === 0}>
              🚀 2. Publish Draft to Live
            </button>

             {/* 3. Nuke */}
            <button 
                onClick={handleClearAll}
                style={{ background: '#e74c3c', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              🗑️ Reset All
            </button>
          </div>
        </div>

        {/* === SECTION 1: LIVE SCHEDULE (GREEN) === */}
        <div className="section-header live-header">
           <h2>🟢 Live Schedule (What Students See)</h2>
           <p>This is the currently active roster.</p>
        </div>

        <div className="schedule-grid live-grid">
          <div className="grid-header">Time</div>
          {days.map((day) => <div key={day} className="grid-header">{day}</div>)}

          {times.map((time) => (
            <React.Fragment key={time}>
              <div className="time-label"><span>{time}</span></div>
              {days.map((day) => {
                const tasks = getTasks(publishedTasks, day, time);
                return (
                  <div key={`pub-${day}-${time}`} className="grid-cell">
                    {tasks.length > 0 ? tasks.map((task, i) => (
                      <div key={i} className="duty-card status-published">
                        <div className="student-header">
                          <span className="student-name">{task.student_name.split(' ')[0]}</span>
                          <span className="student-class">{task.class_name}</span>
                        </div>
                        <div className="task-main">{task.duty_name}</div>
                      </div>
                    )) : <span className="empty-txt">- Empty -</span>}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>

        <br /><br />

        {/* === SECTION 2: DRAFT SCHEDULE (YELLOW) === */}
        <div className="section-header draft-header">
           <h2>🟡 Draft Preview (Pending Approval)</h2>
           <p>This is the result of your Auto-Assign. Review it here before publishing.</p>
        </div>

        <div className="schedule-grid draft-grid">
          <div className="grid-header">Time</div>
          {days.map((day) => <div key={day} className="grid-header">{day}</div>)}

          {times.map((time) => (
            <React.Fragment key={time}>
              <div className="time-label"><span>{time}</span></div>
              {days.map((day) => {
                const tasks = getTasks(pendingTasks, day, time);
                return (
                  <div key={`dft-${day}-${time}`} className="grid-cell">
                     {tasks.length > 0 ? tasks.map((task, i) => (
                      <div key={i} className="duty-card status-pending">
                         <span className="status-badge badge-pending">NEW</span>
                        <div className="student-header">
                          <span className="student-name">{task.student_name.split(' ')[0]}</span>
                          <span className="student-class">{task.class_name}</span>
                        </div>
                        <div className="task-main">{task.duty_name}</div>
                      </div>
                    )) : <span className="empty-txt" style={{color:'#f39c12'}}>Waiting for Auto-Assign...</span>}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>

        <div style={{height: '50px'}}></div> {/* Bottom Padding */}

      </div>
    </div>
  );
};

export default AdminDashboard;