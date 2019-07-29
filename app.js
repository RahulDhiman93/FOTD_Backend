const express = require("express");
const bodyParser = require('body-parser');
const app = express();
const FactController = require('./facts.js');
const PORT = 3001;
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.post('/addDeviceToken', FactController.addDeviceToken);
app.post('/addFacts', FactController.addFacts);
app.post('/addCommonFacts', FactController.addCommonFacts);
app.post('/getCommonFacts', FactController.getCommonFacts);

app.get('/todaysFact', FactController.todaysFact);

app.listen(PORT, () => {
    console.log(`server running on port ${PORT}`)
});