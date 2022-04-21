const debug = require('debug')('token-server-nodejs:routes->token');
const accounts_helper = require('../lib/accounts_helper');
const token_helper = require('../lib/token_helper');

const querySchema = {
  type: 'object',
  properties: {
    type: { type: 'string' },
    scope: { type: 'string' },
  },
}

async function routes(fastify, options) {
  fastify.get('/random', { schema: { querystring: querySchema } }, async (request, reply) => {
    const { scope } = request.query;
    if (scope)
      scope = scope.split(',').filter(ss => ss);
    try {
      return await token_helper.get_random_token(scope);
    } catch (ex) {
      debug(ex);
      reply.status(500).send({ error: ex.message });
    };
  });

  fastify.get('/*', { schema: { querystring: querySchema } }, async (request, reply) => {
    const { '*': account } = request.params;
    if (!account) {
      debug('No file path.');
      return;
    }

    const { type = 'access_token', scope } = request.query;
    if (scope)
      scope = scope.split(',').filter(ss => ss);
    debug(account, scope);

    try {
      if (type === 'account_json') {
        var account_json = await accounts_helper.get_account(account);
        if (account_json)
          return account_json;
      } else if (type === 'token_info') {
        var token_info = await token_helper.get_account_token_info(account, scope);
        if (token_info)
          return {
            expires_at: token_info.expires_at,
            issued_at: token_info.issued_at,
            access_type: token_info.access_type,
            expiry: token_info.expiry,
            access_token: token_info.access_token.replace(/[.]+$/g, ''),
            refresh_token: token_info.refresh_token,
            grant_type: token_info.grant_type,
            scope: token_info.scope
          };
      } else {
        var token = await token_helper.get_access_token(account, scope);
        if (token)
          return token;
      }

      return { error: `Account: ${account} does not exists.` };
    } catch (ex) {
      debug(ex);
      reply.status(500).send({ error: ex.message });
    }
  });
};

module.exports = routes;
