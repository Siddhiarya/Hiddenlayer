const express = require('express');
const {
  getEmployeeDashboard,
  getAdminDashboard,
} = require('../controllers/dashboardController');
const { authenticate } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

const router = express.Router();

router.get('/employee', authenticate, getEmployeeDashboard);
router.get('/admin', authenticate, authorizeRoles('hr', 'admin'), getAdminDashboard);

module.exports = router;
