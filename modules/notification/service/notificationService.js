/**
 * Created by Rishikesh Arya on 16/11/19.
 */

const apns              = require('apn');
const FCM               = require('fcm-node');
const moment			= require("moment");
const logging           = require("./../../../logging/logging");
const constants         = require("./../../../properties/constants");
const userDeviceService = require("./../../users/services/userDeviceService");
const userService		= require("./../../users/services/userService");
const factService		= require("./../../facts/service/factService");

exports.sendPushesToUser  = sendPushesToUser;
exports.sendDailyFactPush = sendDailyFactPush;

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
			let userDevices = await userDeviceService.getUserDevice(apiReference, {user_id, is_active : 1});
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
				sendIosPushNotification(apiReference, ios_devices, { "title": title, "text": body }, { "title": title, "text": body });
			}
	}catch(error){
		logging.logError(apiReference, {EVENT: "sendPushesToUser", ERROR : error});
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
		fact = (fact.substring(0, 25)).trim() + "....";
		let users = await userService.getUser(apiReference, {timezone});

		for(let i=0; i<users.length; i++){
			sendPushesToUser(apiReference, users[i].user_id, "Did you know??", fact);
		}
	}catch(error){
		logging.logError(apiReference, {EVENT: "sendDailyFactPush", ERROR : error});
	}
}