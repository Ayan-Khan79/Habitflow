const express = require('express');
const auth = require('../middleware/auth');
const router = express.Router();
const { register, login, getProfile, updateProfile } = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);
router.get("/profile", auth, getProfile);

router.put("/update-profile", auth, updateProfile);



module.exports = router;
