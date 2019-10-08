const express = require('express');
const https = require('https');
const fs = require('fs');
const uuidv1 = require('uuid/v1');
const router = express.Router();

const users = require('./users');
const articles = require('./articles');
let currentUser = '';
let currentArticle = '';

function findCurrentUser(index) {
  users.data.find(user => {
    user.id === index ? currentUser = user : new Error();
  });
}

function findCurrentArticle(index) {
  articles.data.find(article => {
    article.id === index ? currentArticle = article : new Error();
  });
}

function writeData(path, data) {
  fs.writeFile(path, JSON.stringify(data), (err) => { if (err) { throw err } });
}

router.get('/api/v1/users', (req, res, next) => {
  try {
    fs.readFile('./users.json', 'utf8', (err, data) => {
      if (err) { throw err }
      res.send(data);
    });
  }
  catch (err) { next(err); }
});

router.get('/api/v1/users/:id', (req, res, next) => {
  try {
    findCurrentUser(req.params.id);
    res.send({ data: currentUser });
  } catch (err) { next(err); }
});

router.post('/api/v1/users', async (req, res, next) => {
  try {
    const newUser = {
      id: uuidv1(),
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email
    }
    let updUsers = { data: [newUser, ...users.data] };
    writeData('./users.json', updUsers);
    await res.send({ data: [newUser] });
  } catch (err) { next(err); }
});

router.put('/api/v1/users/:id', async (req, res, next) => {
  try {
    const position = users.data.findIndex(item => item.id === req.params.id);
    users.data[position] = {
      id: req.params.id,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email
    }
    writeData('./users.json', users);
    await res.send({ data: [users.data[position]] });
  } catch (err) { next(err); }
});

router.delete('/api/v1/users/:id', async (req, res, next) => {
  try {
    const position = users.data.findIndex(item => item.id === req.params.id);
    await users.data.splice(position, 1);
    writeData('./users.json', users);
    await res.send(users);
  } catch (err) { next(err); }
});

router.get('/api/v1/blog', (req, res, next) => {
  try {
    fs.readFile('./articles.json', 'utf8', (err, data) => {
      if (err) { throw err }
      res.send(data);
    });
  }
  catch (err) { next(err); }
});

router.get('/api/v1/blog/:id', (req, res, next) => {
  try {
    findCurrentArticle(req.params.id);
    res.send({ data: currentArticle });
  } catch (err) { next(err); }
});

router.post('/api/v1/blog', async (req, res, next) => {
  try {
    const newArticle = {
      id: uuidv1(),
      title: req.body.title,
      content: req.body.content,
      author: req.body.author,
      publishedAt: req.body.publishedAt
    }

    const articlesArr = { data: [newArticle, ...articles.data] };
    writeData('./articles.json', articlesArr);
    await res.send({ data: [newArticle] });
  } catch (err) { next(err); }
});

router.put('/api/v1/blog/:id', async (req, res, next) => {
  try {
    const position = articles.data.findIndex(item => item.id === req.params.id);
    articles.data[position] = {
      id: req.params.id,
      title: req.body.title,
      content: req.body.content,
      author: req.body.author,
      publishedAt: req.body.publishedAt
    }
    writeData('./articles.json', users);
    await res.send({ data: [articles.data[position]] });
  } catch (err) { next(err); }
});

router.delete('/api/v1/blog/:id', async (req, res, next) => {
  try {
    const position = articles.data.findIndex(item => item.id === req.params.id);

    await articles.data.splice(position, 1);
    writeData('./articles.json', articles);
    const articlesArr = articles.data.reverse();
    res.send({ data: articlesArr });
  } catch (err) { next(err); }
});

router.get('*', (req, res) => {
  https.get(process.env.FRONTED_URL, response => response.pipe(res));
});

module.exports = router;