/**
 * Created by RISHIKESH ARYA
 */

const viewsController                          = require('./controllers/viewController');
app.get('/jade/:template/:password',           viewsController.getView);