/**
 * Created By Rishikesh Arya on 19-11-2019
 */

const Multer = require('multer');
const multer = Multer({
	storage: Multer.memoryStorage(),
	limits: {
	  fileSize: 5 * 1024 * 1024 // no larger than 5mb, you can change as needed.
	}
});

const fileController = require("./controller/fileController");
const auth           = require("./../../auth/authentication");

app.post("/image/upload", multer.single('file'), auth.authenticateUser , fileController.uploadImage);

