const bcrypt = require('bcrypt');
const { pool } = require('../config');

exports.renderLogin = (req, res) => res.render('login');
exports.renderRegister = (req, res) => res.render('register');



exports.registerUser = async (req, res) => {
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
    const userCheck = await pool.query(
      `SELECT * FROM "learnerlogin".users WHERE username = $1`,
      [username]
    );
    if (userCheck.rows.length > 0) {
      return res.render('register', { message: 'Username already registered' });
    }

    // Obtener el role_id a partir del nombre del rol
    const roleResult = await pool.query(
      `SELECT id FROM "learnerlogin".roles WHERE role_name = $1`,
      [role]
    );
    if (roleResult.rows.length === 0) {
      return res.render('register', { message: 'Role not found' });
    }

    const roleId = roleResult.rows[0].id;

    // Insertar usuario
    await pool.query(
      `INSERT INTO "learnerlogin".users (name, username, password, role_id, acces)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, password`,
      [name, username, hashedPassword, roleId, acces]
    );

    req.flash('success_msg', 'You are successfully registered');
    res.redirect('/users/geoport');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
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