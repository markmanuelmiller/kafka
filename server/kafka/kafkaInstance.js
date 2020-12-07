const { Kafka, logLevel } = require('kafkajs');
const winston = require('winston');

const createConsumer = require('./consumer');

const toWinstonLogLevel = (level) => {
  switch (level) {
    case logLevel.ERROR:
    case logLevel.NOTHING:
      return 'error';
    case logLevel.WARN:
      return 'warn';
    case logLevel.INFO:
      return 'info';
    case logLevel.DEBUG:
      return 'debug';
  }
};

const WinstonLogCreator = (logLevel) => {
  const logger = winston.createLogger({
    level: toWinstonLogLevel(logLevel),
    transports: [
      new winston.transports.Console(),
      new winston.transports.File({ filename: 'myapp.log' }),
    ],
  });

  return ({ namespace, level, label, log }) => {
    const { message, ...extra } = log;
    logger.log({
      level: toWinstonLogLevel(level),
      message,
      extra,
    });
  };
};

const kafka = new Kafka({
  clientId: 'my-app',
  brokers: ['localhost:9092', 'localhost:9093', 'localhost:9094'],
  logLevel: logLevel.INFO,
  logCreator: WinstonLogCreator,
});

const producer = kafka.producer();
producer.connect();

console.log(`-------------------------------`);
console.log(producer);
console.log(`-------------------------------`);

// function createConsumers() {
const userConsumer = createConsumer(kafka, 'user');
const listingConsumer = createConsumer(kafka, 'listing');
const reviewConsumer = createConsumer(kafka, 'review');
// }
//
// createConsumers();

module.exports = {
  kafka,
  producer,
};
