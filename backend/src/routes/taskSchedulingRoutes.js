const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');

// Route to GET all schedules
// URL: http://localhost:5000/api/task-scheduling/
router.get('/', taskController.getAllSchedules);

// Route to ASSIGN a duty
// URL: http://localhost:5000/api/task-scheduling/assign
router.post('/assign', taskController.assignDuty);

module.exports = router;