const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();
const app = express();

const router = require('./routes/main');
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(cors());

app.use('/', router);
app.use((err, req, res) => {
  res.status(500).send(err, 'Error');
});

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
