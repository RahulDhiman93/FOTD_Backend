/**
 * Created by Rishikesh Arya on 16/11/19.
 */

const apiReferenceModule = "startup";
const path               = require('path');

const logging             = require('../logging/logging');
const envProperties       = require('../properties/envProperties');
const mysqlLib            = require('../database/mysqlLib');
const httpLib             = require('./httpService');
const notificationService = require("./../modules/notification/service/notificationService");
const fileUtility         = require("./../utilities/fileUtility");

exports.initializeServer  = initializeServer;

async function initializeServer() {
    let apiReference = {
      module: apiReferenceModule,
      api: "initialize"
    };
    try {
      connection = await mysqlLib.initializeConnectionPool(envProperties.databaseSettings.mysql.master);
      slaveConnection = await mysqlLib.initializeConnectionPool(envProperties.databaseSettings.mysql.slave);
      server = await httpLib.startHttpServer(envProperties.port);
      jadeViews = await fileUtility.readDir(apiReference, {dirNamePath: path.join(BASE_PATH, 'modules/jade/views')});
      if(envProperties.isEnvLive()){
        notificationService.scheduleNotification();
        notificationService.scheduleTodayFactInBlog();
      }
    } catch (error) {
      console.log(error)
      logging.logError(apiReference, {EVENT: "initializeServer", ERROR: error});
      throw new Error(error);
    }
}