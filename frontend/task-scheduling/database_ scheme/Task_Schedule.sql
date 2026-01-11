CREATE TABLE IF NOT EXISTS task_schedule (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT,
    day_of_week VARCHAR(20),        -- 'Monday', 'Tuesday', etc.
    start_time TIME,
    end_time TIME,
    duty_name VARCHAR(100),         -- Saved here in case duty name changes later
    task_type VARCHAR(50),
    status VARCHAR(20) DEFAULT 'Pending', -- 'Pending' or 'Published'
    task_date DATE,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
);