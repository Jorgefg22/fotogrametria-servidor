const bcrypt = require('bcrypt');
const { pool } = require('../config');

exports.renderLogin = (req, res) => res.render('login');
exports.renderRegister = (req, res) => res.render('register');

exports.registerUser = async (req, res) => {
  // lógica para registrar usuario
};

exports.logoutUser = (req, res) => {
  req.logout(function (err) {
    if (err) console.error(err);
    res.redirect('/users/login');
  });
};

exports.getAccesos = async (req, res) => {
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
};