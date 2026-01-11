CREATE DEFINER=`root`@`localhost` PROCEDURE `view_student_account_by_id`(id INT)
BEGIN
	SELECT * FROM teacher LEFT JOIN user ON user.user_id = student.user_id WHERE student.user_id = id and user.role = 'student';
END