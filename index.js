const debug = require('debug')('token-server-nodejs:index');

// CommonJs
const server = require('fastify')({
  // disableRequestLogging: true,
  logger: false
});

server.register(require('fastify-multipart'), {
  attachFieldsToBody: true,
  sharedSchemaId: '#fileUploadSchema',
  throwFileSizeLimit: false,
  limits: { fileSize: 1000000 * 1 }
});

server.register(require('fastify-cors'), {
  origin: (origin, cb) => {
    // allow all
    cb(null, true);

    /* allow special host
    if (/localhost/.test(origin)) {
      //  Request from localhost will pass
      cb(null, true);
      return;
    }
    // Generate an error on other origins, disabling access
    cb(new Error("Not allowed"));
    */
  }
});

server.register(require('./routes/home'));
server.register(require('./routes/errors'));
server.register(require('./routes/token'), { prefix: '/token' });
server.register(require('./logger'));

// error handle
server.setErrorHandler(async (error, request, reply) => {
  debug('error', error);
  return server.exception(request, reply);
});
// error handle

// no need for `app.listen()` on Deta, we run the app automatically.
module.exports = server; // make sure to export your `app` instance.
