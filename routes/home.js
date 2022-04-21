// const debug = require('debug')('token-server-nodejs:routes->home');
const fs = require('fs');

async function routes(fastify, options) {

  fastify.get('/', async (request, reply) => {
    return { hello: 'world' }
  });

  fastify.get('/favicon.ico', async (request, reply) => {
    const buffer = fs.readFileSync('./imgs/favicon.ico');
    reply.type('image/x-icon').send(buffer);
  });

  fastify.get('/favicon.png', async (request, reply) => {
    const buffer = fs.readFileSync('./imgs/favicon.png');
    reply.type('image/png').send(buffer);
  });

  fastify.get('/file/upload.html', async (request, reply) => {
    const buffer = fs.readFileSync('./test/upload.html');
    reply.type('text/html').send(buffer);
  });

};

module.exports = routes;
