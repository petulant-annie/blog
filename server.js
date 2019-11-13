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
const { limiter } = require('./limiter');

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
// passport.serializeUser((currentId, done) => { done(null, currentId); });
// passport.deserializeUser((currentId, done) => { done(null, currentId); });

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
  fail: (data, message, error, accept) => {
    accept();
  },
}));


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