require('dotenv').config();
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const bcrypt = require('bcrypt');

const { User, OauthAccount } = require('../models/index');

module.exports = function (passport) {
  passport.use(
    new LocalStrategy(
      { usernameField: 'email', passwordField: 'password' },
      (email, password, done) => {
        User.unscoped().findOne({
          where: { email: email },
          raw: true,
          nest: true,
        }).then(user => {
          if (!user) {
            return done(null, false, { message: 'User not registered' })
          }
          bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) { throw err; }
            if (isMatch) {
              return done(null, user)
            } else {
              return done(null, false, { message: 'Password incorrect' })
            }
          });
        })
      }));

  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      const user = await User.findOne({
        where: { email: profile.emails[0].value },
        raw: true,
        nest: true,
      });
      if (!user) {
        return done(null, false, { message: 'User not registered' })
      } else {
        OauthAccount.findOrCreate({
          where: { providerUserId: profile.id },
          defaults: {
            provider: 'google',
            providerUserId: profile.id,
            userId: user.id,
          }
        });
        return done(null, user)
      }
    } catch (err) { return done(err); }
  }));
}