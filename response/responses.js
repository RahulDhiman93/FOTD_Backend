const zlib                                  = require('zlib');
const logging                               = require('./../logging/logging');
const constants                             = require('./../properties/constants');

exports.sendCustomResponse                  = sendCustomResponse;
exports.sendResponse                        = sendResponse;
exports.sendGzippedResponse                 = sendGzippedResponse;
exports.unzipResponse                       = unzipResponse;
exports.parameterMissingResponse            = parameterMissingResponse;


function sendGzippedResponse(response, res) {
  zlib.gzip(JSON.stringify(response), function (err, zippedData) {
    if (err) {
      return res.send(response);
    }
    res.set({'Content-Encoding': 'gzip'});
    return res.send(zippedData);
  });
}

function parameterMissingResponse(res, err, data) {
  let response = {
    message: err || constants.responseMessages.PARAMETER_MISSING,
    status : constants.responseFlags.PARAMETER_MISSING,
    data   : data || {}
  };
  res.send(JSON.stringify(response));
}

function sendResponse(res, msg, status, data, apiReference) {
  let response = {
    message: msg,
    status : status,
    data   : data || {}
  };
  logging.log(apiReference, {EVENT: "FINAL RESPONSE", RESPONSE: response});
  res.send(JSON.stringify(response));
}

function sendCustomResponse(res, message, code, data, apiReference, metaInfo = null) {
  let response = {
    message: message,
    status : code,
    data   : data || {},
  };
  if (metaInfo)
    response.metaInfo = metaInfo;

  if (apiReference) {
    logging.log(apiReference, {EVENT: "FINAL RESPONSE", RESPONSE: response});
  }
  res.send(JSON.stringify(response));
}


async function unzipResponse(apiReference, body) {
  return new Promise((resolve, reject) => {
    zlib.gunzip(body, function (err, dezipped) {
      if (err) {
        logging.logError(apiReference, {EVENT : "unzipResponse", ERROR : err, RESPONSE : dezipped });
        return reject(err);
      }
      return resolve(dezipped.toString());
    });
  });
}