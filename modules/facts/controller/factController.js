/**
 * Created by Rishikesh Arya on 16/11/19.
 */

const _                   = require("underscore");
const moment              = require("moment");
const responses           = require("./../../../response/responses");
const constants           = require("./../../../properties/constants");
const logging             = require("./../../../logging/logging");
const factService         = require("./../service/factService");
const notificationService = require("../../notification/service/notificationService");
const userServices        = require("../../users/services/userService");

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
exports.getPendingFacts  = getPendingFacts;
exports.approveFact      = approveFact;
exports.getFactsV2       = getFactsV2;
exports.addBulkFacts     = addBulkFacts;
exports.getAllFacts      = getAllFacts;
exports.factComments     = factComments;
exports.addFactComment   = addFactComment;

async function checkAppVersion(req, res){
    try{
        let device_type    = req.query.device_type;
        let app_version    = req.query.app_version;
        let message        = constants.responseMessages.ACTION_COMPLETE;
        let response       = { 
            is_force_update : false,
            is_manual_update: false,
            app_link        : "",
            package_name    : "",
            hard_version    : 0,
            soft_version    : 0,
         };

        let appVersionData = await factService.getAppVersion(req.apiReference, {device_type});
        if(!_.isEmpty(appVersionData)){
            response.app_link        = appVersionData[0].app_link;
            response.package_name    = appVersionData[0].package_name;
            response.hard_version    = appVersionData[0].hard_version;
            response.soft_version    = appVersionData[0].soft_version;

            let hard_version = appVersionData[0].hard_version;
            let soft_version = appVersionData[0].soft_version;
            if(app_version < hard_version){
                response.is_force_update = true;
                message = constants.responseMessages.FORCE_UPDATE;
            }else if(app_version < soft_version){
                response.is_manual_update = true;
                message = constants.responseMessages.SOFT_UPDATE;
            }
        }
        let appConfig = await factService.getAppConfig(req.apiReference);
        if(appConfig.length){
            Object.assign(response, appConfig[0]);
        }
        responses.sendResponse(res, message, constants.responseFlags.ACTION_COMPLETE, response, req.apiReference);
    }catch(error){
        logging.logError(req.apiReference, {EVENT : "checkAppVersion", ERROR : error});
        responses.sendResponse(res, error || constants.responseMessages.SHOW_ERROR_MESSAGE, constants.responseFlags.SHOW_ERROR_MESSAGE, {}, req.apiReference);
    }
}

async function getTodaysFact(req, res){
    try{
        let user_id    = req.body.user_id;
        let response   = {fact : {}, like_count : 0, dislike_count : 0, user_like_status : constants.LIKE_STATUS.NONE};
        let today      = moment().format("YYYY-MM-DD");
        let todaysFact = await factService.getFacts(req.apiReference, {
            fact_stamp    : today,
            join_likes    : 1,
            user_id       : user_id,
            join_favourite: 1,
            columns       : " tbf.*, tfl.status, tuff.status as fav_status ",
            fact_type     : constants.FACT_TYPE.DAILY_FACT
        });

        if(!_.isEmpty(todaysFact)){
            response.fact             = todaysFact[0];
            let fact_id               = todaysFact[0].fact_id;
            let fact_like_count       = await factService.getFactLikeCount(req.apiReference, {fact_id});
            response.like_count       = fact_like_count[0].like_count + todaysFact[0].minimum_like_count || 0;
            response.dislike_count    = fact_like_count[0].dislike_count + todaysFact[0].minimum_dislike_count || 0;
            response.user_like_status = todaysFact[0].status == null ? constants.LIKE_STATUS.NONE : todaysFact[0].status;
            response.user_fav_status  = Number(todaysFact[0].fav_status);
            delete todaysFact[0].status;
            delete todaysFact[0].fav_status;
        }
        responses.sendResponse(res, constants.responseMessages.ACTION_COMPLETE, constants.responseFlags.ACTION_COMPLETE, response, req.apiReference);
    }catch(error){
        logging.logError(req.apiReference, {EVENT : "getTodaysFact", ERROR : error});
        responses.sendResponse(res, error || constants.responseMessages.SHOW_ERROR_MESSAGE, constants.responseFlags.SHOW_ERROR_MESSAGE, {}, req.apiReference);
    }
}

