/**
 * Created by Rishikesh Arya on 16/11/19.
 */

const feedbackController = require("./controllers/feedbackController");
const feedbackValidator  = require("./validators/feedbackValidator");
const auth               = require("./../../auth/authentication");

app.post("/feedback/add", feedbackValidator.addFeedback, auth.authenticateUser, feedbackController.addFeedback);
app.get("/getAllFeedbacks",  feedbackController.getAllFeedbacks);