// Get the mysql service
const express = require('express');
const moment = require('moment');
const underscore = require('underscore');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const PORT = 3001;

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

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true,
}));
// get all facts
app.get('/todaysFact', (req, res) => {

    console.log('TODAYS FACT API HITTED');
    var today = moment().format("YYYY-MM-DD")
    var query = 'SELECT * FROM `Facts` WHERE fact_stamp = ?';

    connection.query(query, [today], (err, rows, fields) => {
        if (err) {
            err.status(400).send({
                success: 'false',
                message: 'Server Error, Please try again!',
                data: null
            })
            return;
        }

        res.status(200).send({
            success: 'true',
            message: 'Data retrieved successfully',
            data: rows[0]
        })
        console.log("Query succesfully executed: ", rows);
    });
});


// get all facts
app.post('/addFacts', (req, res) => {

    console.log('TODAYS FACT API HITTED');
    var today = moment().format("YYYY-MM-DD")
    var query = 'SELECT * FROM `Facts` ORDER BY fact_id DESC LIMIT 1';

    connection.query(query, [today], (err, rows, fields) => {
        if (err) {
            err.status(400).send({
                success: 'false',
                message: 'Server Error, Please try again!',
                data: null
            })
            return;
        } else if (!underscore.isEmpty(rows)) {
            let last_date = moment(rows[0].fact_stamp).format("YYYY-MM-DD");
            let fact_new = [];
            req.body.facts.forEach((fact, index) => {
                fact.fact_stamp = moment(last_date).add(index + 1, "day").format("YYYY-MM-DD");
                fact_new.push(fact);
            });
            console.log(fact_new);
            let sql = "INSERT INTO `Facts` (fact,fact_stamp,fact_key) VALUES ?";
            let ss = connection.query(sql, [fact_new], (err, rows, fields) => {
                console.log("==POST====", err, ss.sql)
                if (err) {
                    err.status(400).send({
                        success: 'false',
                        message: 'Server Error, Please try again!',
                        data: null
                    })
                    return;
                } else {
                    res.status(200).send({
                        success: 'true',
                        message: 'Data retrieved successfully',
                        data: rows[0]
                    })
                }
            });
            console.log("Query succesfully executed: ", rows);
        } else {
            err.status(400).send({
                success: 'false',
                message: 'Server Error, Please try again!',
                data: null
            })
            return;
        }

    });
});

app.listen(PORT, () => {
    console.log(`server running on port ${PORT}`)
});

