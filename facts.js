// Get the mysql service
var express = require('express');
var moment = require('moment');
const bodyParser = require('body-parser');
var mysql = require('mysql');
const PORT = 3000;

// Add the credentials to access your database
var connection = mysql.createConnection({
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
// get all todos
app.get('/todaysFact', (req, res) => {

    var today = moment().format("YYYY-MM-DD")
    var query = 'SELECT * FROM `Facts` WHERE fact_stamp = ?';

    connection.query(query, [today],function (err, rows, fields) {
        if (err) {
            console.log(err, "An error ocurred performing the query.");
            return;
        }
        res.status(200).send({
            success: 'true',
            message: 'Data retrieved successfully',
            data: rows
        })
        console.log("Query succesfully executed: ", rows);
    });
});

app.listen(PORT, () => {
    console.log(`server running on port ${PORT}`)
});

