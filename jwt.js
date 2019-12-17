const jwt = require('jsonwebtoken');

exports.getAccessToken = (email) => {
  return new Promise((res, rej) => {
    jwt.sign({ email: email },
      process.env.SESSION_SECRET,
      { expiresIn: process.env.TOKEN_LIFE }, (err, token) => {
        if (err) { rej(err); }
        else { res(token); }
      });
  });
};