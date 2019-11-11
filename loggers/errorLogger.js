const winston = require('winston');
require('winston-mongodb');

const levels = {
  error: 0,
};

let options = {
  db: `${process.env.MONGO_DB}`,
  levels: levels,
  options: {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
  collection: 'error_log',
};

module.exports.logger = new winston.createLogger({
  levels: levels,
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize({ all: true }),
        winston.format.timestamp(),
        winston.format.simple(),
        winston.format.align(),
        winston.format.printf((info) => {
          const { timestamp, level, message, ...args } = info;
          const ts = timestamp.slice(0, 19).replace('T', ' ');

          return `${ts} [${level}]: ${message} ${Object.keys(args).length ? JSON.stringify(args, null, 2) : ''}`;
        }),
      )
    }),
    new winston.transports.MongoDB(options)
  ],
  exceptionHandlers: [
    new winston.transports.MongoDB(options)
  ],
  exitOnError: false,
});