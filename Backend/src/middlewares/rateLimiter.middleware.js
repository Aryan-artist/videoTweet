import rateLimit from 'express-rate-limit';
import {RedisStore} from 'rate-limit-redis';
import Redis from 'ioredis';

const redis = new Redis(`${process.env.REDIS_URL}`,{
    maxRetriesPerRequest: 1,
    enableReadyCheck: true,
});

redis.on('error', (err) => {
    console.error('Redis error:', err);
})

export const limiter = rateLimit({
    windowMs: 60 * 1000, 
    max: 100,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    passOnStoreError: true,
    store: new RedisStore({
        sendCommand: (...args) => redis.call(...args),
        prefix: "rl:normal:"
    }),
    message: "Too many requests from this IP, please try again after a minute"
});

export const strictlimiter = rateLimit({
    windowMs: 60 * 1000, 
    max: 30,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    passOnStoreError: true,
    store: new RedisStore({
        sendCommand: (...args) => redis.call(...args),
        prefix: "rl:strict:"
    }),
    message: "Too many requests from this IP, please try again after a minute"
});

export const reqlimiter = rateLimit({
    windowMs: 60 * 1000, 
    max: 5,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    passOnStoreError: true,
    store: new RedisStore({
        sendCommand: (...args) => redis.call(...args),
        prefix: "rl:req:"
    }),
    message: "Too many requests from this IP, please try again after a minute"
});