// Get the mysql service
var express = require('express');
const bodyParser = require('body-parser');
var mysql = require('mysql');
const PORT = 3000;
var userData;

// Add the credentials to access your database
var connection = mysql.createConnection({
    host      : 'localhost',
    user      : 'root',
    password  : 'R@hul1234',
    database  : 'TestingDB'
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



// Close the connection


const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true,
}));
// get all todos
app.get('/getUsers', (req, res) => {

    var query = 'SELECT * FROM `Users`';

    connection.query(query, function (err, rows, fields) {
        if (err) {
            console.log(err,"An error ocurred performing the query.");
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

app.post('/addUser', (req, res) => {

    var query = 'INSERT INTO `Users`(`user_id`, `user_name`) VALUES (5,Node)';

    connection.query(query, function (err, rows, fields) {
        if (err) {
            console.log(err, "An error ocurred performing the query.");
            return;
        }
        res.status(200).send({
            success: 'true',
            message: 'User added successfully',
            data: req.body
        })
        console.log("Query succesfully executed: ", rows);
    });
});


app.listen(PORT, () => {
    console.log(`server running on port ${PORT}`)
});

connection.end(function () {
    // The connection has been closed
});