// seed.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');

dotenv.config();

const User = require('./user/userModel');
const Project = require('./Project/projectModel');
const Task = require('./tasks/taskModel'); 

// Connect to DB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

const seed = async () => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Project.deleteMany({});
    await Task.deleteMany({}); 

    // Create users
    const hashedPassword = await bcrypt.hash('123456', 10);
    const user1 = await User.create({
      name: 'Ritik Tyagi',
      email: 'ritik@example.com',
      phone: '9876543210',
      password: hashedPassword
    });

    const user2 = await User.create({
      name: 'John Doe',
      email: 'john@example.com',
      phone: '1234567890',
      password: hashedPassword
    });

    // Create projects
    const projects = await Project.create([
      {
        title: 'Project Alpha',
        description: 'First project for Ritik',
        status: 'active',
        userId: user1._id
      },
      {
        title: 'Project Beta',
        description: 'Second project for Ritik',
        status: 'complete',
        userId: user1._id
      },
      {
        title: 'Project Gamma',
        description: 'Project for John',
        status: 'active',
        userId: user2._id
      }
    ]);

    // Helper function to create tasks
    const createTasksForProject = async (project, user) => {
      const now = new Date();
      await Task.create([
        {
          title: `Task 1 for ${project.title}`,
          description: 'First task',
          status: 'todo',
          dueDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days later
          projectId: project._id,
          userId: user._id
        },
        {
          title: `Task 2 for ${project.title}`,
          description: 'Second task',
          status: 'inProgress',
          dueDate: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000),
          projectId: project._id,
          userId: user._id
        },
        {
          title: `Task 3 for ${project.title}`,
          description: 'Third task',
          status: 'done',
          dueDate: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000),
          projectId: project._id,
          userId: user._id
        }
      ]);
    };

    // Create tasks for each project
    await createTasksForProject(projects[0], user1); // Project Alpha
    await createTasksForProject(projects[1], user1); // Project Beta
    await createTasksForProject(projects[2], user2); // Project Gamma

    console.log('✅ Seed data added successfully');
    process.exit();
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
};

seed();
