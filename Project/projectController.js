const Project = require('./projectModel');
const User = require('../user/userModel');

exports.createProject = async (req, res) => {
  try {
    const userId = req.token._id;
    console.log(userId);
    
    const user = await User.findById(userId);
    if(!user){
        return res.send({
            statusCode : 400,
            success : false ,
            message : "user not found",
            result : {}
        })
    }
    
    const { title, description } = req.body;

    if (!title || !description) {
      return res.send({
        statusCode: 400,
        success: false,
        message: 'Title and description are required',
        result: {}
      });
    }

    const project = new Project({
      title,
      description,
      status: 'active',
      userId
    });

    await project.save();

    return res.send({
      statusCode: 200,
      success: true,
      message: 'Project created successfully',
      result: project
    });

  } catch (error) {
    console.error('Error creating project:', error);
    return res.send({
      statusCode: 500,
      success: false,
      message: 'Internal server error',
      result: error.message
    });
  }
};


exports.editProject = async (req, res) => {
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

    const projectId = req.params.id;
    const { title, description } = req.body;

    if (!projectId) {
      return res.send({
        statusCode: 400,
        success: false,
        message: "Project ID is required",
        result: {}
      });
    }

    const project = await Project.findById(projectId);

    if (!project) {
      return res.send({
        statusCode: 404,
        success: false,
        message: "Project not found",
        result: {}
      });
    }


    if (project.userId.toString() !== userId) {
      return res.send({
        statusCode: 403,
        success: false,
        message: "You are not authorized to update this project",
        result: {}
      });
    }

    if (title) project.title = title;
    if (description) project.description = description;

    await project.save();

    return res.send({
      statusCode: 200,
      success: true,
      message: "Project updated successfully",
      result: project
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

exports.changeStatus = async (req, res) => {
  try {
    const userId = req.token._id;
    const user = await User.findById(userId);

    if (!user) {
      return res.send({
        statusCode: 400,
        success: false,
        message: "Unauthorized user",
        result: {}
      });
    }

    const id = req.params.id;
    const { status } = req.body;

    if (!id || !status) {
      return res.send({
        statusCode: 400,
        success: false,
        message: "Project ID and status are required",
        result: {}
      });
    }

    const project = await Project.findById(id);

    if (!project) {
      return res.send({
        statusCode: 404,
        success: false,
        message: "Project not found",
        result: {}
      });
    }

    if (project.userId.toString() !== userId) {
      return res.send({
        statusCode: 403,
        success: false,
        message: "You are not authorized to update this project",
        result: {}
      });
    }

    const allowedStatus = ['complete', 'delete'];
    if (!allowedStatus.includes(status)) {
      return res.send({
        statusCode: 400,
        success: false,
        message: "Invalid status value",
        result: {}
      });
    }

    project.status = status;
    await project.save();

    return res.send({
      statusCode: 200,
      success: true,
      message: "Status changed successfully",
      result: project
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

exports.getUserProjects = async (req, res) => {
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

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const {statusFilter} = req.body;

    console.log(statusFilter);
    

    const query = {
      userId,
      status: { $ne: 'delete' }
    };

    if (statusFilter && ['active', 'complete'].includes(statusFilter)) {
      query.status = statusFilter;
    }

    const skip = (page - 1) * limit;

    const [projects, total] = await Promise.all([
      Project.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Project.countDocuments(query)
    ]);

    return res.send({
      statusCode: 200,
      success: true,
      message: "Projects fetched successfully",
      result: {
        total,
        page,
        limit,
        projects
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



