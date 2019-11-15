const redis = require('redis');
const RateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const { RateLimiterRedis } = require('rate-limiter-flexible');

const redisClient = redis.createClient({
  url: process.env.REDIS_URL
});

const limiter = new RateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'anna:rl:',
  }),
  max: 200,
  delayMs: 0,
});

const loginLimiter = new RateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'anna:login:rl:',
  }),
  windowMs: 600000,
  max: 20,
  delayMs: 0,
});

const rateLimiter = new RateLimiterRedis({
  redis: redisClient,
  keyPrefix: 'anna:socket:rl:',
  points: 6,
  duration: 1,
});

module.exports = { limiter, loginLimiter, rateLimiter };