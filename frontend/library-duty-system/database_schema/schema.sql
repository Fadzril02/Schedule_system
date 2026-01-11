CREATE DATABASE IF NOT EXISTS schedule_management;
USE schedule_management;

CREATE TABLE schedule_management.user(
    user_id int PRIMARY KEY NOT NULL AUTO_INCREMENT,
    email varchar(255) NOT NULL UNIQUE,
    first_name varchar(255),
    last_name varchar(255),
    role ENUM('student', 'teacher', 'itstaff') NOT NULL,
    password_hash varchar(255) NOT NULL,
    created_at TIMESTAMP CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

);

CREATE TABLE student(
    user_id INT PRIMARY KEY,
    student_matrix_number VARCHAR(20) UNIQUE,
    FOREIGN KEY (user_id) REFERENCES schedule_management.user(user_id) ON DELETE CASCADE
);

CREATE TABLE teacher(
    user_id INT PRIMARY KEY,
    FOREIGN KEY (user_id) REFERENCES schedule_management.user(user_id) ON DELETE CASCADE
);

CREATE TABLE it_staff(
    user_id INT PRIMARY KEY,
    FOREIGN KEY (user_id) REFERENCES schedule_management.user(user_id) ON DELETE CASCADE
);

DELIMITER //
CREATE PROCEDURE `create_student_account`(
    IN p_email VARCHAR(255),
    IN p_first_name VARCHAR(255),
    IN p_last_name VARCHAR(255),
    IN p_password_hash VARCHAR(255),
    IN p_matrix_number VARCHAR(20)
)
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;

    INSERT INTO schedule_management.user (email, first_name, last_name, `role`, password_hash) VALUES 
    (p_email, p_first_name, p_last_name, 'student', p_password_hash);

    SET @new_user_id = LAST_INSERT_ID();
    
    INSERT INTO schedule_management.student (user_id, student_matrix_number)
    VALUES (@new_user_id, p_matrix_number);
    
    COMMIT;
END //
DELIMITER ;