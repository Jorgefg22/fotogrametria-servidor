const { pool } = require('../config');
const { format } = require('date-fns');
const fs = require('fs');
const path = require('path');

const guardarRegistroDescarga = async (registro) => {
  await pool.query(`
    INSERT INTO "learnerlogin".descargas (usuario_id, ip, nombre_archivo, tamano_archivo, fecha_hora, resultado)
    VALUES ($1, $2, $3, $4, $5, $6)
  `, [registro.usuario_id, registro.ip, registro.nombre_archivo, registro.tamano_archivo, registro.fecha_hora, registro.resultado]);
};

exports.descargarArchivo = (req, res) => {
  const nombreArchivo = req.params.nombreArchivo;
  console.log(nombreArchivo)
  const rutaArchivo = path.resolve(__dirname, '../public/ORTOFOTOS', nombreArchivo); // Ajusta esta ruta a la ubicación real de tus archivos

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
};

exports.descargarOrtofotoOT = (req, res) => {
  const nombreArchivo = req.params.nombreArchivo;
  const rutaArchivo = path.resolve(__dirname, '../public/ORTOFOTOS_OT', nombreArchivo);

  if (!fs.existsSync(rutaArchivo)) {
    return res.status(404).send('Archivo no encontrado.');
  }

  const registro = {
    usuario_id: req.user.id,
    ip: req.ip,
    nombre_archivo: nombreArchivo,
    tamano_archivo: fs.statSync(rutaArchivo).size,
    fecha_hora: new Date(),
    resultado: 'Iniciado'
  };

  res.download(rutaArchivo, async (err) => {
    registro.resultado = err ? 'Fallido' : 'Éxito';
    await guardarRegistroDescarga(registro);
    if (err) {
      res.render('geoport', { user: req.user.name, role: req.user.role_name });
    }
  });
};

exports.renderFormulario = (req, res) => {
  res.sendFile(path.join(__dirname, '../views/descargar-archivo.html'));
};

exports.getDescarados = async (req, res) => {
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

    console.log('ID de usuario:', req.user?.id);
    //  console.log(result.rows);
    res.json(result.rows); // Enviar datos en formato JSON
  } catch (err) {
    console.error('Error al obtener las descargas:', err);
    res.status(500).send('Error al obtener las descargas');
  }
};