async function likeFact(req, res){
    try{
        let status   = req.body.status;
        let fact_id  = req.body.fact_id;
        let user_id  = req.body.user_id;
        let response = {like_count : 0, dislike_count : 0};
       await factService.addFactLike(req.apiReference, {status, fact_id, user_id});
       let factInfo = await factService.getFacts(req.apiReference, {fact_id, columns : " minimum_like_count, minimum_dislike_count "});
       if(!_.isEmpty(factInfo)){
            let minimum_like_count     = factInfo[0].minimum_like_count;
            let minimum_dislike_count  = factInfo[0].minimum_dislike_count;
            let fact_like_count        = await factService.getFactLikeCount(req.apiReference, {fact_id});
                response.like_count    = fact_like_count[0].like_count + minimum_like_count || 0;
                response.dislike_count = fact_like_count[0].dislike_count + minimum_dislike_count || 0;
       }
        responses.sendResponse(res, constants.responseMessages.ACTION_COMPLETE, constants.responseFlags.ACTION_COMPLETE, response, req.apiReference);
    }catch(error){
        logging.logError(req.apiReference, {EVENT : "likeFact", ERROR : error});
        responses.sendResponse(res, error || constants.responseMessages.SHOW_ERROR_MESSAGE, constants.responseFlags.SHOW_ERROR_MESSAGE, {}, req.apiReference);
    }
}

async function factComments(req, res){
    try{
        let fact_id  = req.query.fact_id;
        let response = [];

        response = await factService.getComments(req.apiReference, fact_id);
        responses.sendResponse(res, constants.responseMessages.ACTION_COMPLETE, constants.responseFlags.ACTION_COMPLETE, response, req.apiReference);
    }catch(error){
        logging.logError(req.apiReference, {EVENT : "factComments", ERROR : error});
        responses.sendResponse(res, error || constants.responseMessages.SHOW_ERROR_MESSAGE, constants.responseFlags.SHOW_ERROR_MESSAGE, {}, req.apiReference);
    }
}

async function addFactComment(req, res){
    try{
        let fact_id      = req.body.fact_id;
        let user_id      = req.body.user_id;
        let user_name    = req.body.user_name;
        let comment_text = req.body.comment_text;

        await factService.addComment(req.apiReference, fact_id, user_id, user_name, comment_text);
        responses.sendResponse(res, constants.responseMessages.ACTION_COMPLETE, constants.responseFlags.ACTION_COMPLETE, {}, req.apiReference);
    }catch(error){
        logging.logError(req.apiReference, {EVENT : "addComment", ERROR : error});
        responses.sendResponse(res, error || constants.responseMessages.SHOW_ERROR_MESSAGE, constants.responseFlags.SHOW_ERROR_MESSAGE, {}, req.apiReference);
    }
}

async function addFavourite(req, res){
    try{
        let status     = req.body.status;
        let fact_id    = req.body.fact_id;
        let user_id    = req.body.user_id;

       await factService.addFavourite(req.apiReference, {status, fact_id, user_id});
        responses.sendResponse(res, constants.responseMessages.ACTION_COMPLETE, constants.responseFlags.ACTION_COMPLETE, {}, req.apiReference);
    }catch(error){
        logging.logError(req.apiReference, {EVENT : "addFavourite", ERROR : error});
        responses.sendResponse(res, error || constants.responseMessages.SHOW_ERROR_MESSAGE, constants.responseFlags.SHOW_ERROR_MESSAGE, {}, req.apiReference);
    }
}

async function getFacts(req, res){
    try{
        let user_id               = req.body.user_id;
        let fact_type             = req.query.fact_type;
        let limit                 = req.query.limit || 5;
        let skip                  = req.query.skip || 0;
        let search_string         = req.query.search_string;

        let response = {facts : []};
        let opts = {
            user_id  : user_id,
            columns  : " tbf.*, IFNULL(tfl.status, 2) as like_status, IFNULL(tuff.status,0) as fav_status ",
            fact_type: fact_type,
            limit    : limit,
            skip     : skip,
            order_by : " ORDER BY tbf.fact_id DESC "
        }
        console.log("opts: ", opts);
        if(search_string){
            opts.search_string = search_string;
            response.facts = await factService.searchFacts(req.apiReference, opts);
            console.log("response.facts: ", response.facts);
        }else{
            opts.join_likes     = 1;
            opts.join_favourite = 1;
            response.facts      = await factService.getFacts(req.apiReference, opts);
        }
        responses.sendResponse(res, constants.responseMessages.ACTION_COMPLETE, constants.responseFlags.ACTION_COMPLETE, response, req.apiReference);
    }catch(error){
        logging.logError(req.apiReference, {EVENT : "getFacts", ERROR : error});
        responses.sendResponse(res, error || constants.responseMessages.SHOW_ERROR_MESSAGE, constants.responseFlags.SHOW_ERROR_MESSAGE, {}, req.apiReference);
    }
}

