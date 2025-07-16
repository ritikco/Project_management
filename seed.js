// seed.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');

dotenv.config();

// Import your models
const User = require('./models/User');
const Project = require('./models/Project');

// Connect to DB
mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

const seed = async () => {
  try {
    // Clear existing data (optional)
    await User.deleteMany({});
    await Project.deleteMany({});

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
    await Project.create([
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

    console.log('✅ Seed data added successfully');
    process.exit();
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
};

seed();
