CREATE DEFINER=`root`@`localhost` PROCEDURE `p_update_student_profile`(
    IN p_user_id INT,
    IN p_first_name VARCHAR(255),
    IN p_last_name VARCHAR(255),
    IN p_email VARCHAR(255),
    IN p_matrix_number VARCHAR(20)
)
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;

    -- Update user table
    UPDATE schedule_management.user 
    SET 
        first_name = p_first_name,
        last_name = p_last_name,
        email = p_email
    WHERE user_id = p_user_id AND role = 'student';

    -- Update student table
    UPDATE schedule_management.student
    SET student_matrix_number = p_matrix_number
    WHERE user_id = p_user_id;

    COMMIT;
END