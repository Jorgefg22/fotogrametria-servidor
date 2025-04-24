const { pool } = require('./config');

function checkRole(role) {
    return function (req, res, next) {
      if (req.isAuthenticated() && req.user.role_name === role) {
        return next();
      }
      req.flash('error_msg', 'You do not have permission to view this resource');
      res.redirect('/users/login');
    };
  }


  async function guardarRegistroDescarga(registro) {
    const { usuario_id, ip, nombre_archivo, tamano_archivo, fecha_hora, resultado } = registro;
    try {
      await pool.query(
        `INSERT INTO "learnerlogin".descargas (usuario_id, ip, nombre_archivo, tamano_archivo, fecha_hora, resultado)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [usuario_id, ip, nombre_archivo, tamano_archivo, fecha_hora, resultado]
      );
    } catch (err) {
      console.error('Error al guardar el registro de descarga:', err);
    }
  }
  
  module.exports = {
    checkRole, guardarRegistroDescarga 
  };
