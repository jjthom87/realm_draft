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