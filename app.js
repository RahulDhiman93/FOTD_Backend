
process.env.NODE_CONFIG_DIR       = 'config/';
config                            = require('config');

global.app                        = require('express')();
global.BASE_PATH                  = __dirname;

require('./services/startupService').initializeServer();
require('./middlewares');
require('./modules');