async function addFact(req, res){
    try{
        let user_id     = req.body.user_id;
        let fact_type   = constants.FACT_TYPE.USER_FACT;
        let fact        = req.body.fact;
        let fact_status = 0;

        await factService.addFact(req.apiReference, {user_id, fact_type, fact, fact_status});
        responses.sendResponse(res, constants.responseMessages.ACTION_COMPLETE, constants.responseFlags.ACTION_COMPLETE, {}, req.apiReference);
    }catch(error){
        logging.logError(req.apiReference, {EVENT : "addFact", ERROR : error});
        responses.sendResponse(res, error || constants.responseMessages.SHOW_ERROR_MESSAGE, constants.responseFlags.SHOW_ERROR_MESSAGE, {}, req.apiReference);
    }
}

async function getFavoriteFacts(req, res){
    try{
        let user_id       = req.body.user_id;
        let limit         = req.query.limit || 10;
        let skip          = req.query.skip || 0;

        let response = {facts : []};
        response.facts = await factService.getFacts(req.apiReference, {
            join_likes          : 1,
            user_id             : user_id,
            inner_join_favourite: 1,
            columns             : " tbf.*, IFNULL(tfl.status, 2) as like_status, IFNULL(tuff.status,0) as fav_status ",
            limit               : limit,
            skip                : skip
        });
        responses.sendResponse(res, constants.responseMessages.ACTION_COMPLETE, constants.responseFlags.ACTION_COMPLETE, response, req.apiReference);
    }catch(error){
        logging.logError(req.apiReference, {EVENT : "getFavoriteFacts", ERROR : error});
        responses.sendResponse(res, error || constants.responseMessages.SHOW_ERROR_MESSAGE, constants.responseFlags.SHOW_ERROR_MESSAGE, {}, req.apiReference);
    }
}

async function getFactDetails(req, res){
    try{
        let user_id = req.body.user_id;
        let fact_id = req.query.fact_id;

        let response = {};
        let fact = await factService.getFacts(req.apiReference, {
            join_likes    : 1,
            user_id       : user_id,
            join_favourite: 1,
            join_user     : 1,
            columns       : " tbf.*, IFNULL(tfl.status, 2) as user_like_status, IFNULL(tuff.status,0) as user_fav_status, IFNULL(tu.name,'') as added_by, IFNULL(tu.profile_image, '') AS user_image ",
            fact_id       : fact_id
        });

        if(_.isEmpty(fact)){
            throw(constants.responseMessages.INVALID_ACTION);
        }
        let fact_like_count       = await factService.getFactLikeCount(req.apiReference, {fact_id});
        response.like_count       = fact_like_count[0].like_count + fact[0].minimum_like_count || 0;
        response.dislike_count    = fact_like_count[0].dislike_count + fact[0].minimum_dislike_count || 0;
        if(fact[0].fact_type ==constants.FACT_TYPE.ADMIN_FACT || 
            fact[0].fact_type ==constants.FACT_TYPE.DAILY_FACT){
                response.added_by   = constants.FOTP_DISPLAY_NAME;
                response.user_image = constants.FOTP_DISPLAY_ICON;
        }else{
            response.added_by   = fact[0].added_by;
            response.user_image = fact[0].user_image || constants.DEFAULT_USER_IMAGE;
        }
        response.added_on         = fact[0].creation_datetime;
        response.user_like_status = fact[0].user_like_status;
        response.user_fav_status  = fact[0].user_fav_status;
        response.fact             = fact[0].fact;
        response.fact_id          = fact[0].fact_id;
        response.user_id          = fact[0].user_id;

        responses.sendResponse(res, constants.responseMessages.ACTION_COMPLETE, constants.responseFlags.ACTION_COMPLETE, response, req.apiReference);
    }catch(error){
        logging.logError(req.apiReference, {EVENT : "getFactDetails", ERROR : error});
        responses.sendResponse(res, error || constants.responseMessages.SHOW_ERROR_MESSAGE, constants.responseFlags.SHOW_ERROR_MESSAGE, {}, req.apiReference);
    }
}

