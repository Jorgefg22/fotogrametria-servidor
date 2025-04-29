const express = require('express');
const app = express();
const session = require('express-session');
const passport = require('passport');
const flash = require('express-flash');
const ejs = require('ejs');
const path = require('path');
require('dotenv').config();

const initializePassport = require('./pswConfig');
initializePassport(passport);

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const messageRoutes = require('./routes/messageRoutes');
const descargaRoutes = require('./routes/descargaRoutes');
const geoRoutes = require('./routes/geoRoutes');
const apiRoutes = require('./routes/apiRoutes');

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static('public'));
app.engine('html', ejs.renderFile);
app.set('view engine', 'html');
app.set('views', path.join(__dirname, 'views'));

app.use(session({
  secret: 'secret',
  resave: false,
  saveUninitialized: false,
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.use('/', authRoutes);
app.use('/users', userRoutes);
app.use('/messages', messageRoutes);
app.use('/descargas', descargaRoutes);
app.use('/geo', geoRoutes);
app.use('/api', apiRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));