const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const ctrl = require('../controllers/challengeController');

// Start / End challenge (specific routes first)
router.post('/:id/start', auth, ctrl.startChallenge);
router.delete('/:id/end', auth, ctrl.endChallenge);

// User challenges routes (must be BEFORE dynamic :id)
router.get('/user', auth, ctrl.getUserChallenges);      // <-- Your frontend calls this
router.get('/user/all', auth, ctrl.getUserChallenges);
router.get("/user-challenge/:id/history", auth, ctrl.getChallengeHistory);

// Challenge daily complete
router.post('/user-challenge/:id/complete', auth, ctrl.completeToday);

// Create & list challenges
router.post('/', auth, ctrl.createChallenge);
router.get('/', auth, ctrl.getAllChallenges);

// Delete challenge
router.delete('/:id', auth, ctrl.deletechallenge);


// ⚠️ ALWAYS KEEP THIS LAST — MATCHES /:id
router.get('/:id', auth, ctrl.getChallengeById);

module.exports = router;
