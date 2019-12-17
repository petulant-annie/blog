const bcrypt = require('bcrypt');
const saltRounds = 10;

const getHash = async (password) => {
  const hash = await bcrypt.hash(password, saltRounds);
  if (hash) {
    return hash;
  } else { throw new Error; }
};

module.exports = getHash;