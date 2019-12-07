/**
 * Created By Rishikesh Arya on 19-11-2019
 */

const responses = require("./../../../response/responses");
const constants = require("./../../../properties/constants");
const logging   = require("./../../../logging/logging");
const fileService = require("./../services/fileService");

exports.uploadImage = uploadImage;

function uploadImage(req, res) {
  req.apiReference = {
    module: "image",
    api   : "uploadImage"
  };
  let file = req.file;
  if (file) {
    fileService.uploadImageToStorage(req.apiReference, file).then((url) => {
      logging.log(req.apiReference, { EVENT: "uploadImage", RESULT: url });
      responses.sendResponse(res, constants.responseMessages.ACTION_COMPLETE, constants.responseFlags.ACTION_COMPLETE, { url }, req.apiReference);
    }).catch((error) => {
      logging.logError(req.apiReference, { EVENT: "uploadImage", ERROR: error });
      responses.sendResponse(res, constants.responseMessages.SHOW_ERROR_MESSAGE, constants.responseFlags.SHOW_ERROR_MESSAGE, {}, req.apiReference);
    });
  }else{
    responses.sendResponse(res, constants.responseMessages.ACTION_COMPLETE, constants.responseFlags.ACTION_COMPLETE, {}, req.apiReference);
  }
}