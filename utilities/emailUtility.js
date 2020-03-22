/**
 * Created by Rishikesh Arya on 16/11/19.
 */

const _          = require("underscore");
const nodemailer = require("nodemailer");

const logging = require("./../logging/logging");

exports.sendEmail                = sendEmail;
exports.closeTransportConnection = closeTransportConnection;
exports.getEmailTransporter      = getEmailTransporter;


function sendEmail(apiReference, { msg, to, from, subject, transporter, gmail_user, gmail_password }) {
    return new Promise((resolve, reject) => {
        let closeConnection = false;
        if(!transporter){
            transporter = getEmailTransporter(gmail_user, gmail_password);
            closeConnection = true;
        }

        const mailOptions = {
            from   : from,
            to     : to,// list of receivers
            subject: subject,// Subject line
            html   : msg
        };

        transporter.sendMail(mailOptions, function (err, info) {
            if (err){
                logging.logError(apiReference, { EVENT: "sendEmail", ERROR: err.toString() });
                return reject(err);
            }
            if(closeConnection){
                closeTransportConnection(transporter);
            }
            return resolve(info);
        });
    });
}

function getEmailTransporter(gmail_user, gmail_password){
    console.log({EVENT : "getEmailTransporter", gmail_user, gmail_password});
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth   : {
            user: gmail_user || config.get("emailCreds.user"),
            pass: gmail_password || config.get("emailCreds.pass"),
        }
    });
    return transporter;
}

function closeTransportConnection(transporter){
    try{
        transporter.close();
        console.log("CLOSED TRANSPORTER CONNECTION");
    }catch(error){
        console.log("CLOSING TRANSPORTER CONNECTION ERROR");
        console.log(error);
    }
}