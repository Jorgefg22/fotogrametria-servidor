const express = require('express');
const router = express.Router();
const descargaController = require('../controllers/descargaController');
const { checkNotAuthenticated } = require('../middleware/auth');



router.get('/formulario', checkNotAuthenticated, descargaController.renderFormulario);
router.get('/descargados', checkNotAuthenticated, descargaController.getDescarados);
//lista para descargas de archivos
router.get('/:nombreArchivo', checkNotAuthenticated, descargaController.descargarArchivo);
router.get('/descargarot/:nombreArchivo', checkNotAuthenticated, descargaController.descargarOrtofotoOT);
module.exports = router;