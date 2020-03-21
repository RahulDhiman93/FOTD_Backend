let moment                        = require('moment');
let envProperties                 = require('./../properties/envProperties');

exports.log                       = log;
exports.logError                  = logError;
let debugging_enabled             = true;

if (envProperties.isEnvLive()) {
  debugging_enabled = false;
}

function log(apiReference, log) {
  if (debugging_enabled
    && apiReference
    && apiReference.module
    && apiReference.api
    && fileSwitches
    && fileSwitches[apiReference.module] == true
    && modules
    && modules[apiReference.module]
    && modules[apiReference.module][apiReference.api] == true) {

    try {
      log = JSON.stringify(log);
    }
    catch (exception) {
    }
    console.log("-->" + moment(new Date()).format('YYYY-MM-DD hh:mm:ss.SSS') + " :----: " +
      apiReference.module + " :=: " + apiReference.api + " :=: " + log);
  }
}

function logError(apiReference, log) {
  if (apiReference
    && apiReference.module
    && apiReference.api) {

    try {
      log = JSON.stringify(log);
    }
    catch (exception) {
    }
    console.error("-->" + apiReference.module + " :=: " + apiReference.api + " :=: " + log);
  }
}


const fileSwitches = {
  startup     : true,
  mysqlLib    : true,
  users       : true,
  fact        : true,
  feedback    : true,
  image       : true,
  notification: true,
  jade        : true
};

const modules = {
  mysqlLib    : {
    executeQuery     : true,
    executeSlaveQuery: true
  },
  startup     : {
    initialize: true
  },
  users : {
    login              : true,
    login              : true,
    register           : true,
    loginViaAccessToken: true,
    logOut             : true,
    editProfile        : true,
    forgetPassword     : true,
    verifyOtp          : true,
    changePassword     : true
  },
  fact : {
    checkAppVersion : true,
    getTodaysFact   : true,
    likeFact        : true,
    addFavourite    : true,
    getFacts        : true,
    addFact         : true,
    getFavoriteFacts: true,
    getFactDetails  : true,
    getFeaturedFact : true,
    getUserAddedfact: true,
    getPendingFacts : true,
    approveFact     : true,
    getFactsV2      : true
  },
  feedback : {
    addFeedback: true
  },
  image : {
    uploadImage : true
  },
  notification : {
    sendNotification     : true,
    sendEmailNotification: true
  },
  jade : {
    view : true
  }
};
