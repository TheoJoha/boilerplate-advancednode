'use strict';
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const myDB = require('./connection');
const fccTesting = require('./freeCodeCamp/fcctesting.js');
const session = require('express-session')
const passport = require('passport')
const routes = require('./routes.js');
const auth = require('./auth.js')

const app = express();

const http = require('http').createServer(app);
const io = require('socket.io')(http);


app.set('view engine', 'pug'); // add pug as view engine
app.set('views', './views/pug') // set views property of app

app.use(cors());

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  cookie: { secure: false }
}));

app.use(passport.initialize())
app.use(passport.session())

fccTesting(app); //For FCC testing purposes
app.use('/public', express.static(process.cwd() + '/public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


myDB(async client => {
  const myDataBase = await client.db('database').collection('users');

  routes(app, myDataBase);
  auth(app, myDataBase);

  let currentUsers = 0;


  io.on('connection', socket => {
    console.log('A user has connected');
    ++currentUsers;
    io.emit('user count', currentUsers);

    socket.on('disconnect', () => {
      /*anything you want to do on disconnect*/
      --currentUsers;
      io.emit('user count', currentUsers);
    });

  });

}).catch(e => {
  app.route('/').get((req, res) => {
    res.render('index', { title: e, message: 'Unable to connect to database' });
  });
});
  
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});

