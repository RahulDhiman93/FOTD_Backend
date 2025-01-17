/**
 * Created by Rishikesh Arya on 16/11/19.
 */
const _                  = require("underscore");

const feedbackService = require("./../services/feedbackService");
const responses       = require("./../../../response/responses");
const constants       = require("./../../../properties/constants");
const logging         = require("./../../../logging/logging");

exports.addFeedback     = addFeedback;
exports.getAllFeedbacks = getAllFeedbacks;

async function addFeedback(req, res){
    try{
        let user_id     = req.body.user_id;
        let device_type = req.body.device_type;
        let feedback    = req.body.feedback;
        let comments    = req.body.comments;
        let rating      = req.body.rating;

        await feedbackService.addFeedback(req.apiReference, {user_id, device_type, feedback, comments, rating}, {user_id});
        responses.sendResponse(res, constants.responseMessages.ACTION_COMPLETE, constants.responseFlags.ACTION_COMPLETE, {}, req.apiReference);
    }catch(error){
        logging.logError(req.apiReference, {EVENT : "addFeedback", ERROR : error});
        responses.sendResponse(res, error || constants.responseMessages.SHOW_ERROR_MESSAGE, constants.responseFlags.SHOW_ERROR_MESSAGE, {}, req.apiReference);
    }
}

async function getAllFeedbacks(req, res){
    try{
        req.apiReference = {
            module: "Feedbacks",
            api   : "getAllFeedbacks"
        };

        let limitParam = req.query.limit;
        let offsetParam = req.query.offset;

        let limit = limitParam == null ? 50 : limitParam;
        let offset = offsetParam == null ? 0 : offsetParam;

        let response = await feedbackService.getAllFeedbacks(req.apiReference, limit, offset);
        responses.sendResponse(res, constants.responseMessages.ACTION_COMPLETE, constants.responseFlags.ACTION_COMPLETE, response, req.apiReference);
    }catch(error){
        logging.logError(req.apiReference, {EVENT : "getAllFeedbacks", ERROR : error});
        responses.sendResponse(res, error || constants.responseMessages.SHOW_ERROR_MESSAGE, constants.responseFlags.SHOW_ERROR_MESSAGE, {}, req.apiReference);
    }
}

