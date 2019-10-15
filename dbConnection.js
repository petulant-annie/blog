const Sequelize = require('sequelize');
const sequelize = new Sequelize(
  'anna',
  'anna',
  'YR7phQAe2VJCAzWv',
  {
    dialect: 'mysql',
    host: '35.222.76.188',
  }
);

module.exports = sequelize;