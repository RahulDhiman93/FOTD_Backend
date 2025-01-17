/**
 * Created by Rishikesh Arya on 16/11/19.
 */
const _                  = require("underscore");
const handlebars         = require("handlebars");

const userService        = require("./../services/userService");
const responses          = require("./../../../response/responses");
const constants          = require("./../../../properties/constants");
const logging            = require("./../../../logging/logging");
const accessTokenUtility = require("./../../../utilities/accessTokenUtility");
const userDeviceService  = require("./../services/userDeviceService");
const emailUtility       = require("./../../../utilities/emailUtility");
const fileService        = require("./../../files/services/fileService");
const notificationService = require("./../../notification/service/notificationService");

exports.login               = login;
exports.register            = register;
exports.loginViaAccessToken = loginViaAccessToken;
exports.logOut              = logOut;
exports.deleteAccount       = deleteAccount;
exports.editProfile         = editProfile;
exports.forgetPassword      = forgetPassword;
exports.verifyOtp           = verifyOtp;
exports.changePassword      = changePassword;
exports.getAllUsers         = getAllUsers;

async function login(req, res){
    try{
        let email              = req.body.email;
        let password           = req.body.password;
        let encrypted_password = accessTokenUtility.encrypt(password);
        
        let device_token       = req.body.device_token;
        let device_name        = req.body.device_name;
        let device_type        = req.body.device_type;

        let userInfo = await userService.getUser(req.apiReference, {email});
        if(_.isEmpty(userInfo) || userInfo[0].password != encrypted_password){
            throw(constants.responseMessages.INVALID_ACCESS);
        }

        if(device_token && device_type){
            userDeviceService.updateUserDeviceKeys(req.apiReference, {user_id : userInfo[0].user_id, device_type, device_token, device_name}).then().catch(err=>{
                logging.logError(req.apiReference, {EVENT : "UPDATEUSERDEVICE_LOGIN", ERROR: err});
            });
        }
        let response = await userService.getUserInfoResponseObj(req.apiReference, userInfo[0].user_id);
        responses.sendResponse(res, constants.responseMessages.ACTION_COMPLETE, constants.responseFlags.ACTION_COMPLETE, {userInfo : response}, req.apiReference);
    }catch(error){
        logging.logError(req.apiReference, {EVENT : "getUser", ERROR : error});
        responses.sendResponse(res, error || constants.responseMessages.SHOW_ERROR_MESSAGE, constants.responseFlags.SHOW_ERROR_MESSAGE, {}, req.apiReference);
    }
}

async function register(req, res){
    try{
        let name               = req.body.name;
        let email              = req.body.email;
        let timezone           = req.body.timezone;
        let timezone_info      = req.body.timezone_info;
        let password           = req.body.password;
        let encrypted_password = accessTokenUtility.encrypt(password);
        let access_token       = accessTokenUtility.generateAccessToken();

        let is_guest           = req.body.is_guest || 0;
        let device_token       = req.body.device_token;
        let device_name        = req.body.device_name;
        let device_type        = req.body.device_type;

        let emailCheck = await userService.getUser(req.apiReference, {email});
        if(!_.isEmpty(emailCheck)){
            throw(constants.responseMessages.EMAIl_ALREADY_EXIST);
        }
        console.log("IS GUEST --->");
        console.log(is_guest);
        let user_id = await userService.addUser(req.apiReference, {name, password : encrypted_password, email, access_token, is_guest, timezone, timezone_info, signup_from : device_type});
        if(device_token && device_type){
            userDeviceService.addUserDevice(req.apiReference, {device_name, device_token, device_type, user_id, is_active : 1}).then().catch(err=>{
                logging.logError(req.apiReference, {EVENT : "ADDUSERDEVICE", ERROR: err});
            });
        }
        sendNotification({ module: "notification", api: "sendRegisterNotification" }, user_id)
        let response = await userService.getUserInfoResponseObj(req.apiReference, user_id);
        responses.sendResponse(res, constants.responseMessages.ACTION_COMPLETE, constants.responseFlags.ACTION_COMPLETE, {userInfo : response}, req.apiReference);
    }catch(error){
        logging.logError(req.apiReference, {EVENT : "getUser", ERROR : error});
        responses.sendResponse(res, error || constants.responseMessages.SHOW_ERROR_MESSAGE, constants.responseFlags.SHOW_ERROR_MESSAGE, {}, req.apiReference);
    }
}

function delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
} 

async function sendNotification(apiReference, user_id_from_signup){
    await delay(1000 * 900); //Will delay this for 15 mins
    try{
        let user_id = user_id_from_signup;
        let title   = "Welcome BOSS 🤴";
        let body    = "Hey there, welcome to the world of FOTD 📖. Checkout our blog page for some amazing facts by our users 😃";

        notificationService.sendPushesToUser(apiReference, user_id, title, body);
        console.log("Notification after signup sent successfully")
    }catch(error){
        logging.logError(apiReference, {EVENT : "sendNotification", ERROR : error});
    }
}

