const mysql = require('mysql');
const passwordHash = require('password-hash');
const crypto = require('crypto');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'R@hul1234',
    database: 'TestingDB'
});

connection.connect(function (err) {
    if (err) {
        console.log("Error while connecting with database");
    } else {
        console.log("Database is connected");
    }
});


function register(req, res) {
    console.log('REGISTER API HIT');
    console.log('Params Received : ',req.body);

    if (!req.body.user_name) {
        return res.status(400).send({
            status: false,
            message: 'name required',
            data: null
        });
    } else if (!req.body.user_email) {
        return res.status(400).send({
            status: false,
            message: 'email required',
            data: null
        });
    } else if (!req.body.password) {
        return res.status(400).send({
            status: false,
            message: 'password required',
            data: null
        });
    }

    let searchQuery = 'SELECT COUNT(user_email) AS `flag` FROM `profiles` WHERE user_email = ?';
    connection.query(searchQuery, [req.body.user_email], function (error, results, fields) {
        if (error) {
            console.log('query error : ', error);
            return res.status(400).send({
                status: false,
                message: 'Something went wrong',
                data: null
            });
        } else {
            console.log('Checking email exists');
            if (results[0].flag > 0) {
                console.log('Email exists');
                return res.status(400).send({
                    status: true,
                    message: 'User exists',
                    data : null
                });
                return;
            } else {
                console.log('New user');
                let today = new Date();
                let passwordEncrypt = passwordHash.generate(req.body.password);
                let user = {
                    "user_name": req.body.user_name,
                    "user_email": req.body.user_email,
                    "password": passwordEncrypt,
                    "access_token": crypto.randomBytes(128).toString('hex'),
                    "created_at": today,
                    "updated_at": today,
                    "device_token" : req.body.device_token
                };

                let query = 'INSERT INTO profiles SET ?';
                connection.query(query, user, function (error, results, fields) {
                    if (error) {
                        console.log('query error : ', error);
                        return res.status(400).send({
                            status: true,
                            message: 'Something went wrong',
                            data: null
                        });
                    } else {
                        connection.query('SELECT * FROM profiles WHERE user_email = ?', [req.body.user_email], function (error, results, fields) {
                            if (error) {
                                return res.status(400).send({
                                    status: false,
                                    message: 'query error',
                                    data: null
                                });
                            } else {
                                console.log('SUCCESSFULLY REGISTERED USER');
                                return res.status(200).send({
                                    status: true,
                                    message: 'successfully registered',
                                    data: results[0]
                                });
                            }
                        });
                    }
                });
            }
        }
    });
}

function authenticate(req, res) {
    console.log('AUTHENTICATION API HIT');

    let email = req.body.user_email;
    let password = req.body.password;
    connection.query('SELECT * FROM profiles WHERE user_email = ?', [email], function (error, results, fields) {
        if (error) {
            return res.status(400).send({
                status: false,
                message: 'query error',
                data: null
            });
        } else {
            console.log('Params recieved : ', req.body);
            if (results.length > 0) {
                if (passwordHash.verify(password, results[0].password)) {
                    console.log('SUCCESSFULLY AUTHENTICATED');
                    return res.status(200).send({
                        status: true,
                        message: 'successfully authenticated',
                        data : results[0]
                    });
                } else {
                    console.log('NOT AUTHENTICATED');
                    return res.status(400).send({
                        status: false,
                        message: 'not registered with us or incorrect password',
                        data: null
                    });
                }

            }
            else {
                return res.status(400).send({
                    status: false,
                    message: 'not registered with us or incorrect password',
                    data: null
                });
            }
        }
    });
}

function accessTokenVerification(req, res) {
    console.log('ACCESSTOKEN API HIT');

    var accessToken = req.body.access_token;
    let query = 'SELECT * FROM profiles WHERE access_token = ?';
    connection.query(query, [accessToken], function (error, results, fields) {
        if (error) {
            return res.status(400).send({
                status: false,
                message: 'there are some error with query',
                data: null
            });
        } else {
            console.log('Params recieved : ', req.body);
            if (results.length > 0) {
                console.log('VALID ACCESSTOKEN');
                return res.status(200).send({
                    status: true,
                    message: 'User found',
                    data : results[0]
                });
            } else {
                console.log('NOT A VALID ACCESSTOKEN');
                return res.status(400).send({
                    status: false,
                    message: 'Invalid access token',
                    data: null
                });
            }
        }
    });
}

module.exports.register = register;
module.exports.authenticate = authenticate;
module.exports.accessTokenVerification = accessTokenVerification;