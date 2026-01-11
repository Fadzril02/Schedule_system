CREATE DEFINER=`root`@`localhost` PROCEDURE `view_all_teacher_accounts`()
BEGIN
	SELECT * FROM teacher LEFT JOIN user ON user.user_id = teacher.user_id AND user.role = 'teacher';
END