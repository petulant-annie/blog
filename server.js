require('dotenv').config();
const http = require('http');
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const passport = require('passport');
const redis = require('redis');
const RedisStore = require('connect-redis')(session);
const socketio = require('socket.io');
const adapter = require('socket.io-redis');
const passportSocketIo = require('passport.socketio');

const router = require('./routes/main');
const sequelize = require('./dbConnection');
const errorLogger = require('./loggers/errorLogger').logger;
const infoLogger = require('./loggers/infoLogger').logger;
const { limiter, rateLimiter } = require('./limiter');

const app = express();

const PORT = process.env.PORT || 3000;
const redisClient = redis.createClient(
  { url: process.env.REDIS_URL }
);

app.set('trust proxy', 1);
app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors());

redisClient.on('error', (err) => {
  errorLogger.error(err, err.message)
});

const sessionConfig = {
  store: new RedisStore({
    client: redisClient,
  }),
  name: '_redisStore',
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 600000 },
}

app.use(session(sessionConfig));

app.use(limiter);

app.use(passport.initialize());
app.use(passport.session());
require('./config/passport')(passport);
passport.serializeUser((currentId, done) => { done(null, currentId); });
passport.deserializeUser((currentId, done) => { done(null, currentId); });

app.use('/', router);
app.use((err, req, res) => {
  errorLogger.error(err, err.message);
  res.status(500).send(err);
});

const server = http.createServer(app);
const io = socketio(server);

io.adapter(adapter(process.env.REDIS_URL));
io.use(passportSocketIo.authorize({
  key: sessionConfig.name,
  secret: sessionConfig.secret,
  store: sessionConfig.store,
  fail: (data, message, error, accept) => { accept(); },
}));

io.use((socket, next) => { next(); });

io.on('connect', (socket) => {
  io.of('/').adapter.clients((err, clients) => {
    console.log(`${clients.length} clients connected.`);
  });
  // const userId = socket.request.user.id;
  const userName = socket.request.user.lastName || 'Anonymous';
  // const isLoggedIn = socket.request.user.logged_in || false;
  const ip = socket.request.connection.remoteAddress;

  socket.use((packet, next) => {
    const event = packet[0];
    console.log({ event });
    rateLimiter.consume(ip).then(() => {
      next();
    }).catch(() => { next(new Error('Rate limit error')); });
  })

  socket.on('watch-comments', (articleId) => {
    console.log('comment to article id', articleId);
    // check permission ?
    socket.join(`article-${articleId}`, () => {
      const rooms = Object.keys(socket.rooms);
      const message = `${userName} has joined to article ${articleId}`;
      console.log(message);
      console.log(rooms);
      io.to(`article-${articleId}`).emit('message', { articleId, message })
    });
  });

  socket.on('comment-typing', (articleId) => {
    console.log('comment-typing to article id', articleId);

    console.log(articleId)
    socket.join(`articleId-${articleId}`, () => {
      const rooms = Object.keys(socket.rooms);
      const message = `${userName} has joined to article ${articleId}`;
      console.log(message);
      console.log(rooms);
      io.to(`article-${articleId}`).emit('message', { articleId, message })
    });
  });

  socket.on('comment', (articleId) => {
    console.log('comment to article id', articleId);

    console.log(articleId)
    socket.join(`articleId-${articleId}`, () => {
      const rooms = Object.keys(socket.rooms);
      const message = `${userName} has joined to article ${articleId}`;
      console.log(message);
      console.log(rooms);
      io.to(`article-${articleId}`).emit('message', { articleId, message })
    });
  });

  socket.on('unwatch-comments', (articleId) => {
    console.log('Leaving article id', articleId);
    socket.leave(`article-${articleId}`, () => {
      const rooms = Object.keys(socket.rooms);
      const message = `${userName} has left article ${articleId}`;
      console.log(message);
      console.log(rooms);
      io.to(`article-${articleId}`).emit('message', { articleId, message })
    });
  });

});

sequelize
  .authenticate()
  .then(() => {
    infoLogger.info('Connection has been established successfully.');
    mongoose.connect(`${process.env.MONGO_DB}`,
      { useNewUrlParser: true, useUnifiedTopology: true }, (err) => {
        if (err) { return errorLogger.error(err, err.message) }
        server.listen(PORT, () => infoLogger.info(`Server started on port ${PORT}`));
      });
  })
  .catch(err => {
    errorLogger.error('Unable to connect to the database:', err);
  })
  .done();