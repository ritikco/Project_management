const express = require('express');
const router = express.Router();
const  taskController  = require('./taskController');
const {verifyToken} = require('../middleware/jwt'); 

const multer = require('multer');
const upload = multer();

router.post('/create-task',  upload.none() , verifyToken, taskController.createTask);
router.post('/edit-task/:id',  upload.none() , verifyToken, taskController.editTask);
router.post('/delete-task/:id',  upload.none() , verifyToken, taskController.deleteTask);
router.post('/get-user-task/:projectId',  upload.none() , verifyToken, taskController.getMyTasks);


module.exports = router; 
