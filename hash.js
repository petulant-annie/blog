const bcrypt = require('bcrypt');
const saltRounds = 10;

const getHash = (password) => {
  return new Promise((res, rej) => {
    bcrypt.hash(password, saltRounds, (err, hash) => {
      if (err) {
        rej(err);
      } else { res(hash); }
    });
  });
}

module.exports = getHash;