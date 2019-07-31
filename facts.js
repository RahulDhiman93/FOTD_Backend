// Get the mysql service
const moment = require('moment');
const mysql = require('mysql');

// Add the credentials to access your database
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'R@hul1234',
    database: 'TestingDB'
});


// connect to mysql
connection.connect(function (err) {
    // in case of error
    if (err) {
        console.log("Connection Error")
        console.log(err.code);
        console.log(err.fatal);
    }

});

//Get device tokens
function addDeviceToken (req, res) {

    console.log('DEVICE TOKEN API HIT');
    let token = req.body.device_token;
    let deviceType = req.body.device_type;
    let query = 'INSERT INTO `DeviceTokens` (`deviceToken`, `device_type`) VALUES (?,?)';


    connection.query(query, [token, deviceType], (err, rows, fields) => {
        if (err) {
            console.log(err);
            return res.status(400).send({
                success: 'false',
                message: 'Token Error',
                data: null
            });
        }

        return res.status(200).send({
            success: 'true',
            message: 'Token Added Successfully',
            data: rows[0]
        });
    });

};


// get all facts
function todaysFact (req, res) {

    console.log('TODAYS FACT API HITTED');
    let today = moment().format("YYYY-MM-DD");
    let query = 'SELECT * FROM `Facts` WHERE fact_stamp = ?';
    let analysisQuery = 'INSERT INTO `Analysis` (`analysis_date`, `analysis_fact_id`) VALUES (?,?)'

    connection.query(query, [today], (err, rows, fields) => {
        if (err) {
            console.log(err);
            return res.status(400).send({
                success: 'false',
                message: 'Server Error, Please try again!',
                data: null
            });
        }

        let factId = rows[0].fact_id
        console.log('fact Id for analysis is : ',factId);
        connection.query(analysisQuery, [today, factId], (err, rows, fields) => {
            if (err) {
                console.log('Error in analysis query : ',err);
                return res.status(400).send({
                    success: 'false',
                    message: 'Server Error, Please try again!',
                    data: null
                });
            }
        });

        return res.status(200).send({
            success: 'true',
            message: 'Data retrieved successfully',
            data: rows[0]
        });
    });
};


// get all facts
function addFacts (req, res) {

    console.log('ADD FACT API HITTED');
    let today = moment().format("YYYY-MM-DD")
    let query = 'SELECT * FROM `Facts` ORDER BY fact_id DESC LIMIT 1';

    connection.query(query, [today], (err, rows, fields) => {
        if (err) {
            console.log(err);
            return res.status(400).send({
                success: 'false',
                message: 'Server Error, Please try again!',
                data: null
            });
        } else if (!underscore.isEmpty(rows)) {
            let last_date = moment(rows[0].fact_stamp).format("YYYY-MM-DD");
            let fact_new = [];
            req.body.facts.forEach((fact, index) => {
                fact.fact_stamp = moment(last_date).add(index + 1, "day").format("YYYY-MM-DD");
                let insert_arr = [fact.fact, fact.fact_stamp, fact.fact_key];
                fact_new.push(insert_arr);
            });
            console.log(fact_new);
            let sql = "INSERT INTO `Facts` (fact,fact_stamp,fact_key) VALUES ?";
            let ss = connection.query(sql, [fact_new], (err, rows, fields) => {
                console.log("==POST====", err, ss.sql)
                if (err) {
                    return res.status(400).send({
                        success: 'false',
                        message: 'Server Error, Please try again!',
                        data: null
                    });
                } else {
                    return res.status(200).send({
                        success: 'true',
                        message: 'Data Inserted successfully',
                        data: rows[0]
                    });
                }
            });
            console.log("Query succesfully executed: ", rows);
        } else {
            console.log(err);
            return res.status(400).send({
                success: 'false',
                message: 'Server Error, Please try again!',
                data: null
            });
        }

    });
};

function addCommonFacts (req, res) {

    console.log('ADD COMMON FACT API HITTED');
    if (!req.body.Facts) {
        return res.status(400).send({
            success: 'false',
            message: 'Facts required',
            data: null
        });
    }

    var insertFacts = [];
    req.body.Facts.forEach((fact, index) => {
        if (!fact.fact_description) {
            return res.status(400).send({
                success: 'false',
                message: 'fact_description required',
                data: null
            });
        }
        let insert_fact = fact.fact_description;
        insertFacts.push([insert_fact]);
    });

    console.log('Inserted facts : ',insertFacts);

    let query = "INSERT INTO `CommonFacts` (fact_description) VALUES ?";
    connection.query(query, [insertFacts], (err, rows, fields) => {
        console.log("==POST====", err)
        if (err) {
            return res.status(400).send({
                success: 'false',
                message: 'Server Error, Please try again!',
                data: null
            });
        } else {
            return res.status(200).send({
                success: 'true',
                message: 'Data Inserted successfully',
                data: rows[0]
            });
        }
    });

};


function getCommonFacts (req, res) {

    if (!req.body.skip) {
        if (req.body.skip != 0 ) {
        return res.status(400).send({
            success: 'false',
            message: 'Skip Required',
            data: null
        });
    };
    } else if (!req.body.limit) {
        return res.status(400).send({
            success: 'false',
            message: 'Limit Required',
            data: null
        });
    }

    console.log('COMMON FACTS API HITTED');
    let query = 'SELECT * FROM `CommonFacts` ORDER BY `fact_id` DESC LIMIT ?,?';
    let skip = parseInt(req.body.skip);
    let limit = parseInt(req.body.limit);

    connection.query(query, [skip,limit],(err, rows, fields) => {
        console.log('query is :',query);
        if (err) {
            console.log(err);
            return res.status(400).send({
                success: 'false',
                message: 'Server Error, Please try again!',
                data: null
            });
        }

        return res.status(200).send({
            success: 'true',
            message: 'Data retrieved successfully',
            data: rows
        });
    });
};

module.exports.addDeviceToken = addDeviceToken;
module.exports.todaysFact = todaysFact;
module.exports.addCommonFacts = addCommonFacts;
module.exports.getCommonFacts = getCommonFacts;
module.exports.addFacts = addFacts;
