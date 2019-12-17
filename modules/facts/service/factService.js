/**
 * Created by Rishikesh Arya on 16/11/19.
 */

const dbHandler = require("./../../../database/mysqlLib");
const logging   = require("./../../../logging/logging");

exports.getAppVersion              = getAppVersion;
exports.getFacts                   = getFacts;
exports.addFactLike                = addFactLike;
exports.getFactLikeCount           = getFactLikeCount;
exports.addFavourite               = addFavourite;
exports.searchFacts                = searchFacts;
exports.addFact                    = addFact;
exports.getAppConfig               = getAppConfig;
exports.getUserFactCountWithStatus = getUserFactCountWithStatus;
exports.updateFact                 = updateFact;

async function getAppVersion(apiReference, {columns, device_type}){
    try{
        columns     = columns || "*";
        let sql     = `SELECT ${columns} FROM tb_app_version WHERE device_type = ? `;
        let values  = [device_type];
        
        return await dbHandler.executeQuery(apiReference, "getAppVersion", sql, values);
    }catch(error){
        logging.logError(apiReference, {EVENT:"getAppVersion", ERROR : error.toString()});
        throw(error);
    }
}

async function getAppConfig(apiReference,){
    try{
        let sql = ` SELECT
                        about_us_page,
                        insta_handle,
                        fb_handle,
                        terms_page,
                        ad_mob_enabled
                    FROM tb_app_config `;
        return await dbHandler.executeQuery(apiReference, "getAppConfig", sql, []);
    }catch(error){
        logging.logError(apiReference, {EVENT:"getAppConfig", ERROR : error.toString()});
        throw(error);
    }
}

async function getFacts(apiReference, opts){
    try{
        opts.columns     = opts.columns || "*";
        let sql     = `SELECT ${opts.columns} FROM tb_facts tbf`;
        let values  = [];

        if(opts.join_likes){
            sql+= ` LEFT JOIN tb_fact_likes tfl ON tbf.fact_id = tfl.fact_id AND tfl.user_id = ${opts.user_id} `;
        }
        
        if(opts.join_favourite){
            sql+= ` LEFT JOIN tb_user_favourite_facts tuff ON tbf.fact_id = tuff.fact_id AND tuff.user_id = ${opts.user_id} `;  
        }

        if(opts.inner_join_favourite){
            sql+= ` INNER JOIN tb_user_favourite_facts tuff ON tbf.fact_id = tuff.fact_id AND tuff.user_id = ${opts.user_id} AND tuff.status = 1 `;  
        }

        if(opts.join_user){
            sql+= ` LEFT JOIN tb_users tu ON tu.user_id = tbf.user_id `;
        }
        
        if(opts.hasOwnProperty("fact_status")){
            sql+= " WHERE tbf.fact_status = ? ";
            values.push(opts.fact_status);
        }else{
            sql+= " WHERE tbf.fact_status = 1 ";
        }

        if(opts.fact_stamp){
            sql+= " AND tbf.fact_stamp = ? ";
            values.push(opts.fact_stamp);
        }
        
        if(opts.fact_id){
            sql+= " AND tbf.fact_id = ? ";
            values.push(opts.fact_id);
        }

        if(opts.fact_type){
            sql+= " AND tbf.fact_type = ? ";
            values.push(opts.fact_type);
        }

        if(opts.need_user_added_facts){
            sql+= " AND tbf.user_id = ? ";
            values.push(opts.user_id);
        }
        
        if(opts.order_by){
            sql+= opts.order_by;
        }

        if(opts.limit != null && opts.skip != null){
            sql+= ` LIMIT ${opts.skip}, ${opts.limit} `;
        }

        
        let result = await dbHandler.executeQuery(apiReference, "getFacts", sql, values);
        return result;
    }catch(error){
        logging.logError(apiReference, {EVENT:"getFacts", ERROR : error.toString()});
        throw(error);
    }
}

async function addFactLike(apiReference, {fact_id, status, user_id}){
    try{
        let sql     = `INSERT INTO tb_fact_likes SET ? ON DUPLICATE KEY UPDATE status = ? `;
        let values  = [{fact_id, status, user_id}, status];
        
        return await dbHandler.executeQuery(apiReference, "addFactLike", sql, values);
    }catch(error){
        logging.logError(apiReference, {EVENT:"addFactLike", ERROR : error.toString()});
        throw(error);
    }
}

