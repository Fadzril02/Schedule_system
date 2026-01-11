CREATE DEFINER=`root`@`localhost` PROCEDURE `p_update_user`(
	IN p_user_id INT,
	IN first_name varchar(255),
    IN last_name varchar(255),
    IN email VARCHAR(255)
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
    WHERE user_id = p_user_id;

    COMMIT;
END