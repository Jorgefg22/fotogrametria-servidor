const { pool } = require('../config');
const { format } = require('date-fns');

exports.sendMessage = async (req, res) => {
  const { receiver_id, content, grilla_sol_lev } = req.body;
  const sender_id = req.user.id;
  const timestamp = new Date();
  try {
    await pool.query(
      'INSERT INTO "learnerlogin".messages (sender_id, receiver_id, content, grilla, timestamp) VALUES ($1, $2, $3, $4, $5)',
      [sender_id, receiver_id, content, grilla_sol_lev, timestamp]
    );
    res.redirect('/users/geoport');
  } catch (err) {
    console.error('Error al enviar el mensaje:', err);
    res.status(500).send('Error al enviar el mensaje');
  }
};

exports.getMessages = async (req, res) => {
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
};

exports.markAsRead = async (req, res) => {
  const messageId = req.params.id;
  try {
    const result = await pool.query(
      'UPDATE "learnerlogin".messages SET read = TRUE WHERE id = $1 AND receiver_id = $2 RETURNING *',
      [messageId, req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).send('Mensaje no encontrado o no autorizado');
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error al marcar como leído:', err);
    res.status(500).send('Error');
  }
};