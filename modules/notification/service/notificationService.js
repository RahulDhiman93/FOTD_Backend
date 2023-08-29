/**
 * Created by Rishikesh Arya on 16/11/19.
 */

const apns     = require('apn');
const FCM      = require('fcm-node');
const moment   = require("moment");
const schedule = require('node-schedule');
const CronJob  = require("cron").CronJob;
require("dotenv").config();


const logging           = require("./../../../logging/logging");
const constants         = require("./../../../properties/constants");
const userDeviceService = require("./../../users/services/userDeviceService");
const userService		= require("./../../users/services/userService");
const factService		= require("./../../facts/service/factService");
const emailUtility		= require("./../../../utilities/emailUtility");
const { IgApiClient } = require('instagram-private-api');
const { get } = require('request-promise');

exports.sendPushesToUser      = sendPushesToUser;
exports.sendDailyFactPush     = sendDailyFactPush;
exports.sendDailyFactToBlog   = sendDailyFactToBlog;
exports.scheduleNotification  = scheduleNotification;
exports.scheduleTodayFactInBlog = scheduleTodayFactInBlog;
exports.sendEmailNotification = sendEmailNotification;
exports.sendPushesToUserForBulk = sendPushesToUserForBulk;
exports.sendPushesToAllUsers = sendPushesToAllUsers;
exports.addFactToBlog = addFactToBlog;
exports.scheduleInstaPost = scheduleInstaPost;

function sendAndroidPushNotification(apiReference, pushObj, fcm_key, device_token) {
	return new Promise((resolve) => {
		if (!device_token) {
			logging.logError(apiReference, { EVENT: "sendAndroidPushNotification", ERROR: "empty device token" });
			return resolve();
		}
		fcm_key = !fcm_key ? constants.FCM_KEY : fcm_key;
		let fcm = new FCM(fcm_key);
		let message = {
			to  : device_token,
			data: pushObj
		}

		fcm.send(message, function (err, response) {
			if (err) {
				userDeviceService.updateUserDevice(apiReference,{is_active : 0}, {device_token : device_token}).catch(err=>{});
				logging.logError(apiReference, { EVENT: "sendAndroidPushNotification", ERROR: err.toString() });
				return resolve();
			} 
			logging.log(apiReference, {EVENT : "APP NOTIFICATION RESULT",RESULT: response});
			return resolve();
		});
	});
}

function sendIosPushNotification(apiReference, iosDeviceToken, pushMessage, payload) {

	logging.log(apiReference, {
		EVENT         : "sendIosPushNotification",
		iosDeviceToken: iosDeviceToken,
		pushMessage   : pushMessage,
		payload       : payload
	});
	return new Promise((resolve) => {
		let pemPath = constants.pathToPem;
		if (!iosDeviceToken || !pushMessage || !payload) {
			logging.logError(apiReference, { EVENT: "missing data in sendIosPushNotification"});
			return resolve();
		}

		let msg     = pushMessage;
		let options = {
			cert              : pemPath,
			certData          : null,
			key               : pemPath,
			keyData           : null,
			passphrase        : 'click',
			ca                : null,
			pfx               : null,
			pfxData           : null,
			gateway           : constants.gateway,
			port              : 2195,
			rejectUnauthorized: true,
			enhanced          : true,
			cacheLength       : 100,
			autoAdjustCache   : true,
			connectionTimeout : 0,
			ssl               : true
		};

		let apnsConnection = new apns.Connection(options);
		logging.log(apiReference, { EVENT: "Printing the apnsConnection", apnsConnection: apnsConnection });
		let note = new apns.Notification();

		note.expiry             = Math.floor(Date.now() / 1000) + 3600;
		note.contentAvailable   = true;
		note.sound              = "default";
		note.alert              = msg;
		note.newsstandAvailable = 1;
		note.payload            = payload;
		note.badge              = 0;

		apnsConnection.pushNotification(note, iosDeviceToken);

		// Handle these events to confirm that the notification gets
		// transmitted to the APN server or find error if any
		function log(type) {
			return function () {
				logging.logError(apiReference, { EVENT: "iOS PUSH NOTIFICATION RESULT", RESULT: type, TOKEN: iosDeviceToken });
				if (type === 'transmitted' || type === 'transmissionError' ||
					type === 'socketError' || type === 'timeout' || type === 'error') {
					resolve(type);
				}
			}
		}

		apnsConnection.on('transmissionError', function (err, n, c) {
			logging.log(apiReference, { EVENT: "IOS PUSH NOTIFICATION", ERROR: 'transmissionError >>>>>>', err, n, c });
		});
		apnsConnection.on('error', log('error'));
		apnsConnection.on('transmitted', log('transmitted'));
		apnsConnection.on('timeout', log('timeout'));
		apnsConnection.on('connected', log('connected'));
		apnsConnection.on('disconnected', log('disconnected'));
		apnsConnection.on('socketError', log('socketError'));
		apnsConnection.on('transmissionError', log('transmissionError'));
		apnsConnection.on('cacheTooSmall', log('cacheTooSmall'));
	});
};