async function logOut(req, res){
    try{
        let user_id      = req.body.user_id;
        let device_token = req.body.device_token;

        if(device_token){
            userDeviceService.updateUserDevice(req.apiReference,{is_active : 0}, {user_id, device_token}).then().catch(err=>{
                logging.logError(req.apiReference, {EVENT : "User logout", ERROR : err.toString()});
            });
        }
        
        responses.sendResponse(res, constants.responseMessages.ACTION_COMPLETE, constants.responseFlags.ACTION_COMPLETE, {}, req.apiReference);
    }catch(error){
        logging.logError(req.apiReference, {EVENT : "getUser", ERROR : error});
        responses.sendResponse(res, constants.responseMessages.SHOW_ERROR_MESSAGE, constants.responseFlags.SHOW_ERROR_MESSAGE, {}, req.apiReference);
    }
}

async function deleteAccount(req, res){
    try{
        let email              = req.body.email;
        let password           = req.body.password;
        let encrypted_password = accessTokenUtility.encrypt(password);

        let userInfo = await userService.getUser(req.apiReference, {email});
        if(_.isEmpty(userInfo) || userInfo[0].password != encrypted_password){
            throw(constants.responseMessages.INVALID_ACCESS);
        }

        let response = await userService.deleteUser(req.apiReference, userInfo[0].user_id);
        responses.sendResponse(res, constants.responseMessages.ACTION_COMPLETE, constants.responseFlags.ACTION_COMPLETE, {}, req.apiReference);
    }catch(error){
        logging.logError(req.apiReference, {EVENT : "getUser", ERROR : error});
        responses.sendResponse(res, error || constants.responseMessages.SHOW_ERROR_MESSAGE, constants.responseFlags.SHOW_ERROR_MESSAGE, {}, req.apiReference);
    }
}

async function loginViaAccessToken(req, res){
    try{
        let device_token = req.body.device_token;
        let device_type  = req.body.device_type;
        let device_name  = req.body.device_name;
        let access_token = req.body.access_token;

        let userInfo = await userService.getUser(req.apiReference, {access_token});
        if(_.isEmpty(userInfo)){
            throw(constants.responseMessages.INVALID_ACTION);
        }

        if(device_token && device_type){
            userDeviceService.updateUserDeviceKeys(req.apiReference, {user_id : userInfo[0].user_id, device_type, device_token, device_name}).then().catch(err=>{
                logging.logError(req.apiReference, {EVENT : "UPDATEUSERDEVICE_ACCESSTOKEN", ERROR: err});
            });
        }

        let response = await userService.getUserInfoResponseObj(req.apiReference, userInfo[0].user_id);
        responses.sendResponse(res, constants.responseMessages.ACTION_COMPLETE, constants.responseFlags.ACTION_COMPLETE, {userInfo : response}, req.apiReference);
    }catch(error){
        logging.logError(req.apiReference, {EVENT : "getUser", ERROR : error});
        responses.sendResponse(res, error || constants.responseMessages.SHOW_ERROR_MESSAGE, constants.responseFlags.SHOW_ERROR_MESSAGE, {}, req.apiReference);
    }
}

async function editProfile(req, res){
    try{
        let user_id              = req.body.user_id;
        let name                 = req.body.name;
        let email                = req.body.email;
        let timezone             = req.body.timezone;
        let timezone_info        = req.body.timezone_info;
        let password             = req.body.password;
        let profile_image        = req.body.profile_image;
        let notification_enabled = req.body.notification_enabled;
        
        
        let file = req.file;
        if (file) {
            profile_image = await fileService.uploadImageToStorage(req.apiReference, file);
        }
        let updateObj = {};

        name                         ? updateObj.name                 = name : 0;
        email                        ? updateObj.updated_email        = email : 0;
        timezone                     ? updateObj.timezone             = timezone : 0;
        timezone_info                ? updateObj.timezone_info        = timezone_info : 0;
        password                     ? updateObj.password             = accessTokenUtility.encrypt(password) : 0;
        password                     ? updateObj.access_token         = accessTokenUtility.generateAccessToken() : 0;
        password                     ? updateObj.otp                  = null : 0;
        profile_image                ? updateObj.profile_image        = profile_image : 0;
        notification_enabled != null ? updateObj.notification_enabled = notification_enabled : 0

        if(_.isEmpty(updateObj)){
            throw(constants.responseMessages.INVALID_ACTION);
        }
        await userService.updateUser(req.apiReference, updateObj, {user_id});
        responses.sendResponse(res, constants.responseMessages.ACTION_COMPLETE, constants.responseFlags.ACTION_COMPLETE, {}, req.apiReference);
    }catch(error){
        console.log(error)
        logging.logError(req.apiReference, {EVENT : "editProfile", ERROR : error});
        responses.sendResponse(res, error || constants.responseMessages.SHOW_ERROR_MESSAGE, constants.responseFlags.SHOW_ERROR_MESSAGE, {}, req.apiReference);
    }
}

