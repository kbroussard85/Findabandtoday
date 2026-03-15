import pino from 'pino';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: process.env.NODE_ENV === 'development' 
    ? { target: 'pino-pretty' } 
    : undefined,
  redact: {
    paths: [
      'req.headers.authorization', 
      'req.body.password', 
      'req.body.token',
      'user.email',
      'user.auth0Id',
      'user.stripeCustomerId',
      'user.stripeAccountId'
    ],
    remove: true,
  },
  base: {
    env: process.env.NODE_ENV,
  },
});
