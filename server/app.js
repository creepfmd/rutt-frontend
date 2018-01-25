// server/app.js
const express = require('express');
const morgan = require('morgan');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const passport = require('passport');
const BasicStrategy = require('passport-http').BasicStrategy;
const cors = require('cors');

require('dotenv').config();

import router from './router';
import User from './models/users';

const app = express();

mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGO_URL, { useMongoClient: true })
  .then(() =>  console.log('Mongo connection succesful'))
  .catch((err) => console.error(err));

passport.use(new BasicStrategy( (username, password, done) => {
    User.findOne({ name: username }, function(err, user) {
      if (err) { return done(err); }
      if (!user) {
        return done(null, false, { message: 'Incorrect username.' });
      }
      if (user.password != password) {
        return done(null, false, { message: 'Incorrect password.' });
      }
      return done(null, user);
    });
  }
));

app.use(cors());

app.use(morgan(':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] :response-time ms'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(passport.initialize());

app.use('/api/v1', cors(), passport.authenticate('basic', { session: false }), router);

app.get('/api/v1/me', cors(), passport.authenticate('basic', { session: false }), (req, res) => {
  res.json(req.user)
});

app.use(express.static(path.resolve(__dirname, '..', 'build')));

app.get('/', passport.authenticate('basic'), (req, res) => {
  if (req.user)
    res.json(req.user)
  else
    res.redirect('/login')
});

app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '..', 'build', 'index.html'));
});

module.exports = app;
