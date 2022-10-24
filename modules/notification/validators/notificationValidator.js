/**
 * Created by Rishikesh Arya on 16/11/19.
 */

const Joi = require("joi");

const apiReferenceModule      = "notification"
const validator               = require("./../../../validators/validator");

exports.sendNotification      = sendNotification;
exports.sendEmailNotification = sendEmailNotification;

function sendNotification(req,res,next){
    req.apiReference = {
        module: apiReferenceModule,
        api   : "sendNotification"
    };
    
    let schema = Joi.object().keys({
      user_id: Joi.number().optional(),
      title  : Joi.string().required(),
      body   : Joi.string().required()
    });
    let validFields = validator.validateFields(req.apiReference, req.body, res, schema);
    if (validFields) {
        next();
    }
}

function sendNotificationForBulk(req,res,next){
    req.apiReference = {
        module: apiReferenceModule,
        api   : "sendNotification"
    };
    
    let schema = Joi.object().keys({
      user_ids : Joi.array().items(Joi.number()).optional(),
      title    : Joi.string().required(),
      body     : Joi.string().required()
    });
    let validFields = validator.validateFields(req.apiReference, req.body, res, schema);
    if (validFields) {
        next();
    }
}

function sendEmailNotification(req,res,next){
    req.apiReference = {
        module: apiReferenceModule,
        api   : "sendEmailNotification"
    };
    
    let schema = Joi.object().keys({
      user_ids      : Joi.array().items(Joi.number().optional()).required(),
      html          : Joi.string().required(),
      password      : Joi.string().required(),
      subject       : Joi.string().required(),
      gmail_user    : Joi.string().required(),
      gmail_password: Joi.string().required()
    });
    let validFields = validator.validateFields(req.apiReference, req.body, res, schema);
    if (validFields) {
        next();
    }
}