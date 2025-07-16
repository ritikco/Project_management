const express = require('express');
const router = express.Router();
const  projectController  = require('./projectController');
const {verifyToken} = require('../middleware/jwt'); 

const multer = require('multer');
const upload = multer();

router.post('/create-project',  upload.none() , verifyToken, projectController.createProject);
router.post('/edit-project/:id',  upload.none() , verifyToken, projectController.editProject);
router.post('/change-status-project/:id',  upload.none() , verifyToken, projectController.changeStatus);
router.post('/get-projects',  upload.none() , verifyToken, projectController.getUserProjects);


module.exports = router; 
