const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');

const { User } = require('../models/index');

module.exports = function (passport) {

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
      done(err, user);
    });
  });

  passport.use(
    new LocalStrategy(
      { usernameField: 'email', passwordField: 'password' }, (email, password, done) => {
        User.findOne({
          where: { email: email },
          raw: true,
          nest: true,
        })
          .then(user => {
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
      }),
  )
}