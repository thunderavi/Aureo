const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, getUsers } = require('../controllers/userController');
const { isAuthenticated } = require('../middleware/auth');

router.use(isAuthenticated);

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.get('/', getUsers);

module.exports = router;
