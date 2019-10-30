const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');

const { User } = require('../models/index');

module.exports = function (passport) {
  passport.use(
    new LocalStrategy(
      { usernameField: 'email', passwordField: 'password' },
      async (email, password, done) => {

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

      }),
  );
}