async function sendPushesToUser(apiReference, user_id, title, body){
	try{
			let userDevices = await userDeviceService.getUserDevice(apiReference, {user_id, is_active : 1, notification_enabled : 1, inner_join_users : 1});
			let ios_devices = [];
			let androidPushObj = {
				message: body,
				title  : title
			}
			for(let count = 0; count< userDevices.length; count++){
					let temp = userDevices[count];
					if(temp.device_type == constants.DEVICE_TYPE.IOS){
						ios_devices.push(temp.device_token);
						continue;
					}
					sendAndroidPushNotification(apiReference, androidPushObj, null, temp.device_token);
			}
			if(ios_devices.length){
				sendIosPushNotification(apiReference, ios_devices, { "title": title, "body": body }, { "title": title, "body": body });
			}
	}catch(error){
		logging.logError(apiReference, {EVENT: "sendPushesToUser", ERROR : error});
	}
}

async function sendPushesToUserForBulk(apiReference, user_ids, title, body){
	try{
			let userDevices = await userDeviceService.getUserDevicesForBulk(apiReference, {user_ids, is_active : 1, notification_enabled : 1, inner_join_users : 1});
			let ios_devices = [];
			let androidPushObj = {
				message: body,
				title  : title
			}
			for(let count = 0; count< userDevices.length; count++){
					let temp = userDevices[count];
					if(temp.device_type == constants.DEVICE_TYPE.IOS){
						ios_devices.push(temp.device_token);
						continue;
					}
					sendAndroidPushNotification(apiReference, androidPushObj, null, temp.device_token);
			}
			if(ios_devices.length){
				sendIosPushNotification(apiReference, ios_devices, { "title": title, "body": body }, { "title": title, "body": body });
			}
	}catch(error){
		logging.logError(apiReference, {EVENT: "sendPushesToUser", ERROR : error});
	}
}

async function sendPushesToAllUsers(apiReference, title, body){
	try{
			let userDevices = await userDeviceService.getUserDevicesForAll(apiReference, {is_active : 1, notification_enabled : 1, inner_join_users : 1});
			let ios_devices = [];
			let androidPushObj = {
				message: body,
				title  : title
			}
			for(let count = 0; count< userDevices.length; count++){
					let temp = userDevices[count];
					if(temp.device_type == constants.DEVICE_TYPE.IOS){
						ios_devices.push(temp.device_token);
						continue;
					}
					sendAndroidPushNotification(apiReference, androidPushObj, null, temp.device_token);
			}
			if(ios_devices.length){
				sendIosPushNotification(apiReference, ios_devices, { "title": title, "body": body }, { "title": title, "body": body });
			}
	}catch(error){
		logging.logError(apiReference, {EVENT: "sendPushesToAllUsers", ERROR : error});
	}
}

async function sendDailyFactPush(apiReference, timezone){
	try{

		let today      = moment().format("YYYY-MM-DD");
        let todaysFact = await factService.getFacts(apiReference, {
            fact_stamp    : today,
            columns       : " tbf.* ",
            fact_type     : constants.FACT_TYPE.DAILY_FACT
		});
		
		if(!todaysFact.length){
			return;
		}

		let fact = todaysFact[0].fact;
		fact = fact.split(" ").slice(0, 7).join(" ")+"...";
		let users = await userService.getUser(apiReference, {timezone, notification_enabled : 1});

		for(let i=0; i<users.length; i++){
			sendPushesToUser(apiReference, users[i].user_id, "Did you know??", fact);
		}
	}catch(error){
		logging.logError(apiReference, {EVENT: "sendDailyFactPush", ERROR : error});
	}
}

