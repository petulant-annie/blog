const winston = require('winston');
const fs = require('fs');
require('winston-daily-rotate-file');
require('winston-mongodb');
require('dotenv').config();

const logDirectory = './logs'

if (!fs.existsSync(logDirectory)) {
  fs.mkdirSync(logDirectory);
}

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  verbose: 4,
  debug: 5,
  silly: 6
};

let options = {
  file: {
    filename: logDirectory + '/%DATE%-logsDemo.log',
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    timestamp: true,
    handleExceptions: true,
    humanReadableUnhandledException: true,
    prettyPrint: true,
    json: true,
    maxsize: 5242880, // 5MB
    colorize: true,
  },
  database: {
    db: `${process.env.MONGO_DB}`,
    levels: levels,
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  }
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
    new winston.transports.DailyRotateFile(options.file),
    new winston.transports.MongoDB(options.database)
  ],
  exceptionHandlers: [
    new winston.transports.DailyRotateFile(options.file),
    new winston.transports.MongoDB(options.database)
  ],
  exitOnError: false,
});