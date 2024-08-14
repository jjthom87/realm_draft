const express = require('express');
const router = express.Router();

const passport = require('passport');
const bcrypt = require('bcrypt');

const knex = require('knex')(require('../knexfile.js'));

const LocalStrategy = require('passport-local').Strategy;

require('dotenv').config();

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

router.post('/sign-up',
  passport.authenticate('local-signup', { failureRedirect: '/', failureMessage: true }),
  function(req, res) {
    res.status(200).json({ success : true, message : 'authentication succeeded', user: req.user });        
  });

router.post('/sign-in',
  passport.authenticate('local', { failureRedirect: '/', failureMessage: true }),
  function(req, res) {
    res.status(200).json({ success : true, message : 'authentication succeeded', user: req.user.user.username });        
  });


router.get('/signed-in', (req, res) => {
  if(req.user){
    res.status(200).json({ success: true, user: req.user.username });
  } else {
    res.status(200).json({ success: false, user: null });        
  }
})
// Create a logout endpoint
router.get('/logout', (req, res) => {
  // Passport adds the logout method to request, will end user session
  req.logout((error) => {
    // This callback is called after logout
    if (error) {
        return res.status(500).json({message: "Server error. Please try again later",error: error});
    }
    // Redirect the user back to client-side application
    res.redirect(process.env.CLIENT_URL);
  });
});

// router.get('/success-callback', (req, res) => {
//   if (req.user) {
//     res.status(200).json(req.user);
//   } else {
//     res.status(401).json({ message: 'User is not logged in' });
//   }
// });

// Export this module
module.exports = router;
