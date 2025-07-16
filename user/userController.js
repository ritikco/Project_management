const User = require('./userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.registerUser = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
    if (existingUser) {
      return res.send({
        statusCode : 400,
        success: false,
        message: 'User already exists with this email or phone',
        result : {}
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      phone,
      password: hashedPassword
    });

    await user.save();

    res.send({
        statusCode : 200,
      success: true,
      message: 'User registered successfully',
      result : {user}
    });

  } catch (error) {
   return res.send({
    statusCode : 500,
    success: false,
    message : "Internal Server error",
    result : error.message
   })
  }
};


exports.loginUser = async (req, res) => {
  try {
    const { emailOrPhone, password } = req.body;

    const user = await User.findOne({
      $or: [{ email: emailOrPhone }, { phone: emailOrPhone }]
    });

    if (!user) {
      return res.send({
        statusCode : 400,
        success: false,
        message: 'User not found',
        result : {}
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.send({
        statusCode : 400,
        success: false,
        message: 'Invalid credentials',
        result : {}
      });
    }

    const token = jwt.sign(
        { _id: user._id , email : user.email}, process.env.JWT_SECRET, 
        { expiresIn: '30d' });


    user.token = token;
    await user.save();

    return res.send({
      statusCode : 200,
      success: true,
      message: 'Login successful',
      result : {user}
    });

  } catch (error) {
   return res.send({
      statusCode : 500,
      success: false,
      message: 'Server error during login',
      result : error.message
    });
  }
};




