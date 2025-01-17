/**
 * Created by Rishikesh Arya
 */

const dbHandler                         = require('./../../../database/mysqlLib');

exports.getJadeInfo                     = getJadeInfo;

function getJadeInfo(apiReference, opts){
  return new Promise((resolve, reject) => {
    let values = [opts.template];

    let query  = `SELECT * from tb_jade_passwords WHERE template = ? AND is_active = 1`;
    dbHandler.executeQuery(apiReference, "getJadeInfo" , query, values).then((result) => {
      resolve(result);
    }, (error) => {
      reject(error);
    });
  })
}