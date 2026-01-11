CREATE DEFINER=`root`@`localhost` PROCEDURE `change_user_role`(
	IN p_user_id INT,
    IN p_new_role ENUM('student', 'teacher', 'itstaff')
    )
BEGIN
	DECLARE v_current_role VARCHAR(20);
    DECLARE v_user_exists INT DEFAULT 0;
    
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;
    
    START TRANSACTION;
    
	SELECT role, 1 INTO v_current_role, v_user_exists
    FROM schedule_management.user 
    WHERE user_id = p_user_id;
    
    -- If user doesn't exist, raise error
    IF v_user_exists = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'User not found';
    END IF;
    
    -- If same role, no change needed
    IF v_current_role = p_new_role THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'User already has the specified role';
    END IF;
    
    -- Remove from current role-specific table
    CASE v_current_role
        WHEN 'student' THEN
            DELETE FROM schedule_management.student WHERE user_id = p_user_id;
        WHEN 'teacher' THEN
            DELETE FROM schedule_management.teacher WHERE user_id = p_user_id;
        WHEN 'itstaff' THEN
            DELETE FROM schedule_management.it_staff WHERE user_id = p_user_id;
    END CASE;
    
    -- Update role in user table
    UPDATE schedule_management.user 
    SET role = p_new_role 
    WHERE user_id = p_user_id;
    
    -- Add to new role-specific table
    CASE p_new_role
        WHEN 'student' THEN
            INSERT INTO schedule_management.student (user_id) VALUES (p_user_id);
        WHEN 'teacher' THEN
            INSERT INTO schedule_management.teacher (user_id) VALUES (p_user_id);
        WHEN 'itstaff' THEN
            INSERT INTO schedule_management.it_staff (user_id) VALUES (p_user_id);
    END CASE;
    
    COMMIT;
    
    
END