/**
 * Created By Rishikesh Arya on 19-11-2019
 */

const constants = require("./../../../properties/constants");
const logging   = require("./../../../logging/logging");

const { Storage } = require('@google-cloud/storage');
const storage     = new Storage({
  projectId  : constants.CLOUD_CREDS.PROJECT_ID,
  keyFilename: constants.CLOUD_CREDS.PRIVATE_KEY_PATH
});
const bucket = storage.bucket(constants.CLOUD_CREDS.BUCKET_NAME);

exports.uploadImageToStorage = uploadImageToStorage;

/**
 * Upload the image file to Google Storage
 * @param {File} file object that will be uploaded to Google Storage
 */
function uploadImageToStorage(apiReference, file){
  return new Promise((resolve, reject) => {
    if (!file) {
      reject('No image file');
    }
    let newFileName = `${Date.now()}_${file.originalname}`;
    let fileUpload  = bucket.file(`${constants.CLOUD_CREDS.FOLDER}/${newFileName}`);

    const blobStream = fileUpload.createWriteStream({
      metadata: {
        contentType: file.mimetype
      }
    });

    blobStream.on('error', (error) => {
      logging.logError(apiReference, { EVENT: "uploadImageToStorage", ERROR: error });
      reject(constants.responseMessages.UNABLE_TO_UPLOAD);
    });

    blobStream.on('finish', () => {
      fileUpload.makePublic().then(() => {
        const url = `${constants.CLOUD_CREDS.CLOUD_FILE_PATH}/${bucket.name}/${fileUpload.name}`;
        resolve(url);
      }).catch(err => {
        logging.logError(apiReference, { EVENT: "uploadImageToStorage", ERROR: err });
        reject(err);
      })
    });
    blobStream.end(file.buffer);
  });
}