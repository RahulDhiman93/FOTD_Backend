/**
 * Created by Rishikesh Arya on 16/11/19.
 */

const dbHandler = require("./../../../database/mysqlLib");
const logging   = require("./../../../logging/logging");

exports.addFeedback     = addFeedback;
exports.getFeedback     = getFeedback;
exports.getAllFeedbacks = getAllFeedbacks;

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

async function getAllFeedbacks(apiReference, limit, offset){
    try{
        let sql     = `SELECT * FROM tb_feedbacks ORDER BY id DESC LIMIT ? OFFSET ?`;
        let values  = [parseInt(limit), parseInt(offset)];
        return await dbHandler.executeQuery(apiReference, "getAllFeedbacks", sql, values);
    }catch(error){
        logging.logError(apiReference, {EVENT:"getAllFeedbacks", ERROR : error.toString()});
        throw(error);
    }
}