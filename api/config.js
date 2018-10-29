// source: config.js
const packagejson = require('./package.json');

module.exports = {
  name: 'RESTIFY-API',
  version: packagejson.version,
  env: process.env.NODE_ENV || 'development',
  port: process.env.port || 3000,
  base_url: process.env.BASE_URL || 'http://localhost:3000',
  odoo: {
    url: 'http://web',
    port: '8069',
    db: 'sotral',
    username: 'mawababotossi@yahoo.fr',
    password: '7u7ud@sxX'
  }
};
