const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const logger = require('./logger').logger;
require('dotenv').config();

const app = express();

const router = require('./routes/main');
const sequelize = require('./dbConnection');
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(cors());

app.use('/', router);
app.use((err, req, res) => {
  logger.error(err, err.message);
  res.status(500).send(err);
});

sequelize
  .authenticate()
  .then(() => {
    logger.info('Connection has been established successfully.');
    mongoose.connect(`${process.env.MONGO_DB}`,
      { useNewUrlParser: true, useUnifiedTopology: true }, (err) => {
        if (err) { return logger.error(err, err.message) }
        app.listen(PORT, () => logger.info(`Server started on port ${PORT}`));
      });
  })
  .catch(err => {
    logger.error('Unable to connect to the database:', err);
  })
  .done();