const winston = require('winston');
const fs = require('fs');
require('winston-daily-rotate-file');
require('winston-mongodb');
require('dotenv').config();

let logDirectory = './logs'

if (!fs.existsSync(logDirectory)) {
  fs.mkdirSync(logDirectory);
}

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
    levels: winston.config.syslog.levels,
  }
};

module.exports.logger = new winston.createLogger({
  levels: winston.config.npm.levels,
  transports: [
    new winston.transports.DailyRotateFile(options.file),
    new winston.transports.MongoDB(options.database)
  ],
  exceptionHandlers: [
    new winston.transports.DailyRotateFile(options.file),
    new winston.transports.MongoDB(options.database)
  ],
  exitOnError: false,
});