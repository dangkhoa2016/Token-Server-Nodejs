const accounts_helper = require('./accounts_helper');
const replit_database = require('./replit_database');
const debug = require('debug')('token-server-nodejs:lib->token_helper');
const KEY_PREFIX = 'nodejs::access_token';
const SCOPES = [
  "https://www.googleapis.com/auth/drive.file",
  "https://www.googleapis.com/auth/drive.metadata",
  "https://www.googleapis.com/auth/drive.metadata.readonly",
  "https://www.googleapis.com/auth/drive.readonly",
  "https://www.googleapis.com/auth/drive"
];
const { GoogleToken } = require('gtoken');
const moment = require('moment');

class TokenHelper {
  constructor() {
  }

  async get_account_token_info(account_name, scope = null) {
    const account_json = await accounts_helper.get_account(account_name);
    if (!account_json) {
      debug(`Can not get json for account: ${account_name}`);
      return;
    }

    return await this.service_account_authorization(account_json, scope);
  }

  async get_access_token(account_name, scope = null) {
    var token_info = await replit_database.get_as_json(`${KEY_PREFIX}_${account_name}`);
    if (token_info && token_info['expired_time']) {
      debug(`Get from Repl database for account: ${account_name}`);
      if (moment(token_info['expired_time']).subtract(50, 'seconds') > moment())
        return token_info['access_token'];
    }

    token_info = await this.get_account_token_info(account_name, scope);
    if (token_info) {
      var json = {
        access_token: token_info.access_token.replace(/[.]+$/, ''),
        expired_time: moment().utc().add(token_info.expires_in, 'seconds')
      }

      debug(`Save token for account: ${account_name}`);
      await replit_database.put(`${KEY_PREFIX}_${account_name}`, json);

      return json.access_token;
    }
  }

  async get_random_token(scope = null) {
    var account = await accounts_helper.get_random_account();
    return await this.get_access_token(account, scope);
  }

  async service_account_authorization(credentials_json, scope = null) {
    if (!scope || Array.isArray(scope) === false || scope.length === 0)
      scope = SCOPES;
    const gtoken = new GoogleToken({
      email: credentials_json['client_email'],
      scope,
      key: credentials_json['private_key'],
    });

    try {
      const token_info = await gtoken.getToken();
      return {
        ...token_info,
        scope, expiry: 60,
        expires_at: new Date(gtoken.expiresAt),
        access_type: 'offline',
        refresh_token: null,
        token_type: gtoken.tokenType,
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer'
      };
    } catch (ex) {
      debug('Error gtoken getToken', ex);
    }
  }
};

module.exports = new TokenHelper();
