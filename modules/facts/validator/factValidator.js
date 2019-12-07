/**
 * Created by Rishikesh Arya on 16/11/19.
 */

const Joi = require("joi");

const apiReferenceModule      = "fact"
const validator               = require("./../../../validators/validator");

exports.checkAppVersion  = checkAppVersion;
exports.getTodaysFact    = getTodaysFact;
exports.likeFact         = likeFact;
exports.addFavourite     = addFavourite;
exports.getFacts         = getFacts;
exports.addFact          = addFact;
exports.getFavoriteFacts = getFavoriteFacts;
exports.getFactDetails   = getFactDetails;
exports.getFeaturedFact  = getFeaturedFact;
exports.getUserAddedfact = getUserAddedfact;

function checkAppVersion(req,res,next){
    req.apiReference = {
        module: apiReferenceModule,
        api   : "checkAppVersion"
    };
    
    let schema = Joi.object().keys({
      device_type : Joi.number().valid(1,2).required(),
      app_version : Joi.number().required()
    });
    let validFields = validator.validateFields(req.apiReference, req.query, res, schema);
    if (validFields) {
        next();
    }
}

function getTodaysFact(req,res,next){
    req.apiReference = {
        module: apiReferenceModule,
        api   : "getTodaysFact"
    };
    
    let schema = Joi.object().keys({
      access_token: Joi.string().required()
    });
    let validFields = validator.validateFields(req.apiReference, req.query, res, schema);
    if (validFields) {
        next();
    }
}

function likeFact(req,res,next){
    req.apiReference = {
        module: apiReferenceModule,
        api   : "likeFact"
    };
    
    let schema = Joi.object().keys({
      access_token: Joi.string().required(),
      fact_id     : Joi.number().required(),
      status      : Joi.number().valid(0,1,2).required()
    });
    let validFields = validator.validateFields(req.apiReference, req.body, res, schema);
    if (validFields) {
        next();
    }
}

function addFavourite(req, res, next){
    req.apiReference = {
        module: apiReferenceModule,
        api   : "addFavourite"
    };
    
    let schema = Joi.object().keys({
      access_token: Joi.string().required(),
      fact_id     : Joi.number().required(),
      status      : Joi.number().valid(0,1).required()
    });
    let validFields = validator.validateFields(req.apiReference, req.body, res, schema);
    if (validFields) {
        next();
    }
}

function getFacts(req, res, next){
    req.apiReference = {
        module: apiReferenceModule,
        api   : "getFacts"
    };
    
    let schema = Joi.object().keys({
      access_token         : Joi.string().required(),
      fact_type            : Joi.number().valid(1,2,3).required(),
      limit                : Joi.number().required(),
      skip                 : Joi.number().required(),
      search_string        : Joi.string().optional()
    });

    let validFields = validator.validateFields(req.apiReference, req.query, res, schema);
    if (validFields) {
        next();
    }
}

function addFact(req, res, next){
    req.apiReference = {
        module: apiReferenceModule,
        api   : "addFact"
    };
    
    let schema = Joi.object().keys({
      access_token: Joi.string().required(),
      fact        : Joi.string().optional()
    });

    let validFields = validator.validateFields(req.apiReference, req.body, res, schema);
    if (validFields) {
        next();
    }
}

function getFavoriteFacts(req, res, next){
    req.apiReference = {
        module: apiReferenceModule,
        api   : "getFavoriteFacts"
    };
    
    let schema = Joi.object().keys({
      access_token : Joi.string().required(),
      limit        : Joi.number().required(),
      skip         : Joi.number().required()
    });

    let validFields = validator.validateFields(req.apiReference, req.query, res, schema);
    if (validFields) {
        next();
    }
}

function getFactDetails(req, res, next){
    req.apiReference = {
        module: apiReferenceModule,
        api   : "getFactDetails"
    };
    
    let schema = Joi.object().keys({
      access_token: Joi.string().required(),
      fact_id     : Joi.number().required()
    });

    let validFields = validator.validateFields(req.apiReference, req.query, res, schema);
    if (validFields) {
        next();
    }
}

function getFeaturedFact(req, res, next){
    req.apiReference = {
        module: apiReferenceModule,
        api   : "getFeaturedFact"
    };
    
    let schema = Joi.object().keys({
      access_token: Joi.string().required()
    });

    let validFields = validator.validateFields(req.apiReference, req.query, res, schema);
    if (validFields) {
        next();
    }
}

function getUserAddedfact(req, res, next){
    req.apiReference = {
        module: apiReferenceModule,
        api   : "getUserAddedfact"
    };
    
    let schema = Joi.object().keys({
      access_token: Joi.string().required(),
      fact_status : Joi.number().valid(0,1,2).required(),
      limit       : Joi.number().required(),
      skip        : Joi.number().required(),
    });

    let validFields = validator.validateFields(req.apiReference, req.query, res, schema);
    if (validFields) {
        next();
    }
}