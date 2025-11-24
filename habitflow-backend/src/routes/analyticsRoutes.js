const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const ctrl = require('../controllers/analyticsController');

router.get('/overview', auth, ctrl.overview);
router.get('/habits/daily', auth, ctrl.habitsDaily);
router.get('/xp/weekly', auth, ctrl.xpWeekly);
router.get('/top-habits', auth, ctrl.topHabits);

module.exports = router;
