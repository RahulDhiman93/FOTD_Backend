
process.env.NODE_CONFIG_DIR       = 'config/';
config                            = require('config');

global.app                        = require('express')();

require('./middlewares');
require('./modules');
require('./services/startupService').initializeServer();
