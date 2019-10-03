const express = require('express');
const https = require('https');
const router = express.Router();

router.get('/api/v1/users', (req, res) => {
  res.status(200).send('hello users');
});

router.get('/api/v1/users/:id', (req, res) => {
  res.status(200).send('hello users id');
});

router.post('/api/v1/users', (req, res) => {
  res.status(201).send('post');
});

router.put('/api/v1/users/:id', (req, res) => {
  res.status(200).send('hello put');

});

router.delete('/api/v1/users/:id', (req, res) => {
  res.status(200).send('hello delete');

});

router.get('*', (req, res) => {
  https.get(process.env.FRONTED_URL, response => response.pipe(res));
});

module.exports = { rout: router }