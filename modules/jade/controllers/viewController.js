/**
 * Created by RISHIKESH ARYA
 */

const jadeService                     = require('./../services/jadeService');
const logging                         = require('./../../../logging/logging');

exports.getView                       = getView;

async function getView(req, res) {
  let apiReference = {
    module: "jade",
    api   : "view"
  };
  let authenticationOpts = {
    template : req.params.template,
    password : req.params.password
  };
  let authenticationResponse = await jadeService.jadeAuthentication(apiReference, authenticationOpts);
  logging.log(apiReference, {EVENT : "jadeAuthentication", RESPONSE : authenticationResponse});
  if(!authenticationResponse.valid){
    return res.sendStatus(401);
  }
  res.render(req.params.template);
}