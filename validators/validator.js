/**
 * Created by Rishikesh Arya on 16/11/19.
 */

const Joi = require('joi');

const logging       = require('./../logging/logging');
const responses     = require('./../response/responses');
const constants     = require('./../properties/constants');
const envProperties = require('./../properties/envProperties');


exports.validateFields               = validateFields;
exports.sendParameterMissingResponse = sendParameterMissingResponse;
exports.validateObject               = validateObject;

function validateFields(apiReference, req, res, schema) {
  logging.log(apiReference, { REQUEST_BODY: req});
  let validation = Joi.validate(req, schema);
  if(validation.error) {
    let errorReason =
          validation.error.details !== undefined
            ? validation.error.details[0].message
            : 'Parameter missing or parameter type is wrong';

    logging.log(apiReference, validation.error.details);
    sendParameterMissingResponse(res, errorReason);
    return false;
  }
  return true;
}

// return true or false based on validation
function validateObject(obj,schema){
	let validation = Joi.validate(obj, schema);
	if (validation.error) {
		var errorReason = validation.error.details !== undefined ?
			validation.error.details[0].message : 'Parameter missing or parameter type is wrong';
		return { message: errorReason, success: false };
	} else {
		return {
			success : true,
		};
	}
}

function sendParameterMissingResponse(res, errorReason, url) {
  if(!envProperties.isEnvLive())
    responses.sendResponse(res, errorReason, constants.responseFlags.PARAMETER_MISSING);
  else
    responses.parameterMissingResponse(res);
}