const express = require('express');
const app = express();
const { Pool } = require('pg');
const { pool, poolbdsi,poolbdmt} = require('./config');
const ejs = require('ejs');
const bcrypt = require('bcrypt');
const session = require('express-session');
const flash = require('express-flash');
const passport = require('passport');
require('dotenv').config();
const path = require('path');
const fs = require('fs');
const initializePassport = require('./pswConfig');
const { checkRole, guardarRegistroDescarga } = require('./middleware'); // Importa el middleware de verificación de roles
const { Console } = require('console');
const { format } = require('date-fns');

const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
});

initializePassport(passport);
app.use(express.urlencoded({ extended: false }));
app.engine('html', ejs.renderFile); // Establece el motor de plantillas para archivos ".html"
app.set('view engine', 'html');
app.set('views', path.join(__dirname, 'views'));
//app.set('view engine', 'ejs');
app.use(express.static('public'));

app.use(
  session({
    secret: 'secret',
    resave: 'false,',
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.get('/', (req, res) => {
  res.render('login');
});

app.get('/users/register', checkNotAuthenticated,checkRole('root'), (req, res) => {
  res.render('register');
});
app.get('/users/login', checkAuthenticated, (req, res) => {
  res.render('login');
});


//Rutas por roles de la base de dato
app.get('/admin', checkNotAuthenticated, checkRole('admin'), (req, res) => {
  res.render('admin', { user: req.user.name });
});
app.get('/root', checkNotAuthenticated, checkRole('root'), (req, res) => {
  res.render('root', { user: req.user.name });
});
app.get('/editor', checkNotAuthenticated, checkRole('editor'), (req, res) => {
  res.render('editor', { user: req.user.name });
});
app.get('/lector', checkNotAuthenticated, checkRole('lector'), (req, res) => {
  res.render('lector', { user: req.user.name });
});
app.get('/users/geoport', checkNotAuthenticated, (req, res) => {
  console.log(req.user.role_name)
  res.render('geoport', { user: req.user.name, role: req.user.role_name });
});
app.get('/users/logout', (req, res) => {
  //res.render('index', { message: 'You have logged out successfully' });
  req.logout(function (err) {
    if (err) {
      console.error(err);
    }
    // Redirige al usuario a la página principal u otra página después de cerrar sesión
    res.redirect('/users/login');
  });
});

app.get('/users/accesos', checkNotAuthenticated, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(`SELECT acces FROM "learnerlogin".users WHERE id = $1`, [req.user.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const acces = result.rows[0].acces || [];
    res.json({ acces });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/users/register', async (req, res) => {
  let { name, username, password, password_confirm, role, acces } = req.body;
  let errors = [];

  // Asegurar que acces sea un array
  if (!Array.isArray(acces)) {
    acces = acces ? [acces] : []; 
  }
  if (!name || !username || !password || !password_confirm || !role) {
    errors.push({ message: 'Please enter all fields correctly' });
  }
  if (password.length < 6) {
    errors.push({ message: 'Password must be at least 6 characters long' });
  }
  if (password !== password_confirm) {
    errors.push({ message: 'Passwords do not match' });
  }
  if (errors.length > 0) {
    return res.render('register', { errors, name, username, password, password_confirm, role, acces });
  }
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    // Verificar si el username ya está registrado
    const userCheck = await pool.query(`SELECT * FROM "learnerlogin".users WHERE username = $1`, [username]);
    if (userCheck.rows.length > 0) {
      return res.render('register', { message: 'Username already registered' });
    }
    // Obtener el role_id a partir del nombre del rol
    const roleResult = await pool.query(`SELECT id FROM "learnerlogin".roles WHERE role_name = $1`, [role]);
    if (roleResult.rows.length === 0) {
      return res.render('register', { message: 'Role not found' });
    }
    const roleId = roleResult.rows[0].id;
    // Insertar usuario con acces como array
    const newUser = await pool.query(
      `INSERT INTO "learnerlogin".users (name, username, password, role_id, acces)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, password`,
      [name, username, hashedPassword, roleId, acces]
    );

    rq.flash('success_msg', 'You are successfully registered');
    res.redirect('/users/geoport');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

app.post('/users/login',passport.authenticate('local', {
    successRedirect: '/users/geoport',
    // successRedirect: '/users/mantenimiento',
    failureRedirect: '/users/login',
    failureFlash: true,
  })
);

//rutas de la bandeja de entrada y configuraciones / Enviar mensaje
app.post('/messages', checkNotAuthenticated, async (req, res) => {
  const { receiver_id, content, grilla } = req.body; // Añadir grid si es necesario
  const sender_id = req.user.id;
  const timestamp = new Date(); // Capturar la fecha y hora actual
  try {
    const result = await pool.query(
      'INSERT INTO "learnerlogin".messages (sender_id, receiver_id, content, grilla, timestamp) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [sender_id, receiver_id, content, grilla, timestamp] // Pasar el timestamp al query
    );
    res.redirect('/users/geoport');
    // res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error al enviar el mensaje:', err);
    res.status(500).send('Error al enviar el mensaje');
  }
});

// Obtener mensajes (bandeja de entrada)
app.get('/messages', checkNotAuthenticated, async (req, res) => {
  const userId = req.user.id;
  try {
    const result = await pool.query(
      `SELECT m.*, u.name as sender_name 
       FROM "learnerlogin".messages m 
       JOIN "learnerlogin".users u ON m.sender_id = u.id 
       WHERE m.receiver_id = 2 
       ORDER BY m.timestamp DESC`
    );
      result.rows.forEach(row => {
        for (const key in row) {
          if (row[key] instanceof Date) {
            row[key] = format(row[key], 'yyyy-MM-dd HH:mm:ss.SSS');
          }
        }
      });
    res.json(result.rows);
  } catch (err) {
    console.error('Error al obtener los mensajes:', err);
    res.status(500).send('Error al obtener los mensajes');
  }
});

// Marcar mensaje como leído
app.put('/messages/:id/read', checkNotAuthenticated, async (req, res) => {
  const messageId = req.params.id;
  const userId = req.user.id;
  try {
    const result = await pool.query(
      'UPDATE "learnerlogin".messages SET read = TRUE WHERE id = $1 AND receiver_id = $2 RETURNING *',
      [messageId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).send('Mensaje no encontrado o no autorizado');
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error al marcar el mensaje como leído:', err);
    res.status(500).send('Error al marcar el mensaje como leído');
  }
});

// Ruta para formulario de enviar mensaje
app.get('/users/send-message', checkNotAuthenticated, (req, res) => {
  console.log(req.user.role_name)
  res.render('send-message', { user: req.user.name, role: req.user.role_name });
});
// Ruta para bandeja de entrada
app.get('/users/inbox', checkNotAuthenticated, (req, res) => {
  console.log(req.user.role_name)
  res.render('inbox', { user: req.user.name, role: req.user.role_name });
});

// Ruta para mostrar el gráfico con el porcentaje de material 3
const materialMap = {
  0: 'Sin registro',
  1: 'Tierra',
  2: 'Ripio',
  3: 'Pavic-Enladrillado',
  4: 'Piedra',
  5: 'Loseta',
  6: 'Adoquin',
  7: 'Asfalto',
  8: 'Pavimento Rigido',
};
// Ruta para obtener el porcentaje de material 3
app.get('/porcentaje-material', async (req, res) => {
  try {
    const result = await poolbdsi.query(`
      SELECT material,
      COUNT(*) AS cantidad,
      (COUNT(*) * 100.0 / (SELECT COUNT(*) FROM "InfraestructuraVial".vias_poligonos)) AS porcentaje
      FROM "InfraestructuraVial".vias_poligonos
      GROUP BY material
      ORDER BY material;
    `);
    const porcentajes = result.rows.map(row => {
      let porcentaje = parseFloat(row.porcentaje);

      if (isNaN(porcentaje)) {
        porcentaje = 0;
      } else {
        porcentaje = porcentaje.toFixed(2);
      }

      // Usar el mapa para cambiar el número de material por su descripción
      const descripcionMaterial = materialMap[row.material] || 'Desconocido';

      return {
        material: descripcionMaterial, // Aquí se usa la descripción en lugar del número
        cantidad: row.cantidad,
        porcentaje: porcentaje
      };
    });

    res.json(porcentajes);
  } catch (err) {
    console.error('Error ejecutando la consulta en la segunda base de datos', err);
    res.status(500).send('Error en el servidor');
  }
});

function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect('/users/geoport');
  }
  next();
}

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/users/login');
}

// redirect  
app.get('/users/21', checkNotAuthenticated, (req, res) => {
  res.render('21', { user: req.user.name, role: req.user.role_name });
});
app.get('/users/help2', checkNotAuthenticated, (req, res) => {
  res.render('help2', { user: req.user.name, role: req.user.role_name });
});

app.get('/users/lospinos', checkNotAuthenticated, (req, res) => {
  res.render('lospinos', { user: req.user.name, role: req.user.role_name });
});

app.get('/users/geoportpinos', checkNotAuthenticated, (req, res) => {
  res.render('geoportpinos', { user: req.user.name, role: req.user.role_name });
});

app.get('/users/mantenimiento', checkNotAuthenticated, (req, res) => {
  res.render('mantenimiento', { user: req.user.name, role: req.user.role_name });
});
app.get('/users/geoportVias', checkNotAuthenticated, (req, res) => {
  res.render('geoportVias', { user: req.user.name, role: req.user.role_name });
});

//ACCESO A LOS PORTALES POR DISTRITO 
//para los usurarios root

app.get('/users/geoportD1', checkNotAuthenticated, (req, res) => {
  res.render('distritos/geoportD1', { user: req.user.name, role: req.user.role_name });
});
app.get('/users/geoportVias', checkNotAuthenticated, (req, res) => {
  res.render('geoportVias', { user: req.user.name, role: req.user.role_name });
});
app.get('/users/geoportPredios', checkNotAuthenticated, (req, res) => {
  res.render('geoportPredios', { user: req.user.name, role: req.user.role_name });
});
app.get('/users/geoportMTierra', checkNotAuthenticated, (req, res) => {
  res.render('geoportMTierra', { user: req.user.name, role: req.user.role_name });
});

app.get('/users/geoportD2', checkNotAuthenticated, (req, res) => {
  res.render('distritos/geoportD2', { user: req.user.name, role: req.user.role_name });
});
app.get('/users/geoportD3', checkNotAuthenticated, (req, res) => {
  res.render('distritos/geoportD3', { user: req.user.name, role: req.user.role_name });
});

app.get('/users/geoportD4', checkNotAuthenticated, (req, res) => {
  res.render('distritos/geoportD4', { user: req.user.name, role: req.user.role_name });
});
app.get('/users/geoportD6', checkNotAuthenticated, (req, res) => {
  res.render('distritos/geoportD6', { user: req.user.name, role: req.user.role_name });
});

app.get('/users/geoportD7', checkNotAuthenticated, (req, res) => {
  res.render('distritos/geoportD7', { user: req.user.name, role: req.user.role_name });
});

app.get('/users/geoportDLL', checkNotAuthenticated, (req, res) => {
  res.render('distritos/geoportDLL', { user: req.user.name, role: req.user.role_name });
});

app.get('/users/geoportD1', checkNotAuthenticated, (req, res) => {
  res.render('distritos/geoportD1', { user: req.user.name, role: req.user.role_name });
});

app.get('/users/geoportD2', checkNotAuthenticated, (req, res) => {
  res.render('distritos/geoportD2', { user: req.user.name, role: req.user.role_name });
});
app.get('/users/geoportD3', checkNotAuthenticated, (req, res) => {
  res.render('distritos/geoportD3', { user: req.user.name, role: req.user.role_name });
});

app.get('/users/geoportD4', checkNotAuthenticated, (req, res) => {
  res.render('distritos/geoportD4', { user: req.user.name, role: req.user.role_name });
});
app.get('/users/geoportD6', checkNotAuthenticated, (req, res) => {
  res.render('distritos/geoportD6', { user: req.user.name, role: req.user.role_name });
});

app.get('/users/geoportD7', checkNotAuthenticated, (req, res) => {
  res.render('distritos/geoportD7', { user: req.user.name, role: req.user.role_name });
});

app.get('/users/geoportDLL', checkNotAuthenticated, (req, res) => {
  res.render('distritos/geoportLL', { user: req.user.name, role: req.user.role_name });
});

// Nueva ruta para descargar archivos y registrar la descarga
app.get('/users/descargar/:nombreArchivo', checkNotAuthenticated, (req, res) => {
  const nombreArchivo = req.params.nombreArchivo;
  console.log(nombreArchivo)
  const rutaArchivo = path.resolve(__dirname, 'public/ORTOFOTOS', nombreArchivo); // Ajusta esta ruta a la ubicación real de tus archivos

  //console.log(rutaArchivo)
  if (!fs.existsSync(rutaArchivo)) {
    return res.status(404).send('Archivo no encontrado.');
  }
  const registroDescarga = {
    usuario_id: req.user ? req.user.id : null,
    ip: req.ip,
    nombre_archivo: nombreArchivo,
    tamano_archivo: fs.statSync(rutaArchivo).size,
    fecha_hora: new Date(),
    resultado: 'Iniciado'
  };

  res.download(rutaArchivo, async (err) => {
    if (err) {
      registroDescarga.resultado = 'Fallido';
      await guardarRegistroDescarga(registroDescarga);
      //res.status(500).send("Error al descargar el archivo.");
      res.render('geoport', { user: req.user.name, role: req.user.role_name });
    } else {
      registroDescarga.resultado = 'Éxito';
      await guardarRegistroDescarga(registroDescarga);
    }
  });
});

// Ruta para servir el archivo HTML con el formulario de descarga
app.get('/descargar-archivo', checkNotAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'descargar-archivo.html'));
});

app.get('/users/descargados', checkNotAuthenticated, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM "learnerlogin".descargas WHERE usuario_id = $1', [req.user.id]);

    // Convertir las fechas al formato 'YYYY-MM-DD HH:mm:ss.SSS'
    result.rows.forEach(row => {
      for (const key in row) {
        if (row[key] instanceof Date) {
          row[key] = format(row[key], 'yyyy-MM-dd HH:mm:ss.SSS');
        }
      }
    });

    //  console.log(result.rows);
    res.json(result.rows); // Enviar datos en formato JSON
  } catch (err) {
    console.error('Error al obtener las descargas:', err);
    res.status(500).send('Error al obtener las descargas');
  }
});

