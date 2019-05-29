// server/app.js
const express = require('express');
const morgan = require('morgan');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const passport = require('passport');
const BasicStrategy = require('passport-http').BasicStrategy;
const cors = require('cors');
const redis = require('redis');

require('dotenv').config();

import router from './router';
import User from './models/users';
//import { initConnection, publish, apiParams, consume, ack, nack }  from './api';

const app = express();

mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGO_URL, { useMongoClient: true })
  .then(() =>  console.log('Mongo connection succesful'))
  .catch((err) => console.error(err));


const redisClient = redis.createClient({ url: process.env.REDIS_URL});

redisClient.on("error", (err) => {
  console.error("Redis Error " + err)
});

redisClient.on("connect", () => {
  console.log("Redis connection succesful")
});

redisClient.on("monitor", (time, args, raw_reply) => {
  console.log(time + ": " + args)
});

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

app.get('/api/v1/redis/zcard/:systemId', cors(), passport.authenticate('basic', { session: false }), (req, res) => {
  if (redisClient) {
    redisClient.zcard(req.params.systemId + ".outgoing",  (err, reply) => {
      res.json({ zcard: reply ? reply.toString() : null })
    })
  }
  else res.json({ zcard: null })
});

app.use(express.static(path.resolve(__dirname, '..', 'build')));

app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '..', 'build', 'index.html'));
});

// API module example ++++++++++++++++++++++++++++++++++++++++++++++++++
/* initConnection('http://docker.rutt.io', 'a97c4874-05c7-1be1-61d1-6f103a0620cb');

publish('/buh1/foo').then(r => {
  console.log(r)
});

consume('/buh2').then(r => {
  console.log(r)
});

ack({ id: '123' }).then(r => {
  console.log(r)
})

nack({ id: '123' }, false).then(r => {
  console.log(r)
}) */
// API module example ------------------------------------------------

module.exports = app;
