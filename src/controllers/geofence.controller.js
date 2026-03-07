const db = require('../config/db');

exports.createGeofence = async (req, res) => {
    try {
        const { nombre, tipo, coordenadas, radio } = req.body;
        const userId = req.user.id;

        if (!nombre || !tipo || !coordenadas) {
            return res.status(400).json({ message: 'Faltan datos requeridos (nombre, tipo, coordenadas)' });
        }

        // Tipo debe ser CIRCLE o POLYGON
        if (tipo !== 'CIRCLE' && tipo !== 'POLYGON') {
            return res.status(400).json({ message: 'El tipo debe ser CIRCLE o POLYGON' });
        }

        const [result] = await db.query(
            'INSERT INTO Geofences (nombre, tipo, coordenadas, radio, created_by) VALUES (?, ?, ?, ?, ?)',
            [nombre, tipo, JSON.stringify(coordenadas), radio || null, userId]
        );

        res.status(201).json({ message: 'Geocerca creada exitosamente', id: result.insertId });
    } catch (error) {
        console.error('Error creando geocerca:', error);
        res.status(500).json({ message: 'Error interno al crear geocerca' });
    }
};

exports.getGeofences = async (req, res) => {
    try {
        const [geofences] = await db.query('SELECT * FROM Geofences');
        
        // Parsear JSON de base de datos antes de enviar
        const geofencesParsed = geofences.map(gf => ({
            ...gf,
            coordenadas: typeof gf.coordenadas === 'string' ? JSON.parse(gf.coordenadas) : gf.coordenadas
        }));

        res.json(geofencesParsed);
    } catch (error) {
        console.error('Error obteniendo geocercas:', error);
        res.status(500).json({ message: 'Error interno al obtener geocercas' });
    }
};
