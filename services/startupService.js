/**
 * Created by Rishikesh Arya on 16/11/19.
 */

const apiReferenceModule  = "startup";

const logging             = require('../logging/logging');
const envProperties       = require('../properties/envProperties');
const mysqlLib            = require('../database/mysqllib');
const httpLib             = require('./httpService');
const notificationService = require("./../modules/notification/service/notificationService");

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
      notificationService.scheduleNotification();
    } catch (error) {
      logging.logError(apiReference, {EVENT: "initializeServer", ERROR: error});
      throw new Error(error);
    }
}