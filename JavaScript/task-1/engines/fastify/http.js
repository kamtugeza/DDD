'use strict';

const buildFastify = require('fastify');

const COMMON_HEADERS = {
  'X-XSS-Protection': '1; mode=block',
  'X-Content-Type-Options': 'nosniff',
  'Strict-Transport-Security': 'max-age=31536000; includeSubdomains; preload',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json; charset=UTF-8',
};

module.exports = (routing, { port }) => {
  const fastify = buildFastify();

  fastify.addHook('onRequest', (_, reply, done) => {
    reply.code(404).headers(COMMON_HEADERS);
    done();
  });

  fastify.post('/api/:name/:method', async (request, reply) => {
    const { name, method } = request.params;
    const handler = routing[name]?.[method];
    if (!handler) reply.send('Not Fount');
    const result = await handler(...request.body.args);
    console.log(`${request.socket.remoteAddress} ${method} ${request.url}`);
    reply.code(200).send(result.rows);
  });

  fastify.all('*', (_, reply) => reply.send('Not Found'));

  fastify.listen({ port: port }, (err) => {
    if (err) {
      fastify.log.error(err);
      process.exit(1);
    }
    console.log(`API is on ${port}`);
  });
};
