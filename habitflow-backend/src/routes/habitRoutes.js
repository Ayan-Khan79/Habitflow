const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const habitCtrl = require('../controllers/habitController');

router.use(auth);

router.post('/', habitCtrl.createHabit);
router.get('/', habitCtrl.getHabits);
router.get('/:id', habitCtrl.getHabit);
router.put('/:id', habitCtrl.updateHabit);
router.delete('/:id', habitCtrl.deleteHabit);

// tracking
router.post('/:id/track', habitCtrl.trackHabit);
router.get('/:id/history', habitCtrl.getHistory);

module.exports = router;
