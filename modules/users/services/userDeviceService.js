/**
 * Created by Rishikesh Arya on 16/11/19.
 */

const dbHandler = require("./../../../database/mysqlLib");
const logging   = require("./../../../logging/logging");

exports.addUserDevice    = addUserDevice;
exports.getUserDevice    = getUserDevice;
exports.updateUserDevice = updateUserDevice;
exports.getUserDevicesForBulk = getUserDevicesForBulk;
exports.getUserDevicesForAll = getUserDevicesForAll;
exports.updateUserDeviceKeys = updateUserDeviceKeys;

async function addUserDevice(apiReference, {user_id, device_type, device_token, device_name, is_active}){
    try{
        let sql       = "INSERT INTO tb_user_devices SET ? ON DUPLICATE KEY UPDATE is_active = ?";
        let insertObj = {user_id, device_type, device_token, device_name, is_active};
        let values    = [insertObj, is_active];
        
        let result = await dbHandler.executeQuery(apiReference, "addUserDevice", sql, values);
        return result.insertId;
    }catch(error){
        logging.logError(apiReference, {EVENT:"addUserDevice", ERROR : error.toString()});
        throw(error);
    }
}

async function getUserDevice(apiReference, opts){
    try{
        let values   = [];
        opts.columns = opts.columns || "*";
        let sql      = `SELECT ${opts.columns} FROM tb_user_devices tud `;

        if(opts.inner_join_users){
            sql+= " INNER JOIN tb_users tu ON tud.user_id = tu.user_id ";
        }
        sql+= " WHERE 1=1 ";

        if(opts.user_id){
            sql+= " AND tud.user_id = ? ";
            values.push(opts.user_id);
        }

        if(opts.device_token){
            sql+= " AND tud.device_token = ? ";
            values.push(opts.device_token);
        }

        if(opts.is_active == 0 || opts.is_active == 1){
            sql+= " AND tud.is_active = ? ";
            values.push(opts.is_active);
        }

        if(opts.hasOwnProperty("timezone")){
            sql+= " AND tu.timezone = ? ";
            values.push(opts.timezone);
        }

        if(opts.hasOwnProperty("notification_enabled")){
            sql+= " AND tu.notification_enabled = ? ";
            values.push(opts.notification_enabled);
        }
        return await dbHandler.executeQuery(apiReference, "getUserDevice", sql, values);
    }catch(error){
        logging.logError(apiReference, {EVENT:"getUserDevice", ERROR : error.toString()});
        throw(error);
    }
}

async function getUserDevicesForBulk(apiReference, opts){
    try{
        let values   = [];
        opts.columns = opts.columns || "*";
        let sql      = `SELECT ${opts.columns} FROM tb_user_devices tud `;

        if(opts.inner_join_users){
            sql+= " INNER JOIN tb_users tu ON tud.user_id = tu.user_id ";
        }
        sql+= " WHERE 1=1 ";

        if(opts.user_ids){
            sql+= " AND tu.user_id IN (?) ";
            values.push(opts.user_ids);
        }

        if(opts.device_token){
            sql+= " AND tud.device_token = ? ";
            values.push(opts.device_token);
        }

        if(opts.is_active == 0 || opts.is_active == 1){
            sql+= " AND tud.is_active = ? ";
            values.push(opts.is_active);
        }

        if(opts.hasOwnProperty("timezone")){
            sql+= " AND tu.timezone = ? ";
            values.push(opts.timezone);
        }

        if(opts.hasOwnProperty("notification_enabled")){
            sql+= " AND tu.notification_enabled = ? ";
            values.push(opts.notification_enabled);
        }
        return await dbHandler.executeQuery(apiReference, "getUserDevice", sql, values);
    }catch(error){
        logging.logError(apiReference, {EVENT:"getUserDevice", ERROR : error.toString()});
        throw(error);
    }
}

async function getUserDevicesForAll(apiReference, opts){
    try{
        let values   = [];
        opts.columns = opts.columns || "*";
        let sql      = `SELECT ${opts.columns} FROM tb_user_devices tud `;

        if(opts.inner_join_users){
            sql+= " INNER JOIN tb_users tu ON tud.user_id = tu.user_id ";
        }
        sql+= " WHERE 1=1 ";

        if(opts.device_token){
            sql+= " AND tud.device_token = ? ";
            values.push(opts.device_token);
        }

        if(opts.is_active == 0 || opts.is_active == 1){
            sql+= " AND tud.is_active = ? ";
            values.push(opts.is_active);
        }

        if(opts.hasOwnProperty("timezone")){
            sql+= " AND tu.timezone = ? ";
            values.push(opts.timezone);
        }

        if(opts.hasOwnProperty("notification_enabled")){
            sql+= " AND tu.notification_enabled = ? ";
            values.push(opts.notification_enabled);
        }
        return await dbHandler.executeQuery(apiReference, "getUserDevice", sql, values);
    }catch(error){
        logging.logError(apiReference, {EVENT:"getUserDevice", ERROR : error.toString()});
        throw(error);
    }
}

async function updateUserDevice(apiReference, {is_active}, {user_id, device_token}){
    try{
        let values    = [];
        let updateObj = {};
        let sql       = ` UPDATE tb_user_devices SET ? WHERE 1=1 `;

        is_active == 0 ? updateObj.is_active    = is_active    : 0;
        values.push(updateObj);
        
        if(user_id){
            sql += " AND user_id = ? ";
            values.push(user_id);    
        }

        if(device_token){
            sql += " AND device_token = ? ";
            values.push(device_token);    
        }

        return await dbHandler.executeQuery(apiReference, "updateUserDevice", sql, values);
    }catch(error){
        logging.logError(apiReference, {EVENT:"updateUserDevice", ERROR : error.toString()});
        throw(error);
    }
}

async function updateUserDeviceKeys(apiReference, {user_id, device_type, device_token, device_name}){
    try{
        let values    = [];
        let updateObj = {};
        let sql       = ` UPDATE tb_user_devices SET ? WHERE 1=1 `;
        
        updateObj.device_type = device_type;
        updateObj.device_token = device_token;
        updateObj.device_name = device_name;
        values.push(updateObj);

        if(user_id){
            sql += " AND user_id = ? ";
            values.push(user_id);    
        }

        return await dbHandler.executeQuery(apiReference, "updateUserDevice", sql, values);
    }catch(error){
        logging.logError(apiReference, {EVENT:"updateUserDevice", ERROR : error.toString()});
        throw(error);
    }
}