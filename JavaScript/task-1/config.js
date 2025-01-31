'use strict';

module.exports = {
  api: {
    framework: 'native', // native | fastify
    port: 8001,
    protocol: 'ws', // http | ws
  },
  db: {
    host: '127.0.0.1',
    port: 5432,
    database: 'example',
    user: 'marcus',
    password: 'marcus',
  },
  loader: {
    timeout: 5000,
    displayErrors: false,
  },
  static: {
    port: 8000,
  },
};
