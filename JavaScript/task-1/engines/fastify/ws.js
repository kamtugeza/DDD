'use strict';

const Fastify = require('fastify');

module.exports = (routing, { port }) => {
  const fastify = Fastify({ logger: true });

  fastify.register(require('@fastify/websocket'));

  fastify.register(async (fastify) => {
    fastify.get('/', { websocket: true }, (connection, request) => {
      const ip = request.socket.remoteAddress;
      connection.socket.on('message', async (message) => {
        const obj = JSON.parse(message);
        const { name, method, args = [] } = obj;
        const handler = routing[name]?.[method];
        if (!handler) {
          connection.socket.send('Not found', { binary: false });
        }
        const json = JSON.stringify(args);
        const parameters = json.substring(1, json.length - 1);
        console.log(`${ip} ${name}.${method}(${parameters})`);
        try {
          const result = await handler(...args);
          connection.socket.send(JSON.stringify(result.rows), { binary: false });
        } catch (err) {
          console.error(err);
          connection.socket.send('"Server error"', { binary: false });
        }
      });
    });
  });

  fastify.listen({ port }, (err) => {
    if (err) {
      server.log.error(err);
      process.exit(1);
    }
    console.log(`API is on ${port}`);
  });
};
