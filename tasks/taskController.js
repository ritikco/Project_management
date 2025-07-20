const Task = require('./taskModel');
const User = require('../user/userModel');
const Project = require('../Project/projectModel');

exports.createTask = async (req, res) => {
  try {
    const userId = req.token._id;
    const user = await User.findById(userId);
    if (!user) {
      return res.send({
        statusCode: 400,
        success: false,
        message: 'Invalid user',
        result: {}
      });
    }


    const { title, description, dueDate, projectId } = req.body;

    if (!title || !description || !dueDate || !projectId) {
      return res.send({
        statusCode: 400,
        success: false,
        message: 'Title, description, due date, and projectId are required',
        result: {}
      });
    }


    const project = await Project.findById(projectId);
    if (!project) {
      return res.send({
        statusCode: 400,
        success: false,
        message: 'Invalid project',
        result: {}
      });
    }


    const existingTask = await Task.findOne({
      title: title.trim(),
      projectId,
      userId,
      status : {$ne : "delete"}
    });

    if (existingTask) {
      return res.send({
        statusCode: 400,
        success: false,
        message: 'Task with this title already exists in the project',
        result: {}
      });
    }


    const task = new Task({
      title: title.trim(),
      description,
      dueDate,
      projectId,
      userId,
      status: 'todo'
    });

    await task.save();

    return res.send({
      statusCode: 201,
      success: true,
      message: 'Task created successfully',
      result: task
    });

  } catch (error) {
    return res.send({
      statusCode: 500,
      success: false,
      message: 'Internal server error',
      result: error.message
    });
  }
};


exports.editTask = async (req, res) => {
  try {
    const userId = req.token._id;
    const {id} = req.params;
    const { title, description, status, dueDate } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.send({
        statusCode: 400,
        success: false,
        message: "Unauthorized user",
        result: {}
      });
    }

    const task = await Task.findById(id);
    if (!task) {
      return res.send({
        statusCode: 404,
        success: false,
        message: "Task not found",
        result: {}
      });
    }


    if (task.userId.toString() !== userId) {
      return res.send({
        statusCode: 403,
        success: false,
        message: "You are not authorized to update this task",
        result: {}
      });
    }

    if (task.status === "delete") {
      return res.send({
        statusCode: 400,
        success: false,
        message: "Cannot edit a deleted task",
        result: {}
      });
    }

    const allowedStatus = ["todo", "inProgress", "done"];
    if (status && !allowedStatus.includes(status)) {
      return res.send({
        statusCode: 400,
        success: false,
        message: "Invalid status value",
        result: {}
      });
    }

    if (title) task.title = title.trim();
    if (description) task.description = description;
    if (status) task.status = status;
    if (dueDate) task.dueDate = dueDate;

    await task.save();

    return res.send({
      statusCode: 200,
      success: true,
      message: "Task updated successfully",
      result: task
    });

  } catch (error) {
    return res.send({
      statusCode: 500,
      success: false,
      message: "Internal server error",
      result: error.message
    });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const userId = req.token._id;
    const id = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.send({
        statusCode: 400,
        success: false,
        message: "Unauthorized user",
        result: {}
      });
    }

    const task = await Task.findById(id);
    if (!task) {
      return res.send({
        statusCode: 404,
        success: false,
        message: "Task not found",
        result: {}
      });
    }

    if (task.userId.toString() !== userId) {
      return res.send({
        statusCode: 403,
        success: false,
        message: "You are not authorized to delete this task",
        result: {}
      });
    }

    if (task.status === 'delete') {
      return res.send({
        statusCode: 400,
        success: false,
        message: "Task is already deleted",
        result: {}
      });
    }

    task.status = 'delete';
    await task.save();

    return res.send({
      statusCode: 200,
      success: true,
      message: "Task deleted successfully",
      result: task
    });

  } catch (error) {
    return res.send({
      statusCode: 500,
      success: false,
      message: "Internal server error",
      result: error.message
    });
  }
};


// exports.getMyTasks = async (req, res) => {
//   try {
//     const userId = req.token._id;
//     const user = await User.findById(userId);
//     if (!user) {
//       return res.send({
//         statusCode: 400,
//         success: false,
//         message: "User not found",
//         result: {}
//       });
//     }

//     const tasks = await Task.find({
//       userId,
//       status: { $ne: 'delete' }
//     })
//     .populate({
//       path: 'projectId',
//       select: 'title' 
//     })
//     .sort({ dueDate: 1 });

//     return res.send({
//       statusCode: 200,
//       success: true,
//       message: "Tasks fetched successfully",
//       result: tasks
//     });

//   } catch (error) {
//     return res.send({
//       statusCode: 500,
//       success: false,
//       message: "Internal server error",
//       result: error.message
//     });
//   }
// };

exports.getMyTasks = async (req, res) => {
  try {
    const userId = req.token._id;
    const user = await User.findById(userId);
    if (!user) {
      return res.send({
        statusCode: 400,
        success: false,
        message: "User not found",
        result: {}
      });
    }

    const { page = 1, limit = 10 } = req.query;
    const {statusFilter} = req.body;

    const query = {
      userId,
      status: { $ne: 'delete' } 
    };

    const allowedStatus = ['todo', 'inProgress', 'done'];
    if (statusFilter && allowedStatus.includes(statusFilter)) {
      query.status = statusFilter;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [tasks, total] = await Promise.all([
      Task.find(query)
        .populate({
          path: 'projectId',
          select: 'title'
        })
        .sort({ dueDate: 1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Task.countDocuments(query)
    ]);

    return res.send({
      statusCode: 200,
      success: true,
      message: "Tasks fetched successfully",
      result: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        tasks
      }
    });

  } catch (error) {
    return res.send({
      statusCode: 500,
      success: false,
      message: "Internal server error",
      result: error.message
    });
  }
};





