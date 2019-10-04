const express = require('express');
const https = require('https');
const fs = require('fs');

const router = express.Router();

let users = require('./users');

router.get('/api/v1/users', (req, res) => {
  res.writeHeader(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(users));
});

router.get('/api/v1/users/:id', (req, res) => {
  res.writeHeader(200, { 'Content-Type': 'application/json' });
  
  

});

router.post('/api/v1/users', (req, res) => {
  res.writeHeader(200, { 'Content-Type': 'application/json' });

  fs.writeFileSync('./users.json',
    JSON.stringify({
      data: [...users.data,
        {
          id: users.data.length,
          firstName: req.body.firstName,
          lastName: req.body.lastName,
          email: req.body.email
        }
      ],
    })
  );
  res.end();

});

router.put('/api/v1/users/:id', (req, res) => {
  res.status(200).send('hello put');

});

router.delete('/api/v1/users/:id', (req, res) => {
  res.status(200).send('hello delete');

});

router.get('/api/v1/blog', (req, res) => {
  res.status(200).send('hello users');
});

router.get('/api/v1/blog/:id', (req, res) => {
  res.status(200).send('hello users id');
});

router.post('/api/v1/blog', (req, res) => {
  res.status(201).send('post');
});

router.put('/api/v1/blog/:id', (req, res) => {
  res.status(200).send('hello put');

});

router.delete('/api/v1/blog/:id', (req, res) => {
  res.status(200).send('hello delete');

});

router.get('*', (req, res) => {
  https.get(process.env.FRONTED_URL, response => response.pipe(res));
});

module.exports = router;