async function getFactLikeCount(apiReference, {fact_id}){
    try{
        let sql     = ` SELECT COUNT(
                                     CASE WHEN tfl.status = 1 THEN 1
                                     END
                                    ) AS like_count,
                                COUNT(
                                    CASE WHEN tfl.status = 0 THEN 1
                                    END
                                   ) AS dislike_count    
                        FROM tb_fact_likes tfl WHERE fact_id = ? `;
        let values  = [fact_id];
        
        return await dbHandler.executeQuery(apiReference, "getFactLikeCount", sql, values);
    }catch(error){
        logging.logError(apiReference, {EVENT:"getFactLikeCount", ERROR : error.toString()});
        throw(error);
    }
}

async function addFavourite(apiReference, {fact_id, status, user_id}){
    try{
        let sql     = `INSERT INTO tb_user_favourite_facts SET ? ON DUPLICATE KEY UPDATE status = ? `;
        let values  = [{fact_id, status, user_id}, status];
        
        return await dbHandler.executeQuery(apiReference, "addFavourite", sql, values);
    }catch(error){
        logging.logError(apiReference, {EVENT:"addFavourite", ERROR : error.toString()});
        throw(error);
    }
}

async function searchFacts(apiReference, opts){
    try{
        let sql = ` SELECT ${opts.columns || "*"} 
                        FROM 
                    tb_facts tbf 
                    LEFT JOIN tb_fact_likes tfl 
                    ON 
                    tbf.fact_id = tfl.fact_id AND tfl.user_id = ${opts.user_id}
                    LEFT JOIN tb_user_favourite_facts tuff 
                    ON 
                    tbf.fact_id = tuff.fact_id AND tuff.user_id = ${opts.user_id}
                    WHERE 
                    MATCH (tbf.fact)
                    AGAINST ("${opts.search_string}" IN NATURAL LANGUAGE MODE)  AND
                    tbf.fact_type = ${opts.fact_type} AND 
                    tbf.fact_status = 1 `;

        if(opts.need_user_added_facts == 1){
            sql+= ` AND tbf.user_id = ${opts.user_id} `;
        }

        if(opts.limit != null && opts.skip != null){
            sql+= ` LIMIT ${opts.skip}, ${opts.limit} `;
        }
        return await dbHandler.executeQuery(apiReference, "searchFacts", sql, []);
    }catch(error){
        logging.logError(apiReference, {EVENT:"searchFacts", ERROR : error});
        throw error;
    }
}

async function addFact(apiReference, opts){
    try{
        let sql     = `INSERT INTO tb_facts SET ? `;
        let insertObj = {};
        let values  = [insertObj];

        opts.hasOwnProperty("user_id")    ? insertObj.user_id     = opts.user_id     : 0;
        opts.hasOwnProperty("fact")       ? insertObj.fact        = opts.fact        : 0;
        opts.hasOwnProperty("fact_type")  ? insertObj.fact_type   = opts.fact_type   : 0;
        opts.hasOwnProperty("fact_status")? insertObj.fact_status = opts.fact_status : 0;
        
        return await dbHandler.executeQuery(apiReference, "addFact", sql, values);
    }catch(error){
        logging.logError(apiReference, {EVENT:"addFact", ERROR : error.toString()});
        throw(error);
    }
}

async function updateFact(apiReference, opts, where){
    try{
        let sql       = `UPDATE tb_facts SET ? WHERE fact_id = ? `;
        let updateObj = {};
        let values    = [updateObj, where.fact_id];

        opts.hasOwnProperty("fact_status")? updateObj.fact_status = opts.fact_status : 0;

        return await dbHandler.executeQuery(apiReference, "updateFact", sql, values);
    }catch(error){
        logging.logError(apiReference, {EVENT:"updateFact", ERROR : error.toString()});
        throw(error);
    }
}

async function getUserFactCountWithStatus(apiReference, {user_id}){
    try{
        let sql     = ` SELECT  COUNT(
                                    tbf.fact_id
                                    ) AS total_count,
                                COUNT(
                                     CASE WHEN tbf.fact_status = 0 THEN 1
                                     END
                                    ) AS pending_count,
                                COUNT(
                                    CASE WHEN tbf.fact_status = 1 THEN 1
                                    END
                                   ) AS approved_count,
                                COUNT(
                                    CASE WHEN tbf.fact_status = 2 THEN 1
                                    END
                                   ) AS rejected_count
                        FROM tb_facts tbf WHERE user_id = ? `;
        let values  = [user_id];
        
        return await dbHandler.executeQuery(apiReference, "getUserFactCountWithStatus", sql, values);
    }catch(error){
        logging.logError(apiReference, {EVENT:"getUserFactCountWithStatus", ERROR : error.toString()});
        throw(error);
    }
}