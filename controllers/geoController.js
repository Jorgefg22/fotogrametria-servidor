const { pool, poolbdsi, poolbdmt } = require('../config');
const { format } = require('date-fns');

exports.getGrilla2024 = async (req, res) => {
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
            texto:row.texto,
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
};


exports.getLevantamientosPorGrilla = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
         id, 
         TO_CHAR(fecha_levantamiento, 'YYYY-MM-DD') AS fecha_levantamiento, 
         TO_CHAR(fecha_publicacion, 'YYYY-MM-DD') AS fecha_publicacion, 
         unidad_encargada, 
         id_grilla
       FROM "fotogrametria".levantamientofotogrametrico 
       WHERE id_grilla = $1 
       ORDER BY fecha_levantamiento DESC`, 
      [req.params.id_grilla]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al obtener levantamientos');
  }
};

exports.getVias24 = async (req, res) => {
  try {
    const query = `
      SELECT id, ST_AsGeoJSON(ST_Transform(geom, 4326)) AS geom, distrito_c, cod_via, material, fecha_mate, nombre_via, perfil_via, calzada 
      FROM "InfraestructuraVial".vias_poligonos`;
    const result = await poolbdsi.query(query);
    const features = result.rows.map(row => ({
      type: "Feature",
      geometry: JSON.parse(row.geom),
      properties: { ...row }
    }));
    res.json({ type: "FeatureCollection", features });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al consultar vias24' });
  }
};

exports.getPoligonos = async (req, res) => {
  try {
    const query = `
      SELECT id, ST_AsGeoJSON(ST_Transform(geom, 4326)) AS geom, objectid, codigo_cat, nro_inmueb, distrito_a, distrito_c, clase, tipo_emp, ubicacion,
             temporal, fijo, fecha, direccion_, tecnico, nro_tramit, zona, zonadr 
      FROM "sicat".predios`;
    const result = await pool.query(query);
    const features = result.rows.map(row => ({
      type: "Feature",
      geometry: JSON.parse(row.geom),
      properties: { ...row }
    }));
    res.json({ type: "FeatureCollection", features });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al consultar predios' });
  }
};


exports.searchPoligonos = async (req, res) => {
  try {
    const { search } = req.query;

    if (!search) {
      return res.status(400).json({ error: 'Debe enviar un parámetro de búsqueda' });
    }

    const query = `
      SELECT id, ST_AsGeoJSON(ST_Transform(geom, 4326)) AS geom, objectid, codigo_cat, nro_inmueb, 
             distrito_a, distrito_c, clase, tipo_emp, ubicacion,
             temporal, fijo, fecha, direccion_, tecnico, nro_tramit, zona, zonadr 
      FROM "sicat".predios
      WHERE CAST(codigo_cat AS TEXT) ILIKE $1
         OR CAST(nro_inmueb AS TEXT) ILIKE $1
    `;

    const result = await pool.query(query, [`%${search}%`]);

    const features = result.rows.map(row => {
      const { geom, ...props } = row;
      return {
        type: "Feature",
        geometry: JSON.parse(geom),
        properties: props
      };
    });

    res.json({ type: "FeatureCollection", features });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al buscar predios' });
  }
};



exports.getManzanas = async (req, res) => {
  try {
    const query = `SELECT id, ST_AsGeoJSON(ST_Transform(geom, 4326)) AS geom, codigo, codigo_otb, nombre, st_area_sh, st_length_
      FROM "limites_operativos".Manzana `;
     
      /*SELECT id, ST_AsGeoJSON(ST_Transform(geom, 4326)) AS geom, codigo, codigo_otb, nombre, st_area_sh, st_length_
      FROM "limites_operativos".Manzana*/
    const result = await pool.query(query);
    const features = result.rows.map(row => ({
      type: "Feature",
      geometry: JSON.parse(row.geom),
      properties: { ...row }
    }));
    res.json({ type: "FeatureCollection", features });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al consultar manzana' });
  }
};

exports.getDistritosCat = async (req, res) => {
  try {
    const query = `SELECT id, ST_AsGeoJSON(ST_Transform(geom, 4326)) AS geom, codigo, nombre, st_area_sh, st_length_
      FROM "limites_operativos".distritos_catastrales `;
     
      /*SELECT id, ST_AsGeoJSON(ST_Transform(geom, 4326)) AS geom, codigo, codigo_otb, nombre, st_area_sh, st_length_
      FROM "limites_operativos".Manzana*/
    const result = await pool.query(query);
    const features = result.rows.map(row => ({
      type: "Feature",
      geometry: JSON.parse(row.geom),
      properties: { ...row }
    }));
    res.json({ type: "FeatureCollection", features });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al consultar manzana' });
  }
};


exports.getPresas = async (req, res) => {
  try {
    const query = `
      SELECT fid, ST_AsGeoJSON(ST_Transform(geom, 4326)) AS geom, cod, nombre, coord_este, coord_norte, lat, lon, cuenca_influencia,
             subcuenca, rio, tipo_presa, tamanio, anio_construccion, proposito_uso 
      FROM "gr_cuencas_presas".presa`;
    const result = await poolbdmt.query(query);
    const features = result.rows.map(row => ({
      type: "Feature",
      geometry: JSON.parse(row.geom),
      properties: { ...row }
    }));
    res.json({ type: "FeatureCollection", features });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al consultar presas' });
  }
};

exports.getEmbalses = async (req, res) => {
  try {
    const query = `
      SELECT fid, ST_AsGeoJSON(ST_Transform(geom, 4326)) AS geom, cod, nombre 
      FROM "gr_cuencas_presas".embalse`;
    const result = await poolbdmt.query(query);
    const features = result.rows.map(row => ({
      type: "Feature",
      geometry: JSON.parse(row.geom),
      properties: { ...row }
    }));
    res.json({ type: "FeatureCollection", features });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al consultar embalses' });
  }
};

exports.getInspeccionesPresa = async (req, res) => {
  try {
    const result = await poolbdmt.query(
      `SELECT id, fecha, descripcion, porcentaje FROM "gr_cuencas_presas".inspeccion_presa 
       WHERE fk_cod_presa = $1 ORDER BY fecha DESC`, [req.params.cod_presa]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al obtener inspecciones');
  }
};

exports.getImagenesInspeccion = async (req, res) => {
  try {
    const result = await poolbdmt.query(
      `SELECT foto_1, foto_2, foto_3, foto_4, foto_5 
       FROM "gr_cuencas_presas".inspeccion_presa WHERE id = $1`, [req.params.id]
    );
    const row = result.rows[0];
    res.json({
      foto_1: row.foto_1 ? row.foto_1.toString('base64') : null,
      foto_2: row.foto_2 ? row.foto_2.toString('base64') : null,
      foto_3: row.foto_3 ? row.foto_3.toString('base64') : null,
      foto_4: row.foto_4 ? row.foto_4.toString('base64') : null,
      foto_5: row.foto_5 ? row.foto_5.toString('base64') : null,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al obtener imágenes');
  }
};

exports.uploadInspeccionPresa = async (req, res) => {
  const { idcuenca } = req.params;
  const { descripcion, porcentaje } = req.body;
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
      [idcuenca, fecha, descripcion, porcentaje, ...fotos]
    );
    res.redirect('/users/geoportMtierra');
  } catch (err) {
    console.error('Error al guardar las imágenes:', err);
    res.status(500).send('Error al guardar inspección');
  }
};

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

exports.getPorcetajeMaterialVia = async (req, res) => {
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
};

exports.getLineasAltatension = async (req, res) => {
  try {
    const query = `
      SELECT id, ST_AsGeoJSON(ST_Transform(geom, 4326)) AS geom, empresa, nivel_volt, linea 
      FROM "fotogrametria".lineasAltaTension_2024`;
    
    const result = await pool.query(query);

    const features = result.rows.map(row => {
      const { geom, ...props } = row;
      return {
        type: "Feature",
        geometry: JSON.parse(geom),
        properties: props
      };
    });

    res.json({ type: "FeatureCollection", features });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al consultar líneas de alta tensión' });
  }
};

exports.getRadioBases = async (req, res) => {
  try {
    const query = `
      SELECT id, ST_AsGeoJSON(ST_Transform(geom, 4326)) AS geom, departamen, municipio, comunidad, direccion_ 
      FROM "fotogrametria".radiobases_2024`;
    const result = await pool.query(query);
    const features = result.rows.map(row => {
      const { geom, ...props } = row;
      return {
        type: "Feature",
        geometry: JSON.parse(geom),
        properties: props
      };
    });
    res.json({ type: "FeatureCollection", features });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al consultar las radio bases' });
  }
};

exports.getIdGrillasConRegistros = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT DISTINCT id_grilla
       FROM "fotogrametria".levantamientofotogrametrico
       ORDER BY id_grilla`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al obtener id_grillas');
  }
};