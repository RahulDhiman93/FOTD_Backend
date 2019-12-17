/**
 * Created by RISHIKESH ARYA
 */

const md5                              = require('md5');
const _                                = require('underscore');

const jadeDao                          = require('./../dao/jadeDao');
const logging                          = require('./../../../logging/logging');

exports.jadeAuthentication             = jadeAuthentication;

function validateJadeFile(apiReference, opts) {
  let response = {valid : false};
  if (jadeViews.indexOf(opts.template + '.jade') >= 0) {
    response.valid = true;
  }
  return response;
}

async function jadeAuthentication(apiReference, opts) {
  logging.log(apiReference, {EVENT : "jadeAuthentication", opts : opts});
  let response  = {valid : false};
  try{
    let validJade = validateJadeFile(apiReference, opts);
    if(!validJade.valid){
      response.message = "not a valid jade file request";
      return response;
    }
    let jadeInfo = await jadeDao.getJadeInfo(apiReference, opts);
    if(_.isEmpty(jadeInfo)){
      response.message = "jade file is disabled";
      return response;
    }

    jadeInfo = jadeInfo[0];
    if(jadeInfo.password != md5(opts.password)){
      response.message = "password didn't match";
      return response;
    }

    response.valid = true;
  } catch(e){
    logging.logError(apiReference, {EVENT : "jadeAuthentication", error : e});
  }
  return response;
}