const express = require('express');
const router = express.Router();

const passport = require('passport');
const bcrypt = require('bcrypt');

const knex = require('knex')(require('../knexfile.js'));

require('dotenv').config();

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
