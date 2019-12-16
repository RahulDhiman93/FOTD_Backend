
process.env.NODE_CONFIG_DIR       = 'config/';
config                            = require('config');

global.app                        = require('express')();

require('./services/startupService').initializeServer();
require('./middlewares');
require('./modules');
