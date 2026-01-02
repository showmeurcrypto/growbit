const winston = require("winston");
require("winston-daily-rotate-file");

const transport = new winston.transports.DailyRotateFile({
  filename: "logs/application-%DATE%.log",
  datePattern: "YYYY-MM-DD",
  zippedArchive: false,
  maxSize: "20m",
  maxFiles: "14d",
});

transport.on("error", (error) => {
  // log or handle errors here
});

transport.on("rotate", function (oldFilename, newFilename) {
  // do something fun
});

const logger = winston.createLogger({
  level: "info", //default level
  format: winston.format.combine(
    winston.format.errors({ stack: true }),
    winston.format.timestamp(),
    winston.format.json(),
  ),
  transports: [transport],
});

const originalInfoFunction = logger.info;

logger.info = (...args) => {
  const data = args
    .map((item) =>
      typeof item === "object" ? JSON.stringify(item, null, 2) : item,
    )
    .reduce((acc, item) => acc + item + " ");
  originalInfoFunction(data);
};

module.exports = {
  logger,
};
