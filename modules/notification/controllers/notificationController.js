/**
 * Created by Rishikesh Arya on 16/11/19.
 */
const responses           = require("./../../../response/responses");
const constants           = require("./../../../properties/constants");
const logging             = require("./../../../logging/logging");
const notificationService = require("./../service/notificationService");
const userService         = require("./../../users/services/userService");

exports.sendNotification      = sendNotification;
exports.sendEmailNotification = sendEmailNotification;
exports.sendNotificationForBulk = sendNotificationForBulk;
exports.sendNotificationToAll = sendNotificationToAll;

async function sendNotification(req, res){
    try{
        let user_id = req.body.user_id;
        let title   = req.body.title;
        let body    = req.body.body;

        notificationService.sendPushesToUser(req.apiReference, user_id, title, body);
        responses.sendResponse(res, constants.responseMessages.ACTION_COMPLETE, constants.responseFlags.ACTION_COMPLETE, {}, req.apiReference);
    }catch(error){
        logging.logError(req.apiReference, {EVENT : "sendNotification", ERROR : error});
        responses.sendResponse(res, error || constants.responseMessages.SHOW_ERROR_MESSAGE, constants.responseFlags.SHOW_ERROR_MESSAGE, {}, req.apiReference);
    }
}

async function sendNotificationForBulk(req, res){
    try{
        let user_ids = req.body.user_ids;
        let title   = req.body.title;
        let body    = req.body.body;

        notificationService.sendPushesToUserForBulk(req.apiReference, user_ids, title, body);
        responses.sendResponse(res, constants.responseMessages.ACTION_COMPLETE, constants.responseFlags.ACTION_COMPLETE, {}, req.apiReference);
    }catch(error){
        logging.logError(req.apiReference, {EVENT : "sendNotificationForBulk", ERROR : error});
        responses.sendResponse(res, error || constants.responseMessages.SHOW_ERROR_MESSAGE, constants.responseFlags.SHOW_ERROR_MESSAGE, {}, req.apiReference);
    }
}

async function sendNotificationToAll(req, res){
    try{
        let title   = req.body.title;
        let body    = req.body.body;

        notificationService.sendPushesToAllUsers(req.apiReference, title, body);
        responses.sendResponse(res, constants.responseMessages.ACTION_COMPLETE, constants.responseFlags.ACTION_COMPLETE, {}, req.apiReference);
    }catch(error){
        logging.logError(req.apiReference, {EVENT : "sendNotificationToAll", ERROR : error});
        responses.sendResponse(res, error || constants.responseMessages.SHOW_ERROR_MESSAGE, constants.responseFlags.SHOW_ERROR_MESSAGE, {}, req.apiReference);
    }
}

async function sendEmailNotification(req, res){
    try{
        let user_ids       = req.body.user_ids;
        let html           = req.body.html;
        let password       = req.body.password;
        let subject        = req.body.subject;
        let gmail_user     = req.body.gmail_user;
        let gmail_password = req.body.gmail_password;

        if(password != "djhjauwgevhdaioso2721"){
            throw("Go to hell buddy!!");
        }

        notificationService.sendEmailNotification(req.apiReference, user_ids, html, subject, gmail_user, gmail_password);
        responses.sendResponse(res, constants.responseMessages.ACTION_COMPLETE, constants.responseFlags.ACTION_COMPLETE, {}, req.apiReference);
    }catch(error){
        logging.logError(req.apiReference, {EVENT : "sendEmailNotification", ERROR : error});
        responses.sendResponse(res, error || constants.responseMessages.SHOW_ERROR_MESSAGE, constants.responseFlags.SHOW_ERROR_MESSAGE, {}, req.apiReference);
    }
}