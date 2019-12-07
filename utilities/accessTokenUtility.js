/**
 * Created by Rishikesh Arya on 16/11/19.
 */

var MD5                                 =   require('MD5');

exports.generateAccessToken            = generateAccessToken;
exports.generateRandomStringAndNumbers = generateRandomStringAndNumbers;
exports.encrypt                        = encrypt;
exports.generateOTP                    = generateOTP;

function generateAccessToken(input, userID) {
  var string = '';
  var string2 = '';
  if (userID) {
    string = userID + ".";
  }
  if (input) {
    string2 += input;
  }
  string2 += generateRandomStringAndNumbers() + new Date().getTime();
  string = MD5(string2);
  return string;
}

function generateRandomStringAndNumbers() {
  var text     = "";
  var possible = "abcdefghijklmnopqrstuvwxyz0123456789";
  for (var i = 0; i < 8; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  return text;
}

function encrypt(string){
  return MD5(string);
}

function generateOTP (length) {
  length = length || 4;
  let otp = Math.floor(100000 + Math.random() * 900000);
  otp     = otp.toString().substring(0, length);
  return parseInt(otp);
}