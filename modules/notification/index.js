/**
 * Created by Rishikesh Arya on 16/11/19.
 */

const notificationControllers = require("./controllers/notificationController");
const notificationValidators  = require("./validators/notificationValidator");
// const auth                    = require("./../../auth/authentication");

app.post("/notification/send",      notificationValidators.sendNotification, notificationControllers.sendNotification);
app.post("/notification/sendEmail", notificationValidators.sendEmailNotification, notificationControllers.sendEmailNotification);