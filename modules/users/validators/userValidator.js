/**
 * Created by Rishikesh Arya on 16/11/19.
 */

const Joi = require("joi");

const apiReferenceModule      = "users"
const validator               = require("./../../../validators/validator");

exports.login               = login;
exports.register            = register;
exports.loginViaAccessToken = loginViaAccessToken;
exports.logOut              = logOut;
exports.editProfile         = editProfile;
exports.forgetPassword      = forgetPassword;
exports.verifyOtp           = verifyOtp;
exports.changePassword      = changePassword;

function login(req,res,next){
    req.apiReference = {
        module: apiReferenceModule,
        api   : "login"
    };
    
    let schema = Joi.object().keys({
      email       : Joi.string().required(),
      password    : Joi.string().required(),
      device_token: Joi.string().optional(),
      device_type : Joi.number().optional(),
      device_name : Joi.string().optional()
    });
    let validFields = validator.validateFields(req.apiReference, req.body, res, schema);
    if (validFields) {
        next();
    }
}

function register(req,res,next){
    req.apiReference = {
        module: apiReferenceModule,
        api   : "register"
    };
    
    let schema = Joi.object().keys({
      email        : Joi.string().required(),
      name         : Joi.string().required(),
      password     : Joi.string().required(),
      device_token : Joi.string().optional(),
      device_type  : Joi.number().optional(),
      device_name  : Joi.string().optional(),
      timezone     : Joi.number().optional(),
      timezone_info: Joi.string().optional()
    });
    let validFields = validator.validateFields(req.apiReference, req.body, res, schema);
    if (validFields) {
        next();
    }
}

function loginViaAccessToken(req,res,next){
    req.apiReference = {
        module: apiReferenceModule,
        api   : "loginViaAccessToken"
    };
    
    let schema = Joi.object().keys({
      access_token: Joi.string().required(),
      device_token: Joi.string().optional(),
      device_type : Joi.number().optional(),
      device_name : Joi.string().optional()
    });

    let validFields = validator.validateFields(req.apiReference, req.body, res, schema);
    if (validFields) {
        next();
    }
}

function logOut(req,res,next){
    req.apiReference = {
        module: apiReferenceModule,
        api   : "logOut"
    };
    
    let schema = Joi.object().keys({
      access_token: Joi.string().required(),
      device_token: Joi.string().optional(),
      device_type : Joi.number().optional(),
    });

    let validFields = validator.validateFields(req.apiReference, req.body, res, schema);
    if (validFields) {
        next();
    }
}

function editProfile(req,res,next){
    req.apiReference = {
        module: apiReferenceModule,
        api   : "editProfile"
    };

    let schema = Joi.object().keys({
      access_token        : Joi.string().required(),
      name                : Joi.string().optional(),
      email               : Joi.string().optional(),
      password            : Joi.string().optional(),
      notification_enabled: Joi.number().valid(0,1).optional(),
      timezone            : Joi.number().optional(),
      timezone_info       : Joi.string().optional()
    });

    let validFields = validator.validateFields(req.apiReference, req.body, res, schema);
    if (validFields) {
        next();
    }
}


function forgetPassword(req,res,next){
    req.apiReference = {
        module: apiReferenceModule,
        api   : "forgetPassword"
    };
    
    let schema = Joi.object().keys({
      email       : Joi.string().required()
    });

    let validFields = validator.validateFields(req.apiReference, req.body, res, schema);
    if (validFields) {
        next();
    }
}

function verifyOtp(req,res,next){
    req.apiReference = {
        module: apiReferenceModule,
        api   : "verifyOtp"
    };
    
    let schema = Joi.object().keys({
      email: Joi.string().required(),
      otp  : Joi.number().required()
    });

    let validFields = validator.validateFields(req.apiReference, req.body, res, schema);
    if (validFields) {
        next();
    }
}

function changePassword(req,res,next){
    req.apiReference = {
        module: apiReferenceModule,
        api   : "changePassword"
    };
    
    let schema = Joi.object().keys({
      access_token: Joi.string().required(),
      old_password: Joi.string().required(),
      new_password: Joi.string().required()
    });

    let validFields = validator.validateFields(req.apiReference, req.body, res, schema);
    if (validFields) {
        next();
    }
}