//grilla 24
app.get('/grilla24', async (req, res) => {
  try {
    const query = `
      SELECT id, ST_AsGeoJSON(ST_Transform(geom, 4326)) AS geom, id, texto, distrito_a, levantamiento_drone, procesamiento, post_procesamiento, publicacion_geoportal, fecha_levantamiento,estado_acumulativo FROM "fotogrametria".grilla2024` ;
    const result = await pool.query(query);

    if (result.rows.length > 0) {
      // Crear una colección de Features (GeoJSON FeatureCollection)
      const featureCollection = {
        type: "FeatureCollection",
        features: result.rows.map(row => ({
          type: "Feature",
          geometry: JSON.parse(row.geom),  // GeoJSON Geometry
          properties: {
            id: row.id,
            texto: row.texto,
            distrito_a: row.distrito_a,
            levantamiento_drone: row.levantamiento_drone,
            procesamiento: row.procesamiento,
            post_procesamiento: row.post_procesamiento,
            publicacion_geoportal: row.publicacion_geoportal,
            fecha_levantamiento: row.fecha_levantamiento,
            estado_acumulativo: row.estado_acumulativo

          }
        }))
      };

      res.json(featureCollection);  // Enviar la colección de features como GeoJSON
    } else {
      res.status(404).json({ error: 'No se encontraron grillas' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al consultar la base de datos en grillas' });
  }
});

// poligonos vias
app.get('/vias24', async (req, res) => {
  try {
    const query = `
      SELECT id, ST_AsGeoJSON(ST_Transform(geom, 4326)) AS geom, id, distrito_c, distrito_a, cod_via, material, fecha_mate, nombre_via, perfil_via, calzada FROM "InfraestructuraVial".vias_poligonos` ;
    const result = await poolbdsi.query(query);

    if (result.rows.length > 0) {
      // Crear una colección de Features (GeoJSON FeatureCollection)
      const featureCollection = {
        type: "FeatureCollection",
        features: result.rows.map(row => ({
          type: "Feature",
          geometry: JSON.parse(row.geom),  // GeoJSON Geometry
          properties: {
            id: row.id,
            distrito_c: row.distrito_c,
            distrito_a: row.distrito_a,
            cod_via: row.cod_via,
            material: row.material,
            fecha_mate: row.fecha_mate,
            nombre_via: row.nombre_via,
            perfil_via: row.perfil_via,
            calzada: row.calzada

          }
        }))
      };

      res.json(featureCollection);  // Enviar la colección de features como GeoJSON
    } else {
      res.status(404).json({ error: 'No se encontraron grillas' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al consultar la base de datos en grillas' });
  }
});

app.get('/poligonos', async (req, res) => {
  try {
    const query = `
      SELECT id, ST_AsGeoJSON(ST_Transform(geom, 4326)) AS geom, objectid, codigo_cat, nro_inmueb, distrito_a,distrito_c,distrito_a,clase,tipo_emp,ubicacion,temporal,fijo,fecha,direccion_,tecnico,
      nro_tramit,zona,zonadr FROM "sicat".predios` ;
    const result = await pool.query(query);

    if (result.rows.length > 0) {
      // Crear una colección de Features (GeoJSON FeatureCollection)
      const featureCollection = {
        type: "FeatureCollection",
        features: result.rows.map(row => ({
          type: "Feature",
          geometry: JSON.parse(row.geom),  // GeoJSON Geometry
          properties: {
            id: row.id,
            objectid: row.objectid,
            codigo_cat: row.codigo_cat,
            nro_inmueb: row.nro_inmueb,
            distrito_a: row.distrito_a,
            distrito_c: row.distrito_c,
            clase: row.clase,
            tipo_emp: row.tipo_emp,
            ubicacion: row.ubicacion,
            temporal: row.temporal,
            fijo: row.fijo,
            fecha: row.fecha,
            direccion_: row.direccion_,
            tecnico: row.tecnico,
            nro_tramit: row.nro_tramit,
            zona: row.zona,
            zonadr: row.zonadr
          }
        }))
      };

      res.json(featureCollection);  // Enviar la colección de features como GeoJSON
    } else {
      res.status(404).json({ error: 'No se encontraron polígonos' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al consultar la base de datos' });
  }
});


//madre tierra
app.get('/presas', async (req, res) => {
  try {
    const query = `
      SELECT fid, ST_AsGeoJSON(ST_Transform(geom, 4326)) AS geom, cod, nombre, coord_este, coord_norte, lat, lon, cuenca_influencia, subcuenca ,rio, tipo_presa, tamanio, anio_construccion , proposito_uso FROM "gr_cuencas_presas".presa` ;
    const result = await poolbdmt.query(query);

    if (result.rows.length > 0) {
      // Crear una colección de Features (GeoJSON FeatureCollection)
      const featureCollection = {
        type: "FeatureCollection",
        features: result.rows.map(row => ({
          type: "Feature",
          geometry: JSON.parse(row.geom),  // GeoJSON Geometry
          properties: {
            cod: row.cod,
            nombre:row.nombre,
            coord_este: row.coord_este,
            coord_norte: row.coord_norte,
            procesamiento: row.procesamiento,
            lat: row.lat,
            lon: row.lon,
            cuenca_influencia: row.cuenca_influencia,
            subcuenca:row.subcuenca,
            rio:row.rio,
            tipo_presa:row.tipo_presa,
            tamanio:row.tamanio,
            anio_construccion:row.anio_construccion,
            proposito_uso: row.proposito_uso
           
          }
        }))
      };

      res.json(featureCollection);  // Enviar la colección de features como GeoJSON
    } else {
      res.status(404).json({ error: 'No se encontraron presas' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al consultar la base de datos en presas' });
  }
});

app.post( '/upimagespresa/:idcuenca',checkNotAuthenticated, upload.fields([
    { name: "foto_1", maxCount: 1 },
    { name: "foto_2", maxCount: 1 },
    { name: "foto_3", maxCount: 1 },
    { name: "foto_4", maxCount: 1 },
    { name: "foto_5", maxCount: 1 },
  ]), async (req, res) => {
    const fk_cod_presa = req.params.idcuenca;
    const descripcion = req.body.descripcion;
    const porcentaje = req.body.porcentaje;
    const fecha = new Date();

    const fotos = [
      req.files.foto_1?.[0]?.buffer || null,
      req.files.foto_2?.[0]?.buffer || null,
      req.files.foto_3?.[0]?.buffer || null,
      req.files.foto_4?.[0]?.buffer || null,
      req.files.foto_5?.[0]?.buffer || null,
    ];

    try {
      const result = await poolbdmt.query(
        `INSERT INTO "gr_cuencas_presas".inspeccion_presa 
        (fk_cod_presa, fecha, descripcion, porcentaje, foto_1, foto_2, foto_3, foto_4, foto_5) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
        [fk_cod_presa, fecha, descripcion,porcentaje, ...fotos]
      );

      res.redirect('/users/geoport');
    } catch (err) {
      console.error('Error al guardar las imágenes:', err);
      res.status(500).send('Error al guardar la inspección');
    }
  }
);


app.get('/inspecciones_presa/:cod_presa', checkNotAuthenticated, async (req, res) => {
  const { cod_presa } = req.params;

  try {
    const result = await poolbdmt.query(
      `SELECT id, fecha, descripcion, porcentaje FROM "gr_cuencas_presas".inspeccion_presa 
       WHERE fk_cod_presa = $1 
       ORDER BY fecha DESC`,
      [cod_presa]
    );

    res.json(result.rows); // [{ id: 1, fecha: '2024-01-01' }, ...]
  } catch (err) {
    console.error('Error al obtener inspecciones:', err);
    res.status(500).send('Error');
  }
});

app.get('/imagenes_inspeccion/:id', checkNotAuthenticated, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await poolbdmt.query(
      `SELECT foto_1, foto_2, foto_3, foto_4, foto_5 
       FROM "gr_cuencas_presas".inspeccion_presa 
       WHERE id = $1`,
      [id]
    );

    const fila = result.rows[0];

    res.json({
      foto_1: fila.foto_1 ? fila.foto_1.toString('base64') : null,
      foto_2: fila.foto_2 ? fila.foto_2.toString('base64') : null,
      foto_3: fila.foto_3 ? fila.foto_3.toString('base64') : null,
      foto_4: fila.foto_4 ? fila.foto_4.toString('base64') : null,
      foto_5: fila.foto_5 ? fila.foto_5.toString('base64') : null
    });

  } catch (err) {
    console.error('Error al obtener imágenes:', err);
    res.status(500).send('Error');
  }
});


app.get('/embalse', async (req, res) => {
  try {
    const query = `
      SELECT fid, ST_AsGeoJSON(ST_Transform(geom, 4326)) AS geom, cod, nombre FROM "gr_cuencas_presas".embalse` ;
    const result = await poolbdmt.query(query);

    if (result.rows.length > 0) {
      // Crear una colección de Features (GeoJSON FeatureCollection)
      const featureCollection = {
        type: "FeatureCollection",
        features: result.rows.map(row => ({
          type: "Feature",
          geometry: JSON.parse(row.geom),  // GeoJSON Geometry
          properties: {
            cod: row.cod,
            nombre: row.nombre
          }
        }))
      };
      res.json(featureCollection);  // Enviar la colección de features como GeoJSON
    } else {
      res.status(404).json({ error: 'No se encontraron embalses' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al consultar la base de datos en embalse' });
  }
});



app.get('/users/descargarot/:nombreArchivo', checkNotAuthenticated, (req, res) => {
  const nombreArchivo = req.params.nombreArchivo;
  console.log(nombreArchivo)
  const rutaArchivo = path.resolve(__dirname, 'public/ORTOFOTOS_OT', nombreArchivo); // Ajusta esta ruta a la ubicación real de tus archivos

  //console.log(rutaArchivo)
  if (!fs.existsSync(rutaArchivo)) {
    return res.status(404).send('Archivo no encontrado.');
  }
  const registroDescarga = {
    usuario_id: req.user ? req.user.id : null,
    ip: req.ip,
    nombre_archivo: nombreArchivo,
    tamano_archivo: fs.statSync(rutaArchivo).size,
    fecha_hora: new Date(),
    resultado: 'Iniciado'
  };
  res.download(rutaArchivo, async (err) => {
    if (err) {
      registroDescarga.resultado = 'Fallido';
      await guardarRegistroDescarga(registroDescarga);
      //res.status(500).send("Error al descargar el archivo.");
      res.render('geoport', { user: req.user.name, role: req.user.role_name });
    } else {
      registroDescarga.resultado = 'Éxito';
      await guardarRegistroDescarga(registroDescarga);
    }
  });
});

let port = process.env.PORT;
if (port == null || port == '') {
  port = 5000;
}
app.listen(port, function () {
  console.log(`Server has started successfully at ${port}`);
});
