const express = require('express');
const fs = require('fs');
const uuidv1 = require('uuid/v1');
const usersRouter = express.Router();

const users = require('../users');
let currentUser = '';

function findCurrentUser(index) {
  users.data.find(user => {
    user.id === index ? currentUser = user : new Error();
  });
}

function writeData(path, data) {
  fs.writeFile(path, JSON.stringify(data), (err) => { if (err) { throw err } });
}

usersRouter.get('/', (req, res, next) => {
  try {
    fs.readFile('./users.json', 'utf8', (err, data) => {
      if (err) { throw err }
      res.send(data);
    });
  }
  catch (err) { next(err); }
});

usersRouter.get('/:id', (req, res, next) => {
  try {
    findCurrentUser(req.params.id);
    res.send({ data: currentUser });
  } catch (err) { next(err); }
});

usersRouter.post('/', async (req, res, next) => {
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

usersRouter.put('/:id', async (req, res, next) => {
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

usersRouter.delete('/:id', async (req, res, next) => {
  try {
    const position = users.data.findIndex(item => item.id === req.params.id);
    await users.data.splice(position, 1);
    writeData('./users.json', users);
    await res.send(users);
  } catch (err) { next(err); }
});

module.exports = usersRouter;
