const express = require('express');
const oauth = express.Router();
const passport = require('passport');

oauth.get('/google', passport.authenticate('google', { 
  scope: ['profile', 'email']
}));

oauth.post('/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  function (req, res) {
    console.log(req)

    res.send({ });
  });

oauth.get('/facebook', () => {

});

oauth.post('/facebook/callback', () => {

});

module.exports = oauth;