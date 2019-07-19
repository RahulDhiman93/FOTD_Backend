// Get the mysql service
var express = require('express');
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
/*connection.end(function () {
    // The connection has been closed
});*/

const app = express();
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

app.post('/newUser', (req, res) => {

        res.status(200).send({
            success: 'true',
            message: 'Data retrieved successfully',
            data: req.body
        })
    
});


app.listen(PORT, () => {
    console.log(`server running on port ${PORT}`)
});
