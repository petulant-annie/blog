require('dotenv').config();
const jwt = require('jsonwebtoken');

exports.verifyToken = (req, res, next) => {
  const bearerHeader = req.headers['authorization'];
  if (typeof bearerHeader !== 'undefined') {
    const bearer = bearerHeader.split(' ');
    const bearerToken = bearer[1];
    req.token = bearerToken;
    next();
  } else {
    return res.status(401).send(res);
  }
}

exports.getAccessToken = (userName) => {
  return new Promise((res, rej) => {
    jwt.sign({ userName: userName },
      process.env.SESSION_SECRET,
      { expiresIn: process.env.TOKEN_LIFE }, (err, token) => {
        if (err) { rej(err) }
        else { res(token) }
      });
  });
}