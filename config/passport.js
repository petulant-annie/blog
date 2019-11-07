require('dotenv').config();
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const bcrypt = require('bcrypt');

const { User, OauthAccount } = require('../models/index');

module.exports = (passport) => {
  passport.use(
    new LocalStrategy(
      { usernameField: 'email', passwordField: 'password' },
      async (email, password, done) => {
        try {
          const user = await User.unscoped().findOne({
            where: { email: email },
            raw: true,
            nest: true,
          })
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

        } catch (err) { return done(err); }
      }));

  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      const addAccount = (user) => {
        OauthAccount.findOrCreate({
          where: { providerUserId: profile.id },
          defaults: {
            provider: 'google',
            providerUserId: profile.id,
            userId: user,
          }
        });
      }

      const user = await User.findOne({
        where: { email: profile.emails[0].value },
        raw: true,
        nest: true,
      });
      if (!user) {
        const newUser = await User.create({
          firstName: profile.name.givenName,
          lastName: profile.name.familyName,
          email: profile.emails[0].value,
          picture: profile.photos[0].value,
        });
        addAccount(newUser.id);

        return done(null, newUser);
      } else {
        addAccount(user.id);

        return done(null, user);
      }
    } catch (err) { return done(err); }
  }));

  passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_CLIENT_ID,
    clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
    callbackURL: process.env.FACEBOOK_CALLBACK_URL,
    profileFields: ['id', 'displayName', 'photos', 'email'],
    enableProof: true,
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      const addAccount = (user) => {
        OauthAccount.findOrCreate({
          where: { providerUserId: profile.id },
          defaults: {
            provider: 'facebook',
            providerUserId: profile.id,
            userId: user,
          }
        });
      }
      const user = await User.findOne({
        where: { email: profile.emails[0].value, },
        raw: true,
        nest: true,
      });
      if (!user) {
        const name = profile.displayName.split(' ');
        const newUser = await User.create({
          firstName: name[0],
          lastName: name[1],
          email: profile.emails[0].value,
          picture: profile.photos[0].value,
        });
        addAccount(newUser.id);

        return done(null, newUser);
      } else {
        addAccount(user.id);

        return done(null, user)
      }
    } catch (err) { return done(err); }
  }));
}