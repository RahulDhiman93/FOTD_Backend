/**
 * Created by Rishikesh Arya on 16/11/19.
 */
const responses           = require("./../../../response/responses");
const constants           = require("./../../../properties/constants");
const logging             = require("./../../../logging/logging");
const notificationService = require("./../service/notificationService");
const userService         = require("./../../users/services/userService");

exports.sendNotification               = sendNotification;

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