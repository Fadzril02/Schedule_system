CREATE DEFINER=`root`@`localhost` PROCEDURE `p_update_user_password`(
	IN p_user_id INT,
    IN p_new_password_hash VARCHAR(255)
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
        password_hash = p_new_password_hash
    WHERE user_id = p_user_id;

    COMMIT;
END