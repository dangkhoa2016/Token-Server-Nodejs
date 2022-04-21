const debug = require('debug')('token-server-nodejs:lib->replit_database');
const Gaxios = require('gaxios').Gaxios;
const { REPLIT_DB_URL } = process.env;
const client = new Gaxios({
  timeout: 10000,
  headers: {},
  responseType: 'text'
});

class ReplitDatabase {
  constructor() {
  }

  async put(key, value) {
    if (!key)
      return false;

    value = value ? value : '';
    value = typeof (value) === 'string' ? value : JSON.stringify(value);
    var data = `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
    try {
      const response = await client.request({
        url: REPLIT_DB_URL,
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        data, method: 'POST'
      });
      if (response.status === 200)
        return true;
      else
        debug(response.status, response.data);
    } catch (error) {
      if (error.response)
        debug('Error put', error.response);
      else
        debug('Error put', error);
    }

    return false;
  }

  async get(key) {
    if (!key)
      return;

    try {
      const { status, data } = await client.request({ url: `${REPLIT_DB_URL}/${encodeURIComponent(key)}`, responseType: 'text' });
      if (status === 200)
        return data;
      else
        debug(status, data);
    } catch (error) {
      if (error.response)
        debug('Error get', error.response);
      else
        debug('Error get', error);
    }
  }

  async get_body(key) {
    try {
      var data = (await this.get(key)) || {};
      return data ? decodeURIComponent(data) : '';
    } catch (error) {
      if (error.response)
        debug('Error get_body', error.response);
      else
        debug('Error get_body', error);
    }
  }

  async get_as_json(key) {
    try {
      const body = await this.get_body(key);
      debug('zzz', body)
      return body ? JSON.parse(body) : null;
    } catch (error) {
      if (error.response)
        debug('Error get_as_json', error.response);
      else
        debug('Error get_as_json', error);
    }
  }

  async delete(key) {
    if (!key)
      return false;

    try {
      const { status, data } = await client.request({ url: `${REPLIT_DB_URL}/${key}`, method: 'DELETE' });
      if (status === 200)
        return true;
      else
        debug(status, data);
    } catch (error) {
      if (error.response)
        debug('Error delete', error.response);
      else
        debug('Error delete', error);
    }

    return false;
  }

  async list(prefix = '') {
    try {
      const { status, data } = await client.request({ url: `${REPLIT_DB_URL}?prefix=${encodeURIComponent(prefix)}` });
      if (status === 200)
        return data.split(/\r?\n/).filter(element => element);
      else
        debug(status, data);
    } catch (error) {
      if (error.response)
        debug('Error list', error.response);
      else
        debug('Error list', error);
    }
  }
};

module.exports = new ReplitDatabase();
