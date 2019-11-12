const express = require('express');
const oauth = express.Router();
const passport = require('passport');

oauth.get('/google', passport.authenticate('google', {
  scope: ['profile', 'https://www.googleapis.com/auth/userinfo.email']
}));

oauth.post('/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => { res.send({ data: req.user }); });

oauth.get('/facebook',
  passport.authenticate('facebook', { scope: ['email'] }));

oauth.post('/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/login' }),
  (req, res) => { res.send({ data: req.user }); });

passport.serializeUser((currentId, done) => {
  done(null, currentId);
});

passport.deserializeUser((currentId, done) => {
  done(null, currentId);
});

module.exports = oauth;