/**
 * Created by Rishikesh Arya on 16/11/19.
 */

const Joi = require("joi");

const apiReferenceModule      = "notification"
const validator               = require("./../../../validators/validator");

exports.sendNotification = sendNotification;

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