const express = require('express');
const router = express.Router();
const geofenceController = require('../controllers/geofence.controller');
const { verifyToken, checkRole } = require('../middlewares/auth.middleware');

// Creación reservada a Administradores (Configuran los parámetros globales)
router.post('/', verifyToken, checkRole(['ADMIN']), geofenceController.createGeofence);

// Visualización para Administradores y Supervisores (para el Dashboard)
router.get('/', verifyToken, checkRole(['ADMIN', 'SUPERVISOR']), geofenceController.getGeofences);

module.exports = router;
