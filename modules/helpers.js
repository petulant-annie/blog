const fs = require('fs');

function findById(id, data) {
  return data.data.find(el => el.id === id);
}

function writeData(path, data) {
  fs.writeFile(path, JSON.stringify(data), (err) => { if (err) { throw err } });
}

module.exports = { findById, writeData };