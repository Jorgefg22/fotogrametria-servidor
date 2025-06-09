// routes/mapaRoutes.js
const express = require('express');
const router = express.Router();
const mapaController = require('../controllers/mapaController');

router.get('/generar', mapaController.generarMapa);

module.exports = router;
  