const express = require('express');
const app = express();
const { pool } = require('./config');
const ejs = require('ejs');
const bcrypt = require('bcrypt');
const session = require('express-session');
const flash = require('express-flash');
const passport = require('passport');
require('dotenv').config();
const path = require('path');
const fs = require('fs');
const initializePassport = require('./pswConfig');
const { checkRole } = require('./middleware'); // Importa el middleware de verificación de roles

const guardarRegistroDescarga = require('./guardarRegistroDescarga');// Importa la función para guardar registros
const { Console } = require('console');
const { format } = require('date-fns');


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

app.get('/users/register', checkAuthenticated, (req, res) => {
  res.render('register');
});
app.get('/users/login', checkAuthenticated, (req, res) => {
  res.render('login');
});

app.get('/users/dashboard', checkNotAuthenticated, (req, res) => {
  res.render('dashboard', { user: req.user.name });
});

//Rutas por roles de la base de datos

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
  res.render('geoport', { user: req.user.name, role:req.user.role_name});
});


app.get('/users/logout', (req, res) => {
  // req.logout();
  //res.render('index', { message: 'You have logged out successfully' });
  req.logout(function (err) {
    if (err) {
      console.error(err);

    }
    // Redirige al usuario a la página principal u otra página después de cerrar sesión
    res.redirect('/users/login');
  });
});

app.post('/users/register', async (req, res) => {
  let { name, username, password, password_confirm, role } = req.body; // Añadir role
  let errors = [];

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
    res.render('register', { errors, name, username, password, password_confirm, role });
  } else {
    const hashedPassword = await bcrypt.hash(password, 10);
    pool.query(
      `SELECT * FROM users WHERE username = $1`,
      [username],
      (err, results) => {
        if (err) {
          console.log(err);
        } if (results.rows.length > 0) {
          return res.render('register', {
            message: 'Username already registered'
          });
        } else {
          pool.query(
            `SELECT id FROM roles WHERE role_name = $1`,
            [role],
            (err, results) => {
              if (err) {
                throw err;
              }
              if (results.rows.length === 0) {
                return res.render('register', {
                  message: 'Role not found'
                });
              }
              const roleId = results.rows[0].id;
              pool.query(
                `INSERT INTO users (name, username, password, role_id)
                VALUES ($1, $2, $3, $4)
                RETURNING id, password`,
                [name, username, hashedPassword, roleId],
                (err, results) => {
                  if (err) {
                    throw err;
                  }
                  req.flash('success_msg', 'You are successfully registered');
                  res.redirect('/users/login');
                }
              );
            }
          );
        }
      }
    );
  }
});

app.post(
  '/users/login',
  passport.authenticate('local', {
    successRedirect: '/users/geoport',
   // successRedirect: '/users/mantenimiento',
    failureRedirect: '/users/login',
    failureFlash: true,
  })
);

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
  res.render('21', { user: req.user.name , role:req.user.role_name}); 
});
app.get('/users/help2', checkNotAuthenticated, (req, res) => { 
  res.render('help2', { user: req.user.name, role:req.user.role_name }); 
});

app.get('/users/lospinos', checkNotAuthenticated, (req, res) => { 
  res.render('lospinos', { user: req.user.name, role:req.user.role_name }); 
});

app.get('/users/geoportpinos', checkNotAuthenticated, (req, res) => { 
  res.render('geoportpinos', { user: req.user.name, role:req.user.role_name }); 
});

app.get('/users/mantenimiento', checkNotAuthenticated, (req, res) => { 
  res.render('mantenimiento', { user: req.user.name, role:req.user.role_name }); 
});



//ACCESO A LOS PORTALES POR DISTRITO 
//para los usurarios root

app.get('/users/geoportD1', checkNotAuthenticated, checkRole('root'), (req, res) => {
  res.render('distritos/geoportD1', { user: req.user.name, role:req.user.role_name });
});

app.get('/users/geoportD2', checkNotAuthenticated, checkRole('root'), (req, res) => {
  res.render('distritos/geoportD2', { user: req.user.name , role:req.user.role_name});
});
app.get('/users/geoportD3', checkNotAuthenticated, checkRole('root'), (req, res) => {
  res.render('distritos/geoportD3', { user: req.user.name, role:req.user.role_name });
});

app.get('/users/geoportD4', checkNotAuthenticated, checkRole('root'), (req, res) => {
  res.render('distritos/geoportD4', { user: req.user.name, role:req.user.role_name });
});
app.get('/users/geoportD6', checkNotAuthenticated, checkRole('root'), (req, res) => {
  res.render('distritos/geoportD6', { user: req.user.name, role:req.user.role_name });
});

app.get('/users/geoportD7', checkNotAuthenticated, checkRole('root'), (req, res) => {
  res.render('distritos/geoportD7', { user: req.user.name, role:req.user.role_name });
});

app.get('/users/geoportDLL', checkNotAuthenticated, checkRole('root'), (req, res) => {
  res.render('distritos/geoportDLL', { user: req.user.name, role:req.user.role_name });
});

//para los usuarios admin
app.get('/users/geoportD1', checkNotAuthenticated, checkRole('admin'), (req, res) => {
  res.render('distritos/geoportD1', { user: req.user.name, role:req.user.role_name });
});

app.get('/users/geoportD2', checkNotAuthenticated, checkRole('admin'), (req, res) => {
  res.render('distritos/geoportD2', { user: req.user.name, role:req.user.role_name });
});
app.get('/users/geoportD3', checkNotAuthenticated, checkRole('admin'), (req, res) => {
  res.render('distritos/geoportD3', { user: req.user.name, role:req.user.role_name });
});

app.get('/users/geoportD4', checkNotAuthenticated, checkRole('admin'), (req, res) => {
  res.render('distritos/geoportD4', { user: req.user.name, role:req.user.role_name });
});
app.get('/users/geoportD6', checkNotAuthenticated, checkRole('admin'), (req, res) => {
  res.render('distritos/geoportD6', { user: req.user.name, role:req.user.role_name });
});

app.get('/users/geoportD7', checkNotAuthenticated, checkRole('admin'), (req, res) => {
  res.render('distritos/geoportD7', { user: req.user.name, role:req.user.role_name });
});

app.get('/users/geoportDLL', checkNotAuthenticated, checkRole('admin'), (req, res) => {
  res.render('distritos/geoportLL', { user: req.user.name, role:req.user.role_name });
});







// Nueva ruta para descargar archivos y registrar la descarga
app.get('/users/descargar/:nombreArchivo', checkNotAuthenticated, (req, res) => {
  const nombreArchivo =  req.params.nombreArchivo;
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
      res.status(500).send("Error al descargar el archivo.");
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


/*app.get('/users/descargados', checkNotAuthenticated, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM descargas WHERE usuario_id = $1', [req.user.id]);
    res.render('descargados', { descargas: result.rows });
  } catch (err) {
    console.error('Error al obtener las descargas:', err);
    res.status(500).send('Error al obtener las descargas');
  }
});*/
app.get('/users/descargados', checkNotAuthenticated, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM descargas WHERE usuario_id = $1', [req.user.id]);
    
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


let port = process.env.PORT;
if (port == null || port == '') {
  port = 5000;
}
app.listen(port, function () {
  console.log(`Server has started successfully at ${port}`);
});