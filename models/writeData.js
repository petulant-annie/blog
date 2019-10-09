const fs = require('fs');

function writeData(path, data) {
  fs.writeFile(path, JSON.stringify(data), (err) => { if (err) { throw err } });
}

module.exports = writeData;