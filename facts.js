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
                status: false,
                message: 'Token Error',
                data: null
            });
        }

        console.log(rows[0]);
        return res.status(200).send({
            status: true,
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
                status: false,
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
                    status: false,
                    message: 'Server Error, Please try again!',
                    data: null
                });
            }
        });

        console.log(rows[0]);
        return res.status(200).send({
            status: true,
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
                status: false,
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
                        status: false,
                        message: 'Server Error, Please try again!',
                        data: null
                    });
                } else {
                    console.log(rows[0]);
                    return res.status(200).send({
                        status: true,
                        message: 'Data Inserted successfully',
                        data: rows[0]
                    });
                }
            });
            console.log("Query succesfully executed: ", rows);
        } else {
            console.log(err);
            return res.status(400).send({
                status: false,
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
            status: false,
            message: 'Facts required',
            data: null
        });
    }

    var insertFacts = [];
    req.body.Facts.forEach((fact, index) => {
        if (!fact.fact_description) {
            return res.status(400).send({
                status: false,
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
                status: false,
                message: 'Server Error, Please try again!',
                data: null
            });
        } else {
            console.log(rows[0]);
            return res.status(200).send({
                status: true,
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
            status: false,
            message: 'Skip Required',
            data: null
        });
    };
    } else if (!req.body.limit) {
        return res.status(400).send({
            status: false,
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
                status: false,
                message: 'Server Error, Please try again!',
                data: null
            });
        }

        console.log(rows);
        return res.status(200).send({
            status: true,
            message: 'Data retrieved successfully',
            data: rows
        });
    });
};

function searchCommonFacts (req, res) {

    console.log('SEARCH COMMON FACT API HITTED');
    let query = 'SELECT * FROM `CommonFacts` WHERE fact_description LIKE ? ORDER BY fact_id DESC';
    let searchWord = req.body.keyword;
    console.log('Search word is : ',searchWord);
    let queryWord = '%' + searchWord + '%';
    console.log('query Search word is : ',queryWord);

    connection.query(query, [queryWord], (err, rows1, fields) => {
        console.log('query is :', query);
        if (err) {
            console.log(err);
            return res.status(400).send({
                status: false,
                message: 'Server Error, Please try again!',
                data: null
            });
        }

        let searchQuery = 'SELECT fact_id,fact AS fact_description FROM `Facts` WHERE fact LIKE ? ORDER BY fact_id DESC';
        connection.query(searchQuery, [queryWord], (err, rows2, fields) => {
            console.log('query is :', searchQuery);
            if (err) {
                console.log(err);
                return res.status(400).send({
                    status: false,
                    message: 'Server Error, Please try again!',
                    data: null
                });
            }

        console.log(rows1.concat(rows2));
        return res.status(200).send({
            status: true,
            message: 'Data retrieved successfully',
            data: rows1.concat(rows2)
           });
        });
    });
};

function dislikeFact (req, res) {

    if (!req.body.fact_id) {
        return res.status(400).send({
            status: false,
            message: 'please send fact_id',
            data: null
        });
    }

    console.log('DISLIKE FACT API HITTED');
    let fact_id = parseInt(req.body.fact_id);

    if (isNaN(fact_id)) {
        return res.status(400).send({
            status: false,
            message: 'fact_id must be a number',
            data: null
        });
    }

    console.log('Fact disliked id :',fact_id);
    let query = 'Update Facts Set fact_dislikes = fact_dislikes + 1 Where fact_id = ?';

    connection.query(query, [fact_id], (err, rows, fields) => {
        if (err) {
            console.log(err);
            return res.status(400).send({
                status: false,
                message: 'Server Error, Please try again!',
                data: null
            });
        }

        return res.status(200).send({
            status: true,
            message: 'Dislike added',
            data: null
        });
    });
};

function checkAppVersion (req, res) {

    console.log('APP VERSION API HITTED');
    let query = 'SELECT * FROM `FactAppVersion`';

    connection.query(query, (err, rows, fields) => {
        if (err) {
            console.log(err);
            return res.status(400).send({
                status: false,
                message: 'Server Error, Please try again!',
                data: null
            });
        }

        console.log('Current app version :',rows[0].app_version);
        return res.status(200).send({
            status: true,
            message: 'Current App Version',
            data: rows[0]
        });
    });
};


module.exports.addDeviceToken = addDeviceToken;
module.exports.todaysFact = todaysFact;
module.exports.addCommonFacts = addCommonFacts;
module.exports.getCommonFacts = getCommonFacts;
module.exports.addFacts = addFacts;
module.exports.searchCommonFacts = searchCommonFacts;
module.exports.dislikeFact = dislikeFact;
module.exports.checkAppVersion = checkAppVersion;