async function getFeaturedFact(req, res){
    try{
        let user_id = req.body.user_id;
        let response = {
            featured: [],
            popular : []
        };
        let obj = {};

        let fact_status = 1;

        let featured = await factService.getFacts(req.apiReference, {
            join_user     : 1,
            columns       : ` tbf.*, tbf.creation_datetime AS added_on ,IFNULL(tu.name,'') as added_by, IFNULL(tu.profile_image, '${constants.DEFAULT_USER_IMAGE}') AS user_image, IFNULL(tfl.status, 2) as user_like_status, IFNULL(tuff.status,0) as user_fav_status `,
            fact_type     : constants.FACT_TYPE.USER_FACT,
            limit         : 10,
            skip          : 0,
            join_likes    : 1,
            join_favourite: 1,
            user_id       : user_id,
            order_by      : " ORDER BY tbf.update_datetime DESC ",
            fact_status
        });

        response.featured = featured;

        let popular = await factService.getFacts(req.apiReference, {
            columns       : ` tbf.*, tbf.creation_datetime AS added_on, "${constants.FOTP_DISPLAY_NAME}" as added_by, "${constants.FOTP_DISPLAY_ICON}" AS user_image, IFNULL(tfl.status, 2) as user_like_status, IFNULL(tuff.status,0) as user_fav_status `,
            fact_type     : constants.FACT_TYPE.ADMIN_FACT,
            limit         : 10,
            skip          : 0,
            join_likes    : 1,
            join_favourite: 1,
            user_id       : user_id,
            order_by      : " ORDER BY tbf.fact_id DESC "
        });
        response.popular = popular;

        let facts = [].concat(response.featured, response.popular);
        let fact_ids = [];

        for (let i = 0; i < facts.length; i++) {
            facts[i].added_on = facts[i].creation_datetime;
            facts[i].like_count = facts[i].minimum_like_count;
            facts[i].dislike_count = facts[i].minimum_dislike_count;
            if (facts[i].fact_type == constants.FACT_TYPE.ADMIN_FACT ||
                facts[i].fact_type == constants.FACT_TYPE.DAILY_FACT) {
                facts[i].added_by = constants.FOTP_DISPLAY_NAME;
                facts[i].user_image = constants.FOTP_DISPLAY_ICON;
            } else {
                facts[i].user_image = facts[i].user_image || constants.DEFAULT_USER_IMAGE;
            }
            obj[facts[i].fact_id] = facts[i];
            fact_ids.push(facts[i].fact_id);
        }

        if(fact_ids.length){
            let factLikes = await factService.getFactLikeCount(req.apiReference, {fact_id : fact_ids, group_by : " GROUP BY fact_id"});
            for (let i = 0; i < factLikes.length; i++) {
                let fact_id = factLikes[i].fact_id;
                if(!obj[fact_id]){
                    continue;
                }
                obj[fact_id].like_count    = factLikes[i].like_count + obj[fact_id].minimum_like_count || 0;
                obj[fact_id].dislike_count = factLikes[i].dislike_count + obj[fact_id].minimum_dislike_count || 0;
            }
        }
        responses.sendResponse(res, constants.responseMessages.ACTION_COMPLETE, constants.responseFlags.ACTION_COMPLETE, response, req.apiReference);
    }catch(error){
        logging.logError(req.apiReference, {EVENT : "getFeaturedFact", ERROR : error});
        responses.sendResponse(res, error || constants.responseMessages.SHOW_ERROR_MESSAGE, constants.responseFlags.SHOW_ERROR_MESSAGE, {}, req.apiReference);
    }
}

async function getUserAddedfact(req, res){
    try{
        let user_id     = req.body.user_id;
        let fact_status = req.query.fact_status;
        let limit       = req.query.limit || 10;
        let skip        = req.query.skip || 0;
        let response    = {
            facts: [],
        };

        response.facts = await factService.getFacts(req.apiReference, {
            need_user_added_facts: 1,
            fact_type            : constants.FACT_TYPE.USER_FACT,
            fact_status          : fact_status,
            user_id              : user_id,
            limit                : limit,
            skip                 : skip,
            order_by             : " ORDER BY tbf.fact_id DESC "
        });

        responses.sendResponse(res, constants.responseMessages.ACTION_COMPLETE, constants.responseFlags.ACTION_COMPLETE, response, req.apiReference);
    }catch(error){
        logging.logError(req.apiReference, {EVENT : "getUserAddedfact", ERROR : error});
        responses.sendResponse(res, error || constants.responseMessages.SHOW_ERROR_MESSAGE, constants.responseFlags.SHOW_ERROR_MESSAGE, {}, req.apiReference);
    }
}

