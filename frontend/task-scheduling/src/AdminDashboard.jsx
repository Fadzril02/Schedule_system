import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);

  // Separate buckets
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
      setPublishedTasks(allTasks.filter(t => t.status === 'Published'));
      setPendingTasks(allTasks.filter(t => t.status === 'Pending'));
      setLoading(false);
    } catch (error) { console.error(error); setLoading(false); }
  };

  // --- ACTIONS ---
  const handleAutoAssign = async () => {
    try {
      setLoading(true);
      const response = await axios.post("http://localhost:5000/api/task-scheduling/auto-assign");
      alert(response.data.message);
      fetchSchedules();
    } catch (error) { alert("Failed"); setLoading(false); }
  };

  const handlePublish = async () => {
    if(!window.confirm("Replace Live Schedule with Drafts?")) return;
    try {
      await axios.post('http://localhost:5000/api/task-scheduling/publish');
      alert("✅ Published!");
      fetchSchedules(); 
    } catch (error) { alert("Failed"); }
  };

  const handleClearAll = async () => {
    if(!window.confirm("Wipe EVERYTHING?")) return;
    try {
      await axios.post('http://localhost:5000/api/task-scheduling/clear-all');
      fetchSchedules();
    } catch (error) { alert("Failed"); }
  }

  // --- MANUAL EDIT LOGIC ---
  const handleCardClick = async (task) => {
    if (task.status !== 'Published') return;

    const action = window.prompt(
        `Editing: ${task.student_name} (${task.duty_name})\n\nType 'DELETE' to remove.\nType 'SWAP' to change student ID.`
    );

    if (action === 'DELETE') {
        try {
            await axios.delete(`http://localhost:5000/api/task-scheduling/delete-task/${task.id}`);
            fetchSchedules();
        } catch (e) { alert("Error deleting"); }
    } 
    else if (action === 'SWAP') {
        const newStudentId = window.prompt("Enter new Student ID:");
        if (newStudentId) {
            try {
                await axios.put(`http://localhost:5000/api/task-scheduling/update-task/${task.id}`, {
                    student_id: newStudentId,
                    duty_name: task.duty_name
                });
                fetchSchedules();
            } catch (e) { alert("Error updating"); }
        }
    }
  };

  const getTasks = (sourceList, day, timeLabel) => {
    return sourceList.filter((task) => 
       task.day_of_week === day && task.start_time.substring(0, 5) === timeLabel
    );
  };

  return (
    <div className="dashboard-container">
      
      {/* SIDEBAR */}
      <div className="sidebar">
        <div className="logo">UTM LIBRARY</div>
        <div className="nav-item active">Dashboard</div>
        <div className="nav-item bottom">Logout</div>
      </div>

      {/* MAIN CONTENT */}
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

        {/* --- ACTION BUTTONS (Restored to original layout) --- */}
        <div className="actions-bar">
          <div className="btn-group">
            <button className="btn-auto" onClick={handleAutoAssign} disabled={loading}>
              ⚡ Auto-Assign
            </button>
            <button className="btn-publish" onClick={handlePublish} disabled={pendingTasks.length === 0}>
              🚀 Publish
            </button>
            <button className="btn-reset" onClick={handleClearAll}>
              🗑️ Reset Week
            </button>
          </div>

          <div className="status-legend">
            <span style={{color: '#27ae60', fontWeight: 'bold'}}>● Live</span>
            <span style={{color: '#f39c12', fontWeight: 'bold', marginLeft: '15px'}}>● Draft</span>
          </div>
        </div>

        {/* --- SECTION 1: LIVE SCHEDULE --- */}
        <div className="section-header live-header">
           <h2>🟢 Live Schedule</h2>
        </div>

        <div className="schedule-grid live-grid">
          {/* Header Row */}
          <div className="grid-header">Time</div>
          {days.map(day => (
              <div key={day} className="grid-header">{day}</div>
          ))}

          {/* Rows */}
          {times.map((time) => (
            <React.Fragment key={time}>
              <div className="time-label"><span>{time}</span></div>
              {days.map((day) => {
                
                // 1. BLANK FRIDAY LOGIC
                if (day === 'Friday') {
                    return <div key={`fri-${time}`} className="grid-cell friday-cell"></div>;
                }

                const tasks = getTasks(publishedTasks, day, time);
                return (
                  <div key={`pub-${day}-${time}`} className="grid-cell">
                    {tasks.length > 0 ? tasks.map((task, i) => (
                      <div 
                        key={i} 
                        className="duty-card status-published editable-card"
                        onClick={() => handleCardClick(task)}
                        title="Click to Edit"
                      >
                        <div className="student-header">
                          <span className="student-name">{task.student_name ? task.student_name.split(' ')[0] : 'Student'}</span>
                          <span className="student-class">{task.class_name}</span>
                        </div>
                        <div className="task-main">{task.duty_name}</div>
                      </div>
                    )) : <span className="empty-txt">-</span>}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>

        <br/>

        {/* --- SECTION 2: DRAFT SCHEDULE --- */}
        <div className="section-header draft-header">
           <h2>🟡 Draft Preview</h2>
        </div>

        <div className="schedule-grid draft-grid">
          <div className="grid-header">Time</div>
          {days.map(day => <div key={day} className="grid-header">{day}</div>)}

          {times.map((time) => (
            <React.Fragment key={time}>
              <div className="time-label"><span>{time}</span></div>
              {days.map((day) => {
                
                // 1. BLANK FRIDAY LOGIC
                if (day === 'Friday') {
                    return <div key={`fri-dft-${time}`} className="grid-cell friday-cell"></div>;
                }

                const tasks = getTasks(pendingTasks, day, time);
                return (
                  <div key={`dft-${day}-${time}`} className="grid-cell">
                     {tasks.length > 0 ? tasks.map((task, i) => (
                      <div key={i} className="duty-card status-pending">
                         <span className="status-badge badge-pending">NEW</span>
                        <div className="student-header">
                          <span className="student-name">{task.student_name ? task.student_name.split(' ')[0] : 'Student'}</span>
                          <span className="student-class">{task.class_name}</span>
                        </div>
                        <div className="task-main">{task.duty_name}</div>
                      </div>
                    )) : <span className="empty-txt" style={{color:'#f39c12'}}>...</span>}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
        
        <div style={{height:'50px'}}></div>
      </div>
    </div>
  );
};

export default AdminDashboard;