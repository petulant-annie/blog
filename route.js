const express = require('express');
const https = require('https');
const fs = require('fs');
const router = express.Router();

let users = require('./users');
let articles = require('./articles');
let currentUser = '';
let index = null;
let currentArticle = '';

function findCurrentUser(index) {
  users.data.find(user => {
    if (user.id === index) {
      return currentUser = user;
    }
  });
}

function currentIndex(url) {
  return index = parseInt(url.split('/').slice(4));
}

function findCurrentArticle(index) {
  articles.data.find(article => {
    if (article.id === index) {
      return currentArticle = article;
    }
  });
}

router.get('/api/v1/users', (req, res) => {
  try {
    res.writeHeader(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(users));
  } catch (err) { new Error(); }
});

router.get('/api/v1/users/:id', (req, res) => {
  try {
    res.writeHeader(200, { 'Content-Type': 'application/json' });
    currentIndex(req.url);
    findCurrentUser(index);

    res.end(JSON.stringify({ data: currentUser }));
  } catch (err) { new Error(); }
});

router.post('/api/v1/users', async (req, res) => {
  try {
    await res.writeHeader(200, { 'Content-Type': 'application/json' });

    const id = users.data.length > 0 ? users.data[users.data.length - 1].id + 1 : 0;
    const newUser = {
      id: id,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email
    }

    users = { data: [...users.data, newUser] };

    await fs.writeFileSync('./users.json', JSON.stringify(users));
    await res.end(JSON.stringify(users));
  } catch (err) { new Error(); }
});

router.put('/api/v1/users/:id', (req, res) => {
  try {
    res.writeHeader(200, { 'Content-Type': 'application/json' });
    currentIndex(req.url);
    const position = users.data.findIndex(item => item.id === index);
    users.data[position] = {
      id: index,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email
    }

    fs.writeFileSync('./users.json', JSON.stringify(users));
    res.end(JSON.stringify(users));
  } catch (err) { new Error(); }
});

router.delete('/api/v1/users/:id', async (req, res) => {
  try {
    res.writeHeader(200, { 'Content-Type': 'application/json' });
    currentIndex(req.url);
    const position = users.data.findIndex(item => item.id === index);
    await users.data.splice(position, 1);

    fs.writeFileSync('./users.json', JSON.stringify(users));
    res.end(JSON.stringify(users));
  } catch (err) { new Error(); }
});

router.get('/api/v1/blog', (req, res) => {
  try {
    res.writeHeader(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(articles));
  } catch (err) { new Error(); }
});

router.get('/api/v1/blog/:id', (req, res) => {
  try {
    res.writeHeader(200, { 'Content-Type': 'application/json' });
    currentIndex(req.url);
    findCurrentArticle(index);

    res.end(JSON.stringify({ data: currentArticle }));
  } catch (err) { new Error(); }
});

router.post('/api/v1/blog', async (req, res) => {
  try {
    await res.writeHeader(200, { 'Content-Type': 'application/json' });

    const id = articles.data.length > 0 ? articles.data[articles.data.length - 1].id + 1 : 0;
    const newArticle = {
      id: id,
      title: req.body.title,
      content: req.body.content,
      author: req.body.author,
      publishedAt: req.body.publishedAt
    }

    articles = { data: [...articles.data, newArticle] };

    await fs.writeFileSync('./articles.json', JSON.stringify(articles));
    await res.end(JSON.stringify(articles));
  } catch (err) { new Error(); }
});

router.put('/api/v1/blog/:id', (req, res) => {
  try {
    res.writeHeader(200, { 'Content-Type': 'application/json' });
    currentIndex(req.url);

    const position = articles.data.findIndex(item => item.id === index);
    articles.data[position] = {
      id: index,
      title: req.body.title,
      content: req.body.content,
      author: req.body.author,
      publishedAt: req.body.publishedAt
    }

    fs.writeFileSync('./articles.json', JSON.stringify(articles));
    res.end(JSON.stringify(articles));
  } catch (err) { new Error(); }
});

router.delete('/api/v1/blog/:id', async (req, res) => {
  try {
    res.writeHeader(200, { 'Content-Type': 'application/json' });
    currentIndex(req.url);
    const position = articles.data.findIndex(item => item.id === index);
    await articles.data.splice(position, 1);

    fs.writeFileSync('./articles.json', JSON.stringify(articles));
    res.end(JSON.stringify(articles));
  } catch (err) { new Error(); }
});

router.get('*', (req, res) => {
  https.get(process.env.FRONTED_URL, response => response.pipe(res));
});

module.exports = router;