async function getPendingFacts(req, res){
    try{
        let fact_status = constants.FACT_STATUS.PENDING;
        let limit       = req.body.limit || 10;
        let skip        = req.body.skip || 0;

        let facts = await factService.getFacts(req.apiReference, {
            fact_type            : constants.FACT_TYPE.USER_FACT,
            fact_status          : fact_status,
            limit                : limit,
            skip                 : skip,
            order_by             : " ORDER BY tbf.fact_id DESC ",
            join_user            : 1,
            columns              : " tbf.fact_id, tbf.fact, tu.name, tu.email "
        });

        return res.render('pendingFacts', {facts : facts});
    }catch(error){
        logging.logError(req.apiReference, {EVENT : "getPendingFacts", ERROR : error});
        responses.sendResponse(res, error || constants.responseMessages.SHOW_ERROR_MESSAGE, constants.responseFlags.SHOW_ERROR_MESSAGE, {}, req.apiReference);
    }
}

async function approveFact(req, res){
    try{
        let fact_status = req.body.status;
        let fact_id     = req.body.fact_id;

        let factDetail = await factService.getFacts(req.apiReference, { fact_id });
        if(!_.isEmpty(factDetail)){
            let user_id = factDetail[0].user_id;
            await factService.updateFact(req.apiReference, {fact_status}, {fact_id});
            let userDetails = await userServices.getUser(req.apiReference, { user_id });
            let points;
            if (factDetail[0].fact_status == constants.FACT_STATUS.PENDING && fact_status == constants.FACT_STATUS.APPROVED) {
                points = constants.REWARD_POINT.FACT_APPROVED;
            }else if (factDetail[0].fact_status == constants.FACT_STATUS.APPROVED && fact_status == constants.FACT_STATUS.REJECTED) {
                points = constants.REWARD_POINT.FACT_REJECTED;
            }else {
                points = 0;
            }
            await userServices.updateUser(req.apiReference, {
                reward_points: parseInt(userDetails[0].reward_points) + points
            }, {
                user_id: user_id
            });
            if(user_id && fact_status == constants.FACT_STATUS.APPROVED){
                notificationService.sendPushesToUser(req.apiReference, user_id, "Fact Approved!!", "Hey!! Your fact just got approved");
            }
        }
        responses.sendResponse(res, constants.responseMessages.ACTION_COMPLETE, constants.responseFlags.ACTION_COMPLETE, {}, req.apiReference);
    }catch(error){
        logging.logError(req.apiReference, {EVENT : "approveFact", ERROR : error});
        responses.sendResponse(res, error || constants.responseMessages.SHOW_ERROR_MESSAGE, constants.responseFlags.SHOW_ERROR_MESSAGE, {}, req.apiReference);
    }
}

