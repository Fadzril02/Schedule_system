CREATE DEFINER=`root`@`localhost` PROCEDURE `create_teacher_account`(
	IN p_email VARCHAR(255),
    IN p_first_name VARCHAR(255),
    IN p_last_name VARCHAR(255),
    IN p_password_hash VARCHAR(255)
    )
BEGIN
	DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
		ROLLBACK;
        RESIGNAL;
	END;
    
    START TRANSACTION;
    
    INSERT INTO schedule_management.`user` (email, first_name, last_name, `role`, password_hash)
    VALUES (p_email, p_first_name, p_last_name, 'teacher', p_password_hash);
    
    SET @new_user_id = LAST_INSERT_ID();
    
    INSERT INTO schedule_management.teacher(user_id) 
    VALUES (@new_user_id);
    
    COMMIT;
    
END