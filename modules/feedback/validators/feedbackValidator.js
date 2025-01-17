/**
 * Created by Rishikesh Arya on 16/11/19.
 */

const Joi = require("joi");

const apiReferenceModule      = "feedback"
const validator               = require("./../../../validators/validator");

exports.addFeedback               = addFeedback;

function addFeedback(req,res,next){
    req.apiReference = {
        module: apiReferenceModule,
        api   : "addFeedback"
    };
    
    let schema = Joi.object().keys({
      access_token: Joi.string().required(),
      device_type : Joi.number().required(),
      feedback    : Joi.string().max(500).optional().allow(""),
      comments    : Joi.string().optional().allow(""),
      rating      : Joi.number().optional()
    }).or("rating","comments","feedback");

    let validFields = validator.validateFields(req.apiReference, req.body, res, schema);
    if (validFields) {
        next();
    }
}