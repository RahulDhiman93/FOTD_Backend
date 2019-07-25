// Get the mysql service
const express = require('express');
const moment = require('moment');
const underscore = require('underscore');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const apn = require('apn');
const PORT = 3001;
const app = express();

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

let provider = new apn.Provider({
    token: {
        key: "./AuthKey_TB83X4KZ64.p8",
        keyId: "TB83X4KZ64",
        teamId: "BM93ACT257"
    },
    production: true
});


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true,
}));

//Get device tokens
app.post('/addDeviceToken', (req, res) => {

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

});


// get all facts
app.get('/todaysFact', (req, res) => {

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
});


// get all facts
app.post('/addFacts', (req, res) => {

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
                        message: 'Data retrieved successfully',
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
});


app.post('/sendBulkPush', (req, res) => {

    console.log('BULK PUSH API HIT');
    let query = 'SELECT * FROM `DeviceTokens`';

    connection.query(query, (err, rows, fields) => {
        if (err) {
            console.log(err);
            return res.status(400).send({
                success: 'false',
                message: 'Server Error, Please try again!',
                data: null
            });
        } else if (!underscore.isEmpty(rows)) {
            let deviceTokensArray = []
            rows.forEach((row, index) => {
                deviceTokensArray.push(row.deviceToken)
            });

            let notification = new apn.Notification();
            notification.alert = "Hello, world!";
            notification.badge = 1;
            notification.topic = "io.github.node-apn.test-app";

            provider.send(notification, deviceTokensArray).then((response) => {

                if (response.sent) {
                    return res.status(200).send({
                        success: 'true',
                        message: 'Bulk Send Successfully',
                        data: deviceTokensArray
                    });
                } 
                else { 
                    console.log(err);
                    return res.status(400).send({
                        success: 'false',
                        message: 'Bulk Send Failed',
                        data: deviceTokensArray
                    });
                }
                // response.sent: Array of device tokens to which the notification was sent succesfully
                // response.failed: Array of objects containing the device token (`device`) and either an `error`, or a `status` and `response` from the API
            });

            

        } else {
            console.log(err);
            return res.status(400).send({
                success: 'false',
                message: 'Server Error, Please try again!',
                data: null
            });
        }
    });

});

app.listen(PORT, () => {
    console.log(`server running on port ${PORT}`)
});

