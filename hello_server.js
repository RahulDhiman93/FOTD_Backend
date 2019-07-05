const bodyParser = require('body-parser');
const express = require('express');
const routes = require('./routes');
const port = 3005;

const app = express();

routes(app);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true,
}));

const server = app.listen(port, (error) => {
    if (error) return console.log(`Error: ${error}`);

    console.log(`Server listening on port ${server.address().port}`);
});