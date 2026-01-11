CREATE DEFINER=`root`@`localhost` PROCEDURE `view_student_accounts`()
BEGIN
	SELECT * FROM student LEFT JOIN user  ON user.user_id = student.user_id;
END