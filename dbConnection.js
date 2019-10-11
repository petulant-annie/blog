const Sequelize = require('sequelize');
const sequelize = new Sequelize(
  `${process.env.DATABASE}`,
  `${process.env.USERNAME}`,
  `${process.env.PASSWORD}`,
  {
    dialect: 'mysql',
    host: `${process.env.HOST}`,
  });

// sequelize.authenticate()
//   .then(() => console.log('db conected'))
//   .catch((err) => console.log('Error ' + err));

module.exports = sequelize;