/**
 * Created by Rishikesh Arya
 */

const fs                                          = require('fs');

const logging                                     = require('./../logging/logging');

exports.readDir                                   = readDir;
exports.readFile                                  = readFile;

function readDir(apiReference, opts) {
  return new Promise((resolve, reject) => {
    fs.readdir(opts.dirNamePath, function (err, filenames) {
      if (err) {
        return reject(err);
      }
      logging.log(apiReference, {FILENAMES: filenames});
      return resolve(filenames);
    });
  });
}

function readFile(apiReference, opts) {
  return new Promise((resolve, reject) => {
    fs.readFile(opts.path, function (error, filename) {
      if (error) {
        return reject(error);
      }
      logging.log(apiReference, {FILENAME: filename});
      return resolve(filename);
    });
  });
}