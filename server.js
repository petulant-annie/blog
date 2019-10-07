const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');

const router = require('./route');

const app = express();
dotenv.config();
app.use(bodyParser.json());
app.use(cors());

app.use(express.static(`${process.env.FRONTED_URL}`));
app.use('/', router);
app.use((err, req, res) => {
  res.status(500);
  res.send(err);
});

app.listen(process.env.PORT || 3043, () => console.log('Server started on port 3043'));
