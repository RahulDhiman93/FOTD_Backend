/**
 * Created by Rishikesh Arya on 16/11/19.
 */

const _          = require("underscore");
const nodemailer = require("nodemailer");

const logging = require("./../logging/logging");

exports.sendEmail = sendEmail;

function sendEmail(apiReference, { msg, to, from, subject }) {
    return new Promise((resolve, reject) => {
        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth   : {
                user: config.get("emailCreds.user"),
                pass: config.get("emailCreds.pass"),
            }
        });

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
            return resolve(info);
        });
    });
}