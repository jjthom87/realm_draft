const express = require('express');
const path = require('path');

// Middleware for creating a session id on server and a session cookie on client
const expressSession = require('express-session');
const MySQLStore = require('express-mysql-session')(expressSession);

const options = require('./knexfile.js').connection

const sessionStore = new MySQLStore(options);

// cors package prevents CORS errors when using client side API calls
const cors = require('cors');

// Add http headers, small layer of security
const helmet = require('helmet');

const cookieParser = require('cookie-parser')
const passport = require('passport');

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
    saveUninitialized: true,
    store: sessionStore
  })
);
// Initialize Passport middleware
app.use(passport.initialize());

// Passport.session middleware alters the `req` object with the `user` value
// that converts session id from the client cookie into a deserialized user object.
// This middleware also requires `serializeUser` and `deserializeUser` functions written below
// Additional information: https://stackoverflow.com/questions/22052258/what-does-passport-session-middleware-do
app.use(passport.session());

const setCookieExpiration = function (req, res, next) {
  // if(req.session && req.session.cookie._expires < new Date()){
  //   console.log(req.session)
  //   var hour = 3600000
  //   req.session.cookie._expires = new Date(Date.now() + hour)
  // }
  // next()
}

// app.use(setCookieExpiration)

app.get('/', function(req,res){
	res.sendFile(path.join(__dirname, '../client/html/index.html'));
});

app.get('/sign-up', function(req,res){
	res.sendFile(path.join(__dirname, '../client/html/sign_up.html'));
});

app.get('/browser-refresh', function(req,res){
  console.log(req.session)
  // console.log(new Date(req.session.cookie.created).getSeconds() + 60000000000);
  // console.log(new Date().getSeconds() + 60000000000)
  // if(req.session && (new Date(req.session.cookie.created).getSeconds() + 60000000000) < new Date().getSeconds() + 60000000000){
  //   console.log(req.session)
  //   var hour = 60000000000
  //   req.session.cookie._expires = new Date(Date.now() + hour)
  //   req.session.cookie.created = new Date()
  // }
});

app.use(express.static('./client'));

const authRoutes = require('./routes/auth');
app.use('/auth', authRoutes);

const apiRoutes = require('./routes/api');
app.use('/api', apiRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}.`);
});