/**
 * Created by Rishikesh Arya on 16/11/19.
 */

const factController = require("./controller/factController");
const factValidator  = require("./validator/factValidator");
const auth           = require("./../../auth/authentication");

// new apis
app.get('/app/version',         factValidator.checkAppVersion, factController.checkAppVersion);
app.get('/fact/today',          factValidator.getTodaysFact,   auth.authenticateUser, factController.getTodaysFact);
app.post('/fact/like',          factValidator.likeFact,        auth.authenticateUser, factController.likeFact);
app.post('/fact/favourite/add', factValidator.addFavourite,    auth.authenticateUser, factController.addFavourite);
app.get('/fact/get',            factValidator.getFacts,        auth.authenticateUser, factController.getFacts);
app.post('/fact/add',           factValidator.addFact,         auth.authenticateUser, factController.addFact);
app.get('/fact/favourite/get',  factValidator.getFavoriteFacts,auth.authenticateUser, factController.getFavoriteFacts);
app.get('/fact/getDetails',     factValidator.getFactDetails,  auth.authenticateUser, factController.getFactDetails);
app.get('/fact/featured',       factValidator.getFeaturedFact, auth.authenticateUser, factController.getFeaturedFact);
app.get('/fact/userAddedfact',  factValidator.getUserAddedfact,auth.authenticateUser, factController.getUserAddedfact);
