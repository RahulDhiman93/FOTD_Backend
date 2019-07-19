// Get the mysql service
var mysql = require('mysql');
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

// Perform a query
$query = 'SELECT * FROM `Users`';

connection.query($query, function (err, rows, fields) {
    if (err) {
        console.log("An error ocurred performing the query.");
        return;
    }

    userData = rows
    console.log("Query succesfully executed: ", rows);
});

// Close the connection
connection.end(function () {
    // The connection has been closed
});

const app = express();
// get all todos
app.get('/getUsers', (req, res) => {
    res.status(200).send({
        success: 'true',
        message: 'todos retrieved successfully',
        data   : userData
    })
});
const PORT = 3000;

app.listen(PORT, () => {
    console.log(`server running on port ${PORT}`)
});