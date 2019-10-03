const express = require('express');
const https = require('https');
const router = express.Router();

const data = require('./users');

router.get('*', (req, res) => {
  https.get(process.env.FRONTED_URL, response => response.pipe(res));
});

// router.get('/users', (req, res) => {
//   res.status(200).setHeader('Content-Type', 'application/json');
//   res.send(data);
// });

router.get('/users/:id', (req, res) => {
  res.status(200).send('hello users id');
});

router.post('/users', (req, res) => {
  res.status(201).send('post');
});

router.put('/users/:id', (req, res) => {
  res.status(200).send('hello put');

});

router.delete('/users/:id', (req, res) => {
  res.status(200).send('hello delete');

});

router.get('api/v1/blog', (req, res) => {
  res.status(200).send('hello users');
});

router.get('/blog/:id', (req, res) => {
  res.status(200).send('hello users id');
});

router.post('/blog', (req, res) => {
  res.status(201).send('post');
});

router.put('/blog/:id', (req, res) => {
  res.status(200).send('hello put');

});

router.delete('/blog/:id', (req, res) => {
  res.status(200).send('hello delete');

});

module.exports = { rout: router }