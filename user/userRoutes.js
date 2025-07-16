const express = require('express');
const router = express.Router();
const  userController  = require('./userController');
const multer = require('multer');
const upload = multer();

router.post('/register',  upload.none(), userController.registerUser);
router.post('/log_in',  upload.none(), userController.loginUser);

module.exports = router;
