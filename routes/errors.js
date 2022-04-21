// const debug = require('debug')('token-server-nodejs:routes->errors');

async function routes(fastify, options) {

  fastify.decorate('notFound', (request, reply) => {
    reply.code(404).send({ "error": "404 Route not found.", msg: 'Please go home' });
  });

  fastify.get('/404', async (request, reply) => {
    return fastify.notFound(request, reply);
  });

  fastify.get('/500', async (request, reply) => {
    return fastify.exception(request, reply);
  });

  /* not work
  fastify.setErrorHandler(async (error, request, reply) => {
    debug('error', error);
    return fastify.exception(request, reply);
  });
  */

  fastify.setNotFoundHandler(fastify.notFound);

};

module.exports = routes;