async function forgetPassword(req, res){
    try{
        let email    = req.body.email;
        let otp      = accessTokenUtility.generateOTP(4);

        let userInfo = await userService.getUser(req.apiReference, {email});
        if(_.isEmpty(userInfo)){
            throw(constants.responseMessages.EMAIL_NOT_EXISTS);
        }
        let msg = constants.EMAIL_TEMPLATES.FORGET_PASSWORD;
        msg = handlebars.compile(msg)({OTP : otp})
        emailUtility.sendEmail(req.apiReference, {
            msg    : msg,
            to     : email,
            from   : config.get("emailCreds.user"),
            subject: constants.EMAIL_SUBJECT_LINE.FORGET_PASSWORD}).then().catch(err=>{
                logging.logError(req.apiReference, {EVENT : "forget passowrd", ERROR: err});
            });
        await userService.updateUser(req.apiReference, {otp},{email});
        responses.sendResponse(res, constants.responseMessages.ACTION_COMPLETE, constants.responseFlags.ACTION_COMPLETE, {}, req.apiReference);
    }catch(error){
        logging.logError(req.apiReference, {EVENT : "forgetPassword", ERROR : error, STACK : error.stack});
        responses.sendResponse(res, error || constants.responseMessages.SHOW_ERROR_MESSAGE, constants.responseFlags.SHOW_ERROR_MESSAGE, {}, req.apiReference);
    }
}

async function verifyOtp(req, res){
    try{
        let email    = req.body.email;
        let otp      = parseInt(req.body.otp);

        let userInfo = await userService.getUser(req.apiReference, {email});
        if(_.isEmpty(userInfo)){
            throw(constants.responseMessages.EMAIL_NOT_EXISTS);
        }
        if(otp !== userInfo[0].otp){
            throw(constants.responseMessages.INVALID_OTP);
        }
        await userService.updateUser(req.apiReference, {otp : null},{user_id : userInfo[0].user_id});
        responses.sendResponse(res, constants.responseMessages.ACTION_COMPLETE, constants.responseFlags.ACTION_COMPLETE, {access_token : userInfo[0].access_token}, req.apiReference);
    }catch(error){
        logging.logError(req.apiReference, {EVENT : "verifyOtp", ERROR : error});
        responses.sendResponse(res, error || constants.responseMessages.SHOW_ERROR_MESSAGE, constants.responseFlags.SHOW_ERROR_MESSAGE, {}, req.apiReference);
    }
}

async function changePassword(req, res){
    try{
        let user_id      = req.body.user_id;
        let old_password = req.body.old_password;
        let new_password = req.body.new_password;

        let userInfo = await userService.getUser(req.apiReference, {user_id});
        if(_.isEmpty(userInfo)){
            throw(constants.responseMessages.EMAIL_NOT_EXISTS);
        }
        if(userInfo[0].password != accessTokenUtility.encrypt(old_password)){
            throw(constants.responseMessages.WRONG_PASSWORD);
        }
        new_password = accessTokenUtility.encrypt(new_password);
        access_token = accessTokenUtility.generateAccessToken(null, user_id);
        await userService.updateUser(req.apiReference, {password : new_password, access_token, otp : null},{user_id});
        let response = await userService.getUserInfoResponseObj(req.apiReference, user_id);
        responses.sendResponse(res, constants.responseMessages.ACTION_COMPLETE, constants.responseFlags.ACTION_COMPLETE, {userInfo : response}, req.apiReference);
    }catch(error){
        logging.logError(req.apiReference, {EVENT : "forgetPassword", ERROR : error, STACK : error.stack});
        responses.sendResponse(res, error || constants.responseMessages.SHOW_ERROR_MESSAGE, constants.responseFlags.SHOW_ERROR_MESSAGE, {}, req.apiReference);
    }
}

async function getAllUsers(req, res){
    try{
        req.apiReference = {
            module: "Users",
            api   : "getAllUsers"
        };
        
        let limitParam = req.query.limit;
        let offsetParam = req.query.offset;

        let limit = limitParam == null ? 50 : limitParam;
        let offset = offsetParam == null ? 0 : offsetParam;

        let response = await userService.getAllUsers(req.apiReference, limit, offset);
        responses.sendResponse(res, constants.responseMessages.ACTION_COMPLETE, constants.responseFlags.ACTION_COMPLETE, response, req.apiReference);
    }catch(error){
        logging.logError(req.apiReference, {EVENT : "getAllUsers", ERROR : error, STACK : error.stack});
        responses.sendResponse(res, error || constants.responseMessages.SHOW_ERROR_MESSAGE, constants.responseFlags.SHOW_ERROR_MESSAGE, {}, req.apiReference);
    }
}