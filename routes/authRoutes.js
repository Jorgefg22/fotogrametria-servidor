const express = require('express');
const router = express.Router();
const passport = require('passport');
const { checkAuthenticated, checkNotAuthenticated } = require('../middleware/auth');
const authController = require('../controllers/authController');

router.get('/', authController.renderLogin);
router.get('/login', checkAuthenticated, authController.renderLogin);
router.get('/register', checkNotAuthenticated, authController.renderRegister);
router.post('/register', authController.registerUser);
router.get('/accesos', authController.getAccesos);


module.exports = router;