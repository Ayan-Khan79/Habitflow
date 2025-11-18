// routes/challengeRoutes.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth'); // your JWT middleware
const ctrl = require('../controllers/challengeController');
const { deleteHabit } = require('../controllers/habitController');


router.post('/:id/start', auth, ctrl.startChallenge);  //Start a challenge
router.delete('/:id/end', auth, ctrl.endChallenge);   // end the challenge
router.get('/', auth, ctrl.getAllChallenges);              // GET /api/challenges
router.get('/:id', auth, ctrl.getChallengeById);          // GET /api/challenges/:id
router.post('/start/:id', auth, ctrl.startChallenge);     // POST /api/challenges/start/:id
router.get('/user/all', auth, ctrl.getUserChallenges);    // GET /api/challenges/user/all
router.post('/user-challenge/:id/complete', auth, ctrl.completeToday); // POST /api/user-challenge/:id/complete
router.post('/', auth, ctrl.createChallenge); // ✅ NEW route
router.delete('/:id',auth,ctrl.deletechallenge) // delete a new challenge




module.exports = router;
