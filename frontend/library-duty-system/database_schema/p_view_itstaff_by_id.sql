CREATE DEFINER=`root`@`localhost` PROCEDURE `view_it_account_by_id`(id INT)
BEGIN
	SELECT * FROM it_staff LEFT JOIN user ON user.user_id = it_staff.user_id AND user.role = 'itstaff';
END