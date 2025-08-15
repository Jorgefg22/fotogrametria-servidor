const express = require('express');
const router = express.Router();
const { checkNotAuthenticated ,checkRole} = require('../middleware/auth');
const passport = require('passport');
const authController = require('../controllers/authController');

router.post('/login', passport.authenticate('local', {
  successRedirect: '/users/geoport',
  failureRedirect: '/users/login',
  failureFlash: true,
}));
router.get('/logout', authController.logoutUser);
router.get('/login', (req, res) => {
    res.render('login'); // o la vista que corresponda
  });
  
router.get('/geoport', checkNotAuthenticated, (req, res) => {
  res.render('geoport', { user: req.user.name, role: req.user.role_name });
});

router.get('/geoportVias', checkNotAuthenticated, (req, res) => {
  res.render('geoportVias', { user: req.user.name, role: req.user.role_name });
});

router.get('/admin', checkNotAuthenticated, (req, res) => {
  res.render('admin', { user: req.user.name });
});
router.get('/root', checkNotAuthenticated, (req, res) => {
  res.render('root', { user: req.user.name });
});
router.get('/editor', checkNotAuthenticated, (req, res) => {
  res.render('editor', { user: req.user.name });
});
router.get('/lector', checkNotAuthenticated, (req, res) => {
  res.render('lector', { user: req.user.name });
});


// redirect  
router.get('/21', checkNotAuthenticated, (req, res) => {
  res.render('21', { user: req.user.name, role: req.user.role_name });
});
router.get('/help2', checkNotAuthenticated, (req, res) => {
  res.render('help2', { user: req.user.name, role: req.user.role_name });
});

//ACCESO A LOS PORTALES POR DISTRITO 
//para los usurarios root
router.get('/geoportD1', checkNotAuthenticated, (req, res) => {
  res.render('distritos/geoportD1', { user: req.user.name, role: req.user.role_name });
});
router.get('/geoportPredios', checkNotAuthenticated, (req, res) => {
  res.render('geoportPredios', { user: req.user.name, role: req.user.role_name });
});
router.get('/geoportMTierra', checkNotAuthenticated, (req, res) => {
  res.render('geoportMTierra', { user: req.user.name, role: req.user.role_name });
});

router.get('/geoportD2', checkNotAuthenticated, (req, res) => {
  res.render('distritos/geoportD2', { user: req.user.name, role: req.user.role_name });
});
router.get('/geoportD3', checkNotAuthenticated, (req, res) => {
  res.render('distritos/geoportD3', { user: req.user.name, role: req.user.role_name });
});

router.get('/geoportD4', checkNotAuthenticated, (req, res) => {
  res.render('distritos/geoportD4', { user: req.user.name, role: req.user.role_name });
});

router.get('/geoportDLL', checkNotAuthenticated, (req, res) => {
  res.render('distritos/geoportDLL', { user: req.user.name, role: req.user.role_name });
});

router.get('/geoportD1', checkNotAuthenticated, (req, res) => {
  res.render('distritos/geoportD1', { user: req.user.name, role: req.user.role_name });
});

router.get('/geoportD6', checkNotAuthenticated, (req, res) => {
  res.render('distritos/geoportD6', { user: req.user.name, role: req.user.role_name });
});

router.get('/geoportD7', checkNotAuthenticated, (req, res) => {
  res.render('distritos/geoportD7', { user: req.user.name, role: req.user.role_name });
});

router.get('/geocesium', checkNotAuthenticated, (req, res) => {
  res.render('geocesium', { user: req.user.name, role: req.user.role_name });
});


module.exports = router;
