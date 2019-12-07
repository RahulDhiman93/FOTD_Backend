/**
 * Created by Rishikesh Arya on 16/11/19.
 */

const dbHandler = require("./../../../database/mysqllib");
const logging   = require("./../../../logging/logging");

exports.addFeedback    = addFeedback;
exports.getFeedback    = getFeedback;

async function addFeedback(apiReference, {user_id, device_type, feedback, comments, rating}){
    try{
        let sql       = "INSERT INTO tb_feedbacks SET ? ";
        let insertObj = {user_id, device_type, feedback, comments, rating};
        let values    = [insertObj];
        
        let result = await dbHandler.executeQuery(apiReference, "addFeedback", sql, values);
        return result.insertId;
    }catch(error){
        logging.logError(apiReference, {EVENT:"addFeedback", ERROR : error.toString()});
        throw(error);
    }
}

async function getFeedback(apiReference, {columns, user_id}){
    try{
        let values  = [];
        columns     = columns || "*";
        let sql     = `SELECT ${columns} FROM tb_feedbacks WHERE 1=1 `;

        if(user_id){
            sql+= " AND user_id = ? ";
            values.push(user_id);
        }
        
        return await dbHandler.executeQuery(apiReference, "getFeedback", sql, values);
    }catch(error){
        logging.logError(apiReference, {EVENT:"getFeedback", ERROR : error.toString()});
        throw(error);
    }
}