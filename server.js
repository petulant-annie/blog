const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const router = require('./routes/main');

const app = express();
app.use(bodyParser.json());
app.use(cors());

app.use('/', router);
app.use((err, req, res) => {
  res.status(500).send(err, 'Error');
});

app.listen(process.env.PORT || 3000, () => console.log('Server started on port 3043'));
