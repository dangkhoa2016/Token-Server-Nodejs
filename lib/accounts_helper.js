const Gaxios = require('gaxios').Gaxios;
const { BASE_URL } = process.env;
const debug = require('debug')('token-server-nodejs:lib->accounts_helper');
const client = new Gaxios({
  baseURL: `${BASE_URL}/accounts`,
  timeout: 10000,
  headers: {}
});
const NodeCache = require("node-cache");
const cacheHelper = new NodeCache({ stdTTL: 1 * 24 * 60 * 60 }); // 1 day

class AccountsHelper {
  constructor() {
    this.cache_key = 'AccountsHelper-account_names';
  }

  async #get_accounts() {
    try {
      const { status, data } = await client.request({ url: '/list' });
      if (status === 200)
        return data;
      else
        debug(status, data);
    } catch (error) {
      if (error.response)
        debug('Error get_accounts', error.response);
      else
        debug('Error get_accounts', error);
    }
  }

  async get_account(account_name) {
    try {
      const { status, data } = await client.request({ url: `/${account_name}` });
      if (status === 200)
        return data;
      else
        debug(status, data);
    } catch (error) {
      if (error.response)
        debug('Error get_account', error.response);
      else
        debug('Error get_account', error);
    }
  }

  async account_names() {
    var value = cacheHelper.get(this.cache_key);
    if (!value || !Array.isArray(value) || value.length === 0) {
      debug('account_names key expires');
      value = await this.#get_accounts();
      cacheHelper.set(this.cache_key, value);
    }
    return value;
  }

  async get_random_account() {
    var accounts = await this.account_names();
    if (Array.isArray(accounts) && accounts.length > 0)
      return accounts[Math.floor(Math.random() * accounts.length)];
  }

  async get_random_json_account() {
    var account = await this.get_random_account();
    return await this.get_account(account);
  }
};

module.exports = new AccountsHelper();