async function sendDailyFactToBlog(){
	try{

		let yesterday      = moment().subtract(1, 'days').format("YYYY-MM-DD");
        let yesterdaysFact = await factService.getFacts(apiReference, {
            fact_stamp    : yesterday,
            columns       : " tbf.* ",
            fact_type     : constants.FACT_TYPE.DAILY_FACT
		});
		
		if(!yesterdaysFact.length){
			return;
		}

		let fact = yesterdaysFact[0].fact;
		addFactToBlog(fact);

	}catch(error){
		logging.logError(apiReference, {EVENT: "sendDailyFactToBlog", ERROR : error});
	}
}

async function addFactToBlog(fact_string){
    try{
        let user_id     = 0;
        let fact_type   = constants.FACT_TYPE.USER_FACT;
        let fact        = fact_string;
        let fact_status = 1;

        await factService.addFact(req.apiReference, {user_id, fact_type, fact, fact_status});
        responses.sendResponse(res, constants.responseMessages.ACTION_COMPLETE, constants.responseFlags.ACTION_COMPLETE, {}, req.apiReference);
    }catch(error){
        logging.logError(req.apiReference, {EVENT : "addFact", ERROR : error});
        responses.sendResponse(res, error || constants.responseMessages.SHOW_ERROR_MESSAGE, constants.responseFlags.SHOW_ERROR_MESSAGE, {}, req.apiReference);
    }
}

function scheduleNotification() {
	console.log("scheduling notifications")
	schedule.scheduleJob("*/15 * * * *", function () {
		let curr_date_time    = new Date();
		let notification_time = new Date();
		notification_time.setHours(10);
		notification_time.setMinutes(0);
		let timezone = -((curr_date_time.getTime() - notification_time.getTime()) / 60000);
		console.error("notification_time", notification_time);
		console.error("curr_date_time", curr_date_time);
		console.error("timezone", timezone);
		sendDailyFactPush({ module: "notification", api: "sendNotification" }, timezone);
	});
}

function scheduleTodayFactInBlog() {
	console.log("scheduling today fact to blog")
	schedule.scheduleJob("59 * * * * *", function () {
		console.error("Updating blog section");
		sendDailyFactToBlog()
	});
}

async function sendEmailNotification(apiReference, user_ids, html, subject, gmail_user, gmail_password) {
	try {
		    user_ids = user_ids && user_ids.length ? user_ids : 0;
		let users    = await userService.getUser(apiReference, { user_ids });

		let transporter = emailUtility.getEmailTransporter(gmail_user, gmail_password);
		for (let count = 0; count < users.length; count++) {
			emailUtility.sendEmail(apiReference, {
				msg        : html,
				to         : users[count].email,
				from       : config.get("emailCreds.user"),
				subject    : subject,
				transporter: transporter
			}).then(result => {
				if (count == users.length-1) {
					emailUtility.closeTransportConnection(transporter);
				}
			}).catch(err => {
				if (count == users.length-1) {
					emailUtility.closeTransportConnection(transporter);
				}
				logging.logError(apiReference, { EVENT: "send Email", ERROR: err });
			});
		}
	} catch (error) {
		logging.logError(apiReference, { EVENT: "sendEmailNotification", ERROR: error });
	}
}

const postToInsta = async () => {
    const ig = new IgApiClient();
    ig.state.generateDevice(process.env.IG_USERNAME);
    await ig.account.login(process.env.IG_USERNAME, process.env.IG_PASSWORD);

	const imageBuffer = await get({
        url: 'https://i.imgur.com/BZBHsauh.jpg',
        encoding: null, 
    });

    await ig.publish.photo({
        file: imageBuffer,
        caption: 'Really nice photo from the internet!',
    });
}

const cronInsta = new CronJob("59 * * * * *", async () => {
	console.error("Posting to Insta");
    postToInsta();
});

function scheduleInstaPost() {
	console.log("scheduling insta post")
	cronInsta.start();
}