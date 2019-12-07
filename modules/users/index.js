/**
 * Created by Rishikesh Arya on 16/11/19.
 */
const Multer = require('multer');
const multer = Multer({
	storage: Multer.memoryStorage(),
	limits: {
	  fileSize: 5 * 1024 * 1024 // no larger than 5mb, you can change as needed.
	}
});

const userControllers = require("./controllers/userController");
const userValidators  = require("./validators/userValidator");
const auth            = require("./../../auth/authentication");

app.post("/user/login",               userValidators.login,               userControllers.login);
app.post("/user/register",            userValidators.register,            userControllers.register);
app.post("/user/loginViaAccessToken", userValidators.loginViaAccessToken, userControllers.loginViaAccessToken);
app.post("/user/forgetPassword",      userValidators.forgetPassword,      userControllers.forgetPassword);
app.post("/user/verifyOtp",           userValidators.verifyOtp,           userControllers.verifyOtp);
app.post("/user/logout",              userValidators.logOut,         auth.authenticateUser, userControllers.logOut);
app.post("/user/editProfile",         multer.single('file'),         userValidators.editProfile,    auth.authenticateUser, userControllers.editProfile);
app.post("/user/changePassword",      userValidators.changePassword,    auth.authenticateUser, userControllers.changePassword);