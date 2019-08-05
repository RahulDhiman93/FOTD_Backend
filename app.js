const express = require("express");
const bodyParser = require('body-parser');
const app = express();
const FactController = require('./facts.js');
const LoginAndRegisteration = require('./LoginAndRegistration.js');
const PORT = 3001;
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.post('/addDeviceToken', FactController.addDeviceToken);
app.post('/addFacts', FactController.addFacts);
app.post('/addCommonFacts', FactController.addCommonFacts);
app.post('/getCommonFacts', FactController.getCommonFacts);
app.post('/searchCommonFacts', FactController.searchCommonFacts);
app.post('/dislikeFact', FactController.dislikeFact);

app.get('/todaysFact', FactController.todaysFact);

app.post('/user_sign_up', LoginAndRegisteration.register);
app.post('/user_login', LoginAndRegisteration.authenticate);
app.post('/user_access_token_login', LoginAndRegisteration.accessTokenVerification);

app.listen(PORT, () => {
    console.log(`server running on port ${PORT}`)
})
