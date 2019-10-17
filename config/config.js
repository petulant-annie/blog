require('dotenv').config();

module.exports = {
  'development': {
    'username': process.env.USERNAME,
    'password': process.env.PASSWORD,
    'database': process.env.DATABASE,
    'host': process.env.HOST,
    'dialect': 'mysql'
  },

  'production': {
    'database': process.env.DATABASE,
    'username': process.env.USERNAME,
    'password': process.env.PASSWORD,
    'host': process.env.HOST,
    'dialect': 'mysql',
  }
}