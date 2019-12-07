/**
 * Created by Rishikesh Arya on 16/11/19.
 */
const _ = require("underscore");

const userService = require("./../modules/users/services/userService");
const responses   = require("./../response/responses");
const constants   = require("./../properties/constants");
const logging     = require("./../logging/logging");

exports.authenticateUser = authenticateUser;

async function authenticateUser(req, res, next) {
    try {
        let access_token = req.body.access_token || req.query.access_token;
        if(!access_token){
            throw (constants.responseMessages.INVALID_ACCESS_TOKEN); 
        }
        let userInfo     = await userService.getUser(req.apiReference, {access_token});
        if(_.isEmpty(userInfo)){
            throw (constants.responseMessages.INVALID_ACCESS_TOKEN);
        }
        req.body.user_id = userInfo[0].user_id;
        next();
    } catch (error) {
        logging.log(req.apiReference, {EVENT : "authenticateUser", ERROR : error});
        responses.sendResponse(res, constants.responseMessages.INVALID_ACCESS_TOKEN, constants.responseFlags.SHOW_ERROR_MESSAGE, {});
    }
}