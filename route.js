const express = require('express');
const https = require('https');
const fs = require('fs');
const router = express.Router();

const users = require('./users');
let current = '';
let index = null;

function currentUser(index) {
  users.data.find(user => {
    if (user.id === index) {
      return current = user;
    }
  });
}

function currentIndex(url) {
  return index = parseInt(url.split('/').slice(4));
}

router.get('/api/v1/users', (req, res) => {
  res.writeHeader(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(users));
});

router.get('/api/v1/users/:id', (req, res) => {
  res.writeHeader(200, { 'Content-Type': 'application/json' });
  currentIndex(req.url);
  currentUser(index);

  res.end(JSON.stringify({ data: current }));
});

router.post('/api/v1/users', async (req, res) => {
  res.writeHeader(200, { 'Content-Type': 'application/json' });

  let id = await users.data.length > 0 ? users.data[users.data.length - 1].id + 1 : 0;

  let newUser = {
    id: id,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email
  }
  await fs.writeFileSync('./users.json', JSON.stringify({ data: [...users.data, newUser] }));

  await res.end(JSON.stringify(users));
});

router.put('/api/v1/users/:id', async (req, res) => {
  res.writeHeader(200, { 'Content-Type': 'application/json' });
  currentIndex(req.url);
  currentUser(index);
  await users.data.splice(index, 1);

  let edited = {
    id: index,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email
  }

  let usersArr = { data: [...users.data, edited] };

  await fs.writeFileSync('./users.json', JSON.stringify({ data: usersArr.data.sort((a, b) => a.id - b.id) }));

  await res.end(JSON.stringify(users));
});

router.delete('/api/v1/users/:id', async (req, res) => {
  // res.writeHeader(200, { 'Content-Type': 'application/json' });
  // currentIndex(req.url);
  // currentUser(index);
  // await users.data.splice(index, 1);

  // console.log(index, 'delete');

  // await fs.writeFileSync('./users.json', JSON.stringify({ data: [...users.data] }));

  // await res.end();
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