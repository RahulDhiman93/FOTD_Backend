/**
 * Created by Rishikesh Arya on 16/11/19.
 */

const config              = require('config');

exports.isEnv             = isEnv;
exports.getEnv            = getEnv;
exports.isEnvLiveOrBeta   = isEnvLiveOrBeta;
exports.isEnvLive         = isEnvLive;
exports.isServer          = isServer;

exports.databaseSettings = {
  mysql: {
    master: {
      host    : config.get('databaseSettings.host'),
      user    : config.get('databaseSettings.user'),
      password: config.get('databaseSettings.password'),
      database: config.get('databaseSettings.database'),
      multipleStatements: true
    },
    slave : {
      host    : config.get('slaveDatabaseSettings.host'),
      user    : config.get('slaveDatabaseSettings.user'),
      password: config.get('slaveDatabaseSettings.password'),
      database: config.get('slaveDatabaseSettings.database'),
      multipleStatements: true
    }
  }
};

exports.port = config.get('PORT');

function isEnv(env) {
  return process.env.NODE_ENV == env;
}

function isEnvLiveOrBeta() {
  return isEnv('live') || isEnv('beta');
}

function isEnvLive() {
  return isEnv('live');
}

function getEnv() {
  return process.env.NODE_ENV;
}

function isServer(server) {
  return process.env.SERVER == server;
}