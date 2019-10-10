const express = require('express');
const fs = require('fs');
const uuidv1 = require('uuid/v1');
const articlesRouter = express.Router();

const articles = require('../articles');
const { findById, writeData } = require('../modules/helpers');

articlesRouter.get('/', (req, res, next) => {
  try {
    fs.readFile('./articles.json', 'utf8', (err, data) => {
      if (err) { throw err; }
      res.send(data);
    });
  }
  catch (err) { next(err); }
});

articlesRouter.get('/:id', (req, res, next) => {
  try {
    findById(req.params.id, articles);
    res.send({ data: findById(req.params.id, articles) });
  } catch (err) { next(err); }
});

articlesRouter.post('/', async (req, res, next) => {
  try {
    const newArticle = {
      id: uuidv1(),
      title: req.body.title,
      content: req.body.content,
      author: req.body.author,
      publishedAt: req.body.publishedAt,
    }
    articles.data.unshift(newArticle);
    await writeData('./articles.json', articles);
    res.send({ data: [newArticle] });
  } catch (err) { next(err); }
});

articlesRouter.put('/:id', async (req, res, next) => {
  try {
    const position = articles.data.findIndex(item => item.id === req.params.id);
    articles.data[position] = {
      id: req.params.id,
      title: req.body.title,
      content: req.body.content,
      author: req.body.author,
      publishedAt: req.body.publishedAt
    }
    await writeData('./articles.json', articles);
    res.send({ data: [articles.data[position]] });
  } catch (err) { next(err); }
});

articlesRouter.delete('/:id', async (req, res, next) => {
  try {
    const position = articles.data.findIndex(item => item.id === req.params.id);

    articles.data.splice(position, 1);
    await writeData('./articles.json', articles);
    const articlesArr = articles.data.reverse();
    res.send({ data: articlesArr });
  } catch (err) { next(err); }
});

module.exports = articlesRouter;
