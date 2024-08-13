const express = require('express');
const path = require('path');

// Middleware for creating a session id on server and a session cookie on client
const expressSession = require('express-session');

// cors package prevents CORS errors when using client side API calls
const cors = require('cors');

// Add http headers, small layer of security
const helmet = require('helmet');

const cookieParser = require('cookie-parser')
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');

// Knex instance
const knex = require('knex')(require('./knexfile.js'));

// Create Express app and also allow for app PORT to be optionally specified by an environment variable
const app = express();
const PORT = process.env.PORT || 5050;

// Require .env files for environment variables (keys and secrets)
require('dotenv').config();

// Enable req.body middleware
app.use(express.json());

// Initialize HTTP Headers middleware
app.use(helmet());

// Enable CORS (with additional config options required for cookies)
app.use(
  cors({
    origin: true,
    credentials: true
  })
);

app.use(cookieParser())
// Include express-session middleware (with additional config options required for Passport session)
app.use(
  expressSession({
    secret: "secret key",
    resave: false,
    saveUninitialized: true
  })
);
// Initialize Passport middleware
app.use(passport.initialize());

// Passport.session middleware alters the `req` object with the `user` value
// that converts session id from the client cookie into a deserialized user object.
// This middleware also requires `serializeUser` and `deserializeUser` functions written below
// Additional information: https://stackoverflow.com/questions/22052258/what-does-passport-session-middleware-do
app.use(passport.session());

passport.use(new LocalStrategy(
  (username, password, done) => {
      knex('users')
      .select('id')
      .select('username')
      .select('password_hash')
      .where({ username: username })
      .then(user => {
        if (!user.length) {
          done(null, false, {message: 'No User'});
        }
        bcrypt.compare(password, user[0].password_hash, function(err, result) {
          if(err || !result){
            done(null, false, {message: 'incorrect password'});
          }
          done(null, {user: user[0]})
        });
      });
  }
));

passport.use('local-signup', new LocalStrategy((username, password, done) => {
  var salt = bcrypt.genSaltSync(10);
  var password_hash = bcrypt.hashSync(password, salt);

    // First let's check if we already have this user in our DB
    knex('users')
      .select('id')
      .where({ username: username })
      .then(user => {
        if (user.length) {
          // If user is found, pass the user object to serialize function
          done(null, user[0]);
        } else {
          // If user isn't found, we create a record
          knex('users')
            .insert({
              password_hash: password_hash,
              salt: salt,
              username: username
            })
            .then(userId => {
              // Pass the user object to serialize function
              done(null, { id: userId[0] });
            })
            .catch(err => {
              console.log('Error creating a user', err);
            });
        }
      })
      .catch(err => {
        console.log('Error fetching a user', err);
      });
}));

  // `serializeUser` determines which data of the auth user object should be stored in the session
// The data comes from `done` function of the strategy
// The result of the method is attached to the session as `req.session.passport.user = 12345`
passport.serializeUser((userId, done) => {
  // console.log('serializeUser (user object):', userId);

  // Store only the user id in session
  return done(null, userId);
});

// `deserializeUser` receives a value sent from `serializeUser` `done` function
// We can then retrieve full user information from our database using the userId
passport.deserializeUser((userId, done) => {
  // console.log('deserializeUser (user id):', userId);
  knex('users')
    .where({ id: userId.user.id })
    .then(user => {
      // Remember that knex will return an array of records, so we need to get a single record from it
      // console.log('req.user:', user[0]);

      // The full user object will be attached to request object as `req.user`
      return done(null, user[0]);
    })
    .catch(err => {
      console.log('Error finding user', err);
    });
});

app.get('/', function(req,res){
	res.sendFile(path.join(__dirname, '../client/html/index.html'));
});

app.get('/sign-up', function(req,res){
	res.sendFile(path.join(__dirname, '../client/html/sign_up.html'));
});

app.use(express.static('./client'));

const authRoutes = require('./routes/auth');
app.use('/auth', authRoutes);

const apiRoutes = require('./routes/api');
app.use('/api', apiRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}.`);
});