CREATE DEFINER=`root`@`localhost` PROCEDURE `view_teacher_account_by_id`(id INT)
BEGIN
	SELECT * FROM teacher LEFT JOIN user ON user.user_id = teacher.user_id AND user.role = 'teacher';
END