const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const bcrypt = require('bcrypt');

const { User, OauthAccount } = require('../models/index');

const userAuth = async (firstName, lastName, email, provider, providerId, picture) => {
  const addAccount = (id) => {
    OauthAccount.findOrCreate({
      where: { providerUserId: providerId },
      defaults: {
        provider: provider,
        providerUserId: providerId,
        userId: id,
      }
    });
  }

  const user = await User.findOne({
    where: { email: email },
    raw: true,
    nest: true,
  });
  if (!user) {
    const newUser = await User.create({
      firstName: firstName,
      lastName: lastName,
      email: email,
      picture: picture,
    });
    addAccount(newUser.id);
    return newUser;
  } else {
    addAccount(user.id);
    return user;
  }
}

module.exports = function (passport) {
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
      const user = await userAuth(
        profile.name.givenName,
        profile.name.familyName,
        profile.emails[0].value,
        profile.provider,
        profile.id,
        profile.photos[0].value,
      );
      return done(null, user);
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
      const name = profile.displayName.split(' ');
      const user = await userAuth(
        name[0],
        name[1],
        profile.emails[0].value,
        profile.provider,
        profile.id,
        profile.photos[0].value,
      );
      return done(null, user);
    } catch (err) { return done(err); }
  }));
}