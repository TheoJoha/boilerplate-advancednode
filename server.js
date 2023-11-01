'use strict';
require('dotenv').config();
const express = require('express');
const myDB = require('./connection');
const fccTesting = require('./freeCodeCamp/fcctesting.js');
const session = require('express-session')
const passport = require('passport')
const { ObjectID } = require('mongodb');
const LocalStrategy = require('passport-local');
const bcrypt = require('bcrypt')
const routes = require('./routes.js');
const auth = require('./auth.js')

const app = express();


app.set('view engine', 'pug'); // add pug as view engine
app.set('views', './views/pug') // set views property of app

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



function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/');
};


myDB(async client => {
  const myDataBase = await client.db('database').collection('users');

  routes(app, myDataBase);
  auth(app, myDataBase);
}).catch(e => {
  app.route('/').get((req, res) => {
    res.render('index', { title: e, message: 'Unable to connect to database' });
  });
});
  
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});