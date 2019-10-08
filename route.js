const express = require('express');
const https = require('https');
const fs = require('fs');
const router = express.Router();

let users = require('./users');
let articles = require('./articles');
let currentUser = '';
let currentArticle = '';

function findCurrentUser(index) {
  users.data.find(user => {
    user.id === parseInt(index) ? currentUser = user : new Error();
  });
}

function findCurrentArticle(index) {
  articles.data.find(article => {
    article.id === parseInt(index) ? currentArticle = article : new Error();
  });
}

function writeData(path, data) {
  fs.writeFileSync(path, JSON.stringify(data));
}


router.get('/api/v1/users', (req, res, next) => {
  try {
    console.log({ data: users.data.sort((a, b) => { b.id - a.id }) });
    res.send({ data: users.data.sort((a, b) => { b.id - a.id }) });
  } catch (err) {
    new Error();
    next(err);
  }
});

router.get('/api/v1/users/:id', (req, res, next) => {
  try {
    findCurrentUser(req.params.id);

    res.send({ data: currentUser });
  } catch (err) {
    new Error();
    next(err);
  }

});

router.post('/api/v1/users', async (req, res, next) => {
  try {
    const id = users.data.length > 0 ? users.data[users.data.length - 1].id + 1 : 0;
    const newUser = {
      id: id,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email
    }
    users = { data: [...users.data, newUser] };
    writeData('./users.json', users);

    res.send(users);
    console.log(newUser);
  } catch (err) {
    new Error();
    next(err);
  }
});

router.put('/api/v1/users/:id', (req, res, next) => {
  try {
    const position = users.data.findIndex(item => item.id === parseInt(req.params.id));
    users.data[position] = {
      id: parseInt(req.params.id),
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email
    }

    writeData('./users.json', (users));
    res.send(users);
  } catch (err) {
    new Error();
    next(err);
  }
});

router.delete('/api/v1/users/:id', async (req, res, next) => {
  try {
    const position = users.data.findIndex(item => item.id === req.params.id);
    await users.data.splice(position, 1);

    writeData('./users.json', users);

    res.send(users);
  } catch (err) {
    new Error();
    next(err);
  }
});

router.get('/api/v1/blog', (req, res, next) => {
  try {

    res.send(articles);
  } catch (err) {
    new Error();
    next(err);
  }
});

router.get('/api/v1/blog/:id', (req, res, next) => {
  try {
    findCurrentArticle(req.params.id);

    res.send({ data: currentArticle });
  } catch (err) {
    new Error();
    next(err);
  }
});

router.post('/api/v1/blog', async (req, res, next) => {
  try {
    const id = articles.data.length > 0 ? articles.data[articles.data.length - 1].id + 1 : 0;
    const newArticle = {
      id: id,
      title: req.body.title,
      content: req.body.content,
      author: req.body.author,
      publishedAt: req.body.publishedAt
    }
    articles = { data: [...articles.data, newArticle] };
    writeData('./articles.json', articles);

    await res.send(articles);
  } catch (err) {
    new Error();
    next(err);
  }
});

router.put('/api/v1/blog/:id', (req, res, next) => {
  try {
    const position = articles.data.findIndex(item => item.id === parseInt(req.params.id));
    articles.data[position] = {
      id: parseInt(req.params.id),
      title: req.body.title,
      content: req.body.content,
      author: req.body.author,
      publishedAt: req.body.publishedAt
    }

    writeData('./articles.json', articles);

    res.end(articles);
  } catch (err) {
    new Error();
    next(err);
  }
});

router.delete('/api/v1/blog/:id', async (req, res, next) => {
  try {
    const position = articles.data.findIndex(item => item.id === req.params.id);
    await articles.data.splice(position, 1);

    writeData('./articles.json', articles);

    res.send(articles);
  } catch (err) {
    new Error();
    next(err);
  }
});

router.get('*', (req, res) => {
  https.get(process.env.FRONTED_URL, response => response.pipe(res));
});

module.exports = router;