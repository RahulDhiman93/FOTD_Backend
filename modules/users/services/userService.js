/**
 * Created by Rishikesh Arya on 16/11/19.
 */

const dbHandler   = require("./../../../database/mysqlLib");
const logging     = require("./../../../logging/logging");
const factService = require("./../../facts/service/factService");
const constants   = require("./../../../properties/constants");

exports.addUser                = addUser;
exports.getUser                = getUser;
exports.updateUser             = updateUser;
exports.getUserInfoResponseObj = getUserInfoResponseObj;
exports.getApiKeyUser          = getApiKeyUser;
exports.getAllUsers            = getAllUsers;

async function addUser(apiReference, {name, password, email, access_token, is_guest , timezone, timezone_info, signup_from=null}){
    try{
        let sql       = "INSERT INTO tb_users SET ? ";
        let insertObj = {name, password, email, access_token, is_guest, timezone, timezone_info, signup_from};
        let values    = [insertObj];
        
        let result = await dbHandler.executeQuery(apiReference, "addUser", sql, values);
        return result.insertId;
    }catch(error){
        logging.logError(apiReference, {EVENT:"addUser", ERROR : error.toString()});
        throw(error);
    }
}

async function getUser(apiReference, opts){
    try{
        let values  = [];
        opts.columns = opts.columns || "*";
        let sql     = `SELECT ${opts.columns} FROM tb_users WHERE 1=1 `;

        if(opts.email){
            sql+= " AND email = ? ";
            values.push(opts.email);
        }

        if(opts.user_id){
            sql+= " AND user_id = ? ";
            values.push(opts.user_id);
        }

        if(opts.access_token){
            sql+= " AND access_token = ? ";
            values.push(opts.access_token);
        }
        
        if(opts.hasOwnProperty("timezone")){
            sql+= " AND timezone = ? ";
            values.push(opts.timezone);
        }

        if(opts.hasOwnProperty("notification_enabled")){
            sql+= " AND notification_enabled = ? ";
            values.push(opts.notification_enabled);
        }
        
        if(opts.user_ids){
            sql+= " AND user_id IN (?) ";
            values.push(opts.user_ids);
        }


        return await dbHandler.executeQuery(apiReference, "getUser", sql, values);
    }catch(error){
        logging.logError(apiReference, {EVENT:"getUser", ERROR : error.toString()});
        throw(error);
    }
}

async function updateUser(apiReference, updates, {user_id, email}){
    try{
        let values    = [];
        let updateObj = {};
        let sql       = ` UPDATE tb_users SET ? WHERE 1=1 `;

        updates.updated_email                         ? updateObj.email                = updates.updated_email        : 0;
        updates.password                              ? updateObj.password             = updates.password             : 0;
        updates.name                                  ? updateObj.name                 = updates.name                 : 0;
        updates.access_token                          ? updateObj.access_token         = updates.access_token         : 0;
        updates.profile_image                         ? updateObj.profile_image        = updates.profile_image        : 0;
        updates.hasOwnProperty("otp")                 ? updateObj.otp                  = updates.otp                  : 0;
        updates.hasOwnProperty("notification_enabled")? updateObj.notification_enabled = updates.notification_enabled : 0;
        updates.hasOwnProperty("timezone")            ? updateObj.timezone             = updates.timezone             : 0;
        updates.hasOwnProperty("timezone_info")       ? updateObj.timezone_info        = updates.timezone_info        : 0;
        updates.hasOwnProperty("last_login")          ? updateObj.last_login           = updates.last_login           : 0;
        updates.hasOwnProperty("reward_points")       ? updateObj.reward_points        = updates.reward_points        : 0;
        values.push(updateObj);

        if(user_id){
            sql += " AND user_id = ? ";
            values.push(user_id);    
        }

        if(email){
            sql += " AND email = ? ";
            values.push(email);    
        }
        return await dbHandler.executeQuery(apiReference, "updateUser", sql, values);
    }catch(error){
        logging.logError(apiReference, {EVENT:"updateUser", ERROR : error.toString()});
        throw(error);
    }
}

async function getUserInfoResponseObj(apiReference, user_id){
    try{
        let result = {};
        let userInfo = await getUser(apiReference, {columns : "*", user_id});
        if(userInfo.length){
            updateUser(apiReference, {last_login : new Date()}, {user_id});
            result = userInfo[0];
            delete userInfo[0].password;
            delete userInfo[0].otp;
            let userFactCount = await factService.getUserFactCountWithStatus(apiReference, {user_id});
            result.userFactCount = userFactCount[0];
            result.avatars = constants.AVATAR;
        }
        return result;
    }catch(error){
        console.error(error);
        logging.logError(apiReference, {EVENT:"getUserInfoResponseObj", ERROR: error.toString(), STACK : error.STACK});
        throw(error);
    }
}

async function getApiKeyUser(apiReference, {api_key, columns}){
    try{
        let values  = [];
        columns     = columns || "*";
        let sql     = `SELECT ${columns} FROM tb_user_api_keys WHERE is_deleted = 0 `;
        if(api_key){
            sql+= " AND api_key = ? ";
            values.push(api_key);
        }

        return await dbHandler.executeQuery(apiReference, "getApiKeyUser", sql, values);
    }catch(error){
        logging.logError(apiReference, {EVENT:"getApiKeyUser", ERROR : error.toString()});
        throw(error);
    }
}

async function getAllUsers(apiReference, limit, offset){
    try{
        let sql     = `SELECT * FROM tb_users ORDER BY user_id DESC LIMIT ? OFFSET ?`;
        let values    = [limit, offset];
        return await dbHandler.executeQuery(apiReference, "getAllUsers", sql, values);
    }catch(error){
        logging.logError(apiReference, {EVENT:"getAllUsers", ERROR : error.toString()});
        throw(error);
    }
}