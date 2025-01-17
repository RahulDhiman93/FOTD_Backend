/**
 * Created by Rishikesh Arya on 16/11/19.
 */

const mysql                         = require('mysql');
const moment                        = require('moment');

const logging                       = require('./../logging/logging');

exports.initializeConnectionPool    = initializeConnectionPool;
exports.executeSlaveQuery           = executeSlaveQuery;
exports.executeQuery                = executeQuery;


function initializeConnectionPool(dbConfig) {
  return new Promise((resolve, reject) => {
    console.log('CALLING INITIALIZE POOL');
    var numConnectionsInPool = 0;
    var connection           = mysql.createPool(dbConfig);
    connection.on('connection', function (connection) {
      numConnectionsInPool++;
      console.log('NUMBER OF CONNECTION IN POOL : ', numConnectionsInPool);
    });
    return resolve(connection);
  });
}

function logSqlError(apiReference, event, err, result, sql) {
  if (!sql) {
    sql = {};
  }
  var log = {EVENT: event, ERROR: err, RESULT: result, QUERY: sql};
  try {
    log = JSON.stringify(log);
  }
  catch (exception) {
  }
  console.error("--> Error in sql query " + moment(new Date()).format('YYYY-MM-DD hh:mm:ss.SSS') + " :----: " +
    apiReference.module + " :=: " + apiReference.api + " :=: " + log);

}

function executeQuery(apiReference, event, queryString, params, noErrorlog) {
  return new Promise((resolve, reject) => {
    if (!apiReference) {
      apiReference = {
        module: "mysqlLib",
        api   : "executeQuery"
      }
    }
    var query = connection.query(queryString, params, function (sqlError, sqlResult) {
      logging.log(apiReference, {
        EVENT     : "Executing query " + event, QUERY: query.sql, SQL_ERROR: sqlError,
        SQL_RESULT: sqlResult, SQL_RESULT_LENGTH: sqlResult && sqlResult.length
      });
      if (sqlError || !sqlResult) {
        if (sqlError) {
          if (!noErrorlog) {
            logSqlError(apiReference, event, sqlError, sqlResult, query.sql);
          }
          if (sqlError.code === 'ER_LOCK_DEADLOCK' || sqlError.code === 'ER_QUERY_INTERRUPTED') {
            setTimeout(executeQuery.bind(null, apiReference, event, queryString, params), 50);
          } else {
            return reject({ERROR: sqlError, QUERY: query.sql, EVENT: event});
          }
        }
      }
      return resolve(sqlResult);
    });
  });
}

function executeSlaveQuery(apiReference, event, queryString, params, noErrorlog) {
  return new Promise((resolve, reject) => {
    if (!apiReference) {
      apiReference = {
        module: "mysqlLib",
        api   : "executeSlaveQuery"
      }
    }
    var query = slaveConnection.query(queryString, params, function (sqlError, sqlResult) {
      logging.log(apiReference, {
        EVENT     : "Executing slave query " + event, QUERY: query.sql, SQL_ERROR: sqlError,
        SQL_RESULT: sqlResult, SQL_RESULT_LENGTH: sqlResult && sqlResult.length
      });
      if (sqlError || !sqlResult) {
        if (sqlError) {
          if (!noErrorlog) {
            logSqlError(apiReference, event, sqlError, sqlResult, query.sql);
          }
          if (sqlError.code === 'ER_LOCK_DEADLOCK' || sqlError.code === 'ER_QUERY_INTERRUPTED') {

            setTimeout(executeSlaveQuery.bind(null, apiReference, event, queryString, params), 50);
          } else {
            return reject({ERROR: sqlError, QUERY: query.sql, EVENT: event});
          }
        }
      }
      return resolve(sqlResult);
    });
  });
}



