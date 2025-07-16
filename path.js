const express = require('express');
const router = express.Router();

const userRoutes = require('./user/userRoutes');
const projectRoutes = require("./Project/projectRoutes");
const taskController =  require("./tasks/taskRoutes")





router.use('/user', userRoutes);
router.use('/project', projectRoutes);
router.use('/task', taskController);



module.exports = router;
