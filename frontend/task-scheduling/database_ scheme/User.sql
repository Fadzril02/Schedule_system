CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE,
    password VARCHAR(100) NOT NULL, -- In real app, hash this!
    role VARCHAR(20) NOT NULL,      -- 'Admin' or 'Student'
    class_name VARCHAR(50),         -- e.g., '5 Bestari'
    standard INT                    -- 1-3 = Junior, 4-6 = Senior
);

INSERT INTO users (name, email, password, role) 
VALUES ('Library Admin', 'admin@school.com', 'admin123', 'Admin');

-- JUNIORS (Standard 1, 2, 3) - For 09:40 Slot
INSERT INTO users (name, email, password, role, class_name, standard) VALUES 
('Ali Bin Abu', 'ali@student.com', '123', 'Student', '1 Bestari', 1),
('Siti Aminah', 'siti@student.com', '123', 'Student', '2 Cerdik', 2),
('Chong Wei', 'chong@student.com', '123', 'Student', '3 Harmon', 3),
('Muthu Sami', 'muthu@student.com', '123', 'Student', '1 Bestari', 1),
('Nurul Izzah', 'nurul@student.com', '123', 'Student', '2 Cerdik', 2),
('Tan Mei Ling', 'tan@student.com', '123', 'Student', '3 Harmon', 3),
('Adam Haikal', 'adam@student.com', '123', 'Student', '1 Pintar', 1),
('Sarah Lee', 'sarah@student.com', '123', 'Student', '2 Pintar', 2);

-- SENIORS (Standard 4, 5, 6) - For 10:00 Slot
INSERT INTO users (name, email, password, role, class_name, standard) VALUES 
('Ahmad Fadzril', 'ahmad@student.com', '123', 'Student', '5 Bestari', 5),
('Jessica Wong', 'jessica@student.com', '123', 'Student', '4 Cerdik', 4),
('Rajesh Kumar', 'rajesh@student.com', '123', 'Student', '6 Harmon', 6),
('Farah Nabilah', 'farah@student.com', '123', 'Student', '5 Bestari', 5),
('Lim Kit Siang', 'lim@student.com', '123', 'Student', '4 Cerdik', 4),
('Devi Priya', 'devi@student.com', '123', 'Student', '6 Harmon', 6),
('Hakim Rusli', 'hakim@student.com', '123', 'Student', '5 Pintar', 5),
('Brenda Low', 'brenda@student.com', '123', 'Student', '6 Pintar', 6);