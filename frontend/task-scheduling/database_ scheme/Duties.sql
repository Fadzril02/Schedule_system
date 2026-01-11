CREATE TABLE IF NOT EXISTS duties (
    id INT AUTO_INCREMENT PRIMARY KEY,
    duty_name VARCHAR(100) NOT NULL,
    duty_type VARCHAR(50) NOT NULL  -- 'Light Duty' or 'Heavy Duty'
);

INSERT INTO duties (duty_name, duty_type) VALUES 
('Counter Duty', 'Light Duty'),
('Newspaper Arranging', 'Light Duty'),
('Sweeping Floor', 'Light Duty'),
('Dusting Shelves', 'Light Duty'),
('Book Shelving', 'Heavy Duty'),
('Spot Check', 'Heavy Duty'),
('System Maintenance', 'Heavy Duty'),
('Furniture Arrangement', 'Heavy Duty');