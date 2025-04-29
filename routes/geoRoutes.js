const express = require('express');
const router = express.Router();
const geoController = require('../controllers/geoController');
const { checkNotAuthenticated } = require('../middleware/auth');

router.get('/grilla24', geoController.getGrilla2024);
router.get('/vias24', geoController.getVias24);
router.get('/poligonos', geoController.getPoligonos);
router.get('/presas', geoController.getPresas);
router.get('/embalse', geoController.getEmbalses);
router.get('/inspecciones_presa/:cod_presa', checkNotAuthenticated, geoController.getInspeccionesPresa);
router.get('/imagenes_inspeccion/:id', checkNotAuthenticated, geoController.getImagenesInspeccion);
router.post('/upimagespresa/:idcuenca', checkNotAuthenticated, geoController.uploadInspeccionPresa);

module.exports = router;