async function getFactsV2(req, res){
    try{
        let user_id               = req.body.user_id;
        let fact_type             = parseInt(req.query.fact_type);
        let limit                 = req.query.limit || 5;
        let skip                  = req.query.skip || 0;
        let search_string         = req.query.search_string;
        let need_user_fav_facts   = req.query.need_user_fav_facts || 0;

        if(need_user_fav_facts){
            search_string = 0;
        }

        let response = {facts : []};
        let obj      = {};
        let facts    = [];
        let fact_ids = [];

        let opts     = {
            user_id  : user_id,
            columns  : " tbf.*, IFNULL(tfl.status, 2) as user_like_status, IFNULL(tuff.status,0) as user_fav_status, IFNULL(tu.name,'') as added_by, IFNULL(tu.profile_image, '') AS user_image ",
            fact_type: fact_type,
            limit    : limit,
            skip     : skip,
            join_user: 1,
            order_by : " ORDER BY tbf.fact_id DESC ",
            fact_status: 1
        }
        if(search_string){
            opts.search_string = search_string;
            facts = await factService.searchFacts(req.apiReference, opts);
        }else if(need_user_fav_facts){
            opts.join_likes           = 1;
            opts.inner_join_favourite = 1;
            delete opts.fact_type;
            facts = await factService.getFacts(req.apiReference, opts);
        }else{
            opts.join_likes     = 1;
            opts.join_favourite = 1;
            facts = await factService.getFacts(req.apiReference, opts);
        }

        for (let i = 0; i < facts.length; i++) {
            facts[i].added_on = facts[i].creation_datetime;
            facts[i].like_count = facts[i].minimum_like_count;
            facts[i].dislike_count = facts[i].minimum_dislike_count;
            if (facts[i].fact_type == constants.FACT_TYPE.ADMIN_FACT ||
                facts[i].fact_type == constants.FACT_TYPE.DAILY_FACT) {
                facts[i].added_by = constants.FOTP_DISPLAY_NAME;
                facts[i].user_image = constants.FOTP_DISPLAY_ICON;
            } else {
                facts[i].user_image = facts[i].user_image || constants.DEFAULT_USER_IMAGE;
            }
            obj[facts[i].fact_id] = facts[i];
            fact_ids.push(facts[i].fact_id);
        }

        if(fact_ids.length){
            let factLikes = await factService.getFactLikeCount(req.apiReference, {fact_id : fact_ids, group_by : " GROUP BY fact_id"});
            for (let i = 0; i < factLikes.length; i++) {
                let fact_id = factLikes[i].fact_id;
                if(!obj[fact_id]){
                    continue;
                }
                obj[fact_id].like_count    = factLikes[i].like_count + obj[fact_id].minimum_like_count || 0;
                obj[fact_id].dislike_count = factLikes[i].dislike_count + obj[fact_id].minimum_dislike_count || 0;
            }
        }
        response.facts = facts;
        responses.sendResponse(res, constants.responseMessages.ACTION_COMPLETE, constants.responseFlags.ACTION_COMPLETE, response, req.apiReference);
    }catch(error){
        logging.logError(req.apiReference, {EVENT : "getFactsV2", ERROR : error});
        responses.sendResponse(res, error || constants.responseMessages.SHOW_ERROR_MESSAGE, constants.responseFlags.SHOW_ERROR_MESSAGE, {}, req.apiReference);
    }
}

async function addBulkFacts(req, res) {
    try {
        let apiReference = req.apiReference;
        let facts = req.body.facts;
        let startDate = req.body.date;
        let formattedDate = moment(startDate);
        let last_fact_date = await factService.getFactsForBulk(apiReference);
        let response = {};

        if(!_.isEmpty(last_fact_date) && last_fact_date[0].fact_stamp >= moment(formattedDate)) {
            response.lastFactDate = moment(last_fact_date[0].fact_stamp).format("YYYY-MM-DD");
            return responses.sendResponse(res, constants.responseMessages.ACTION_COMPLETE, constants.responseFlags.ACTION_COMPLETE, response, req.apiReference);
        }

        let lastFactResult = await factService.getFacts(apiReference, {
            order_by : " ORDER BY fact_id DESC",
            skip     : 0,
            limit    : 1,
            fact_status: constants.FACT_STATUS.APPROVED,
            fact_type: constants.FACT_TYPE.DAILY_FACT
        });

        let like_count = lastFactResult[0].minimum_like_count;
        let dislike_count = lastFactResult[0].minimum_dislike_count;        
        
        await factService.addBulkFacts(apiReference, { facts, startDate: moment(startDate), like_count, dislike_count });
        responses.sendResponse(res, constants.responseMessages.ACTION_COMPLETE, constants.responseFlags.ACTION_COMPLETE, response, req.apiReference);
    }catch(error) {
        logging.logError(req.apiReference, {EVENT : "addBulkFacts", ERROR : error});
        responses.sendResponse(res, error || constants.responseMessages.SHOW_ERROR_MESSAGE, constants.responseFlags.SHOW_ERROR_MESSAGE, {}, req.apiReference);
    }
}

async function getAllFacts(req, res){
    try{
        req.apiReference = {
            module: "Facts",
            api   : "getAllFacts"
        };

        let limitParam = req.query.limit;
        let offsetParam = req.query.offset;

        let limit = limitParam == null ? 50 : limitParam;
        let offset = offsetParam == null ? 0 : offsetParam;

        let response = await factService.getAllFacts(req.apiReference, limit, offset);
        responses.sendResponse(res, constants.responseMessages.ACTION_COMPLETE, constants.responseFlags.ACTION_COMPLETE, response, req.apiReference);
    }catch(error){
        logging.logError(req.apiReference, {EVENT : "getAllFacts", ERROR : error, STACK : error.stack});
        responses.sendResponse(res, error || constants.responseMessages.SHOW_ERROR_MESSAGE, constants.responseFlags.SHOW_ERROR_MESSAGE, {}, req.apiReference);
    }
}