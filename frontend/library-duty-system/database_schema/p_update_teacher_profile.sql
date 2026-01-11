CREATE DEFINER=`root`@`localhost` PROCEDURE `p_update_teacher_profile`(
    IN p_user_id INT,
    IN p_first_name VARCHAR(255),
    IN p_last_name VARCHAR(255),
    IN p_email VARCHAR(255)
)
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;

    UPDATE schedule_management.user 
    SET 
        first_name = p_first_name,
        last_name = p_last_name,
        email = p_email
    WHERE user_id = p_user_id AND role = 'teacher';

    COMMIT;
END