const express = require('express');
const router = express.Router();
const geoController = require('../controllers/geoController');
const { checkNotAuthenticated } = require('../middleware/auth');
const multer = require('multer');

// Agrega multer aquí
const storage = multer.memoryStorage();
const upload = multer({ storage })

router.get('/grilla24', geoController.getGrilla2024);
router.get('/vias24', geoController.getVias24);
router.get('/poligonos', geoController.getPoligonos);
router.get('/presas', geoController.getPresas);
router.get('/embalse', geoController.getEmbalses);
router.get('/porcentaje-material', geoController.getPorcetajeMaterialVia);
router.get('/alta_tension', geoController.getLineasAltatension);
router.get('/radio_bases', geoController.getRadioBases);
router.get('/inspecciones_presa/:cod_presa', checkNotAuthenticated, geoController.getInspeccionesPresa);
router.get('/imagenes_inspeccion/:id', checkNotAuthenticated, geoController.getImagenesInspeccion);
router.get('/levantamientos/:id_grilla', checkNotAuthenticated, geoController.getLevantamientosPorGrilla);
router.post('/upimagespresa/:idcuenca',checkNotAuthenticated,upload.fields([
      { name: "foto_1", maxCount: 1 },
      { name: "foto_2", maxCount: 1 },
      { name: "foto_3", maxCount: 1 },
      { name: "foto_4", maxCount: 1 },
      { name: "foto_5", maxCount: 1 },
    ]),geoController.uploadInspeccionPresa);
  
module.exports = router;