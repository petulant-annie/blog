require('dotenv').config();
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const bcrypt = require('bcrypt');

const asyncMiddleware = require('../asyncMiddleware');
const { User, oauthAccount } = require('../models/index');

module.exports = function (passport) {
  passport.use(
    new LocalStrategy(
      { usernameField: 'email', passwordField: 'password' },
      asyncMiddleware(async (email, password, done) => {
        const user = await User.unscoped().findOne({
          where: { email: email },
          raw: true,
          nest: true,
        })
        if (!user) {
          return done(null, false, { message: 'User not registered' })
        }
        const isMatch = await bcrypt.compare(password, user.password)
        if (isMatch) {
          return done(null, user)
        } else {
          return done(null, false, { message: 'Password incorrect' })
        }
      })),
  );

  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
  }, asyncMiddleware( (accessToken, refreshToken, profile, cb) => {

    oauthAccount.findOrCreate({
      provider: 'google',
      providerUserId: profile.id,
      userId: '',
    }, (err, user) => {
      return cb(err, user);
    });
  }
  )));

}
