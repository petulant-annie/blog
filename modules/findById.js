function findById(id, data) { 
  return data.data.find(el => el.id === id); 
}

module.exports = findById;