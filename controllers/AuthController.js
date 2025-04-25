import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from "../models/User.js"
import dotenv from 'dotenv';
import { sendEmail } from '../utils/sendEmail.js';
import express from 'express';

dotenv.config();





// Validate token
export const validate = async (req, res) => {
  try {
    // The authMiddleware already validates the token
    res.status(200).json({ message: 'Token valid', user: req.user });
  } catch (error) {
    console.error('Token validation error:', error.message);
    res.status(400).json({ message: 'Invalid token' });
  }
};



// Login function
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role }, // Include user ID and role in the payload
      process.env.JWT_SECRET,
      { expiresIn: '1h' } // Token expires in 1 hour
    );

    // Set token in a secure HTTP-only cookie
    res.cookie('jwt', token, {
      httpOnly: true, // Prevent XSS attacks
      secure: process.env.NODE_ENV === 'production', // Use HTTPS in production
      sameSite: 'strict', // Prevent CSRF attacks
      maxAge: 3600000, // 1 hour (matches token expiration)
    });

    // Return success response
    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login Error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};






const router = express.Router();

// Logout Route
export const logout = (req, res) => {
  try {
    // Clear the JWT cookie with the correct options
    res.clearCookie('jwt', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Ensure secure flag in production
      sameSite: 'strict', // Prevent cross-site attacks
      path: '/', // Match the path where the cookie was set
    });

    // Respond with success message
    return res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout Error:', error.message);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Export the route
router.post('/logout', logout);

export default router;





// Signup function
export const signup = async (req, res) => {
  try {
    const { email, password, role, name, phone } = req.body;

    // Validate input
    if (!email || !password || !role || !name) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = new User({
      email,
      password: hashedPassword,
      role,
      name,
      phone,
    });

    // Save user to the database
    await user.save();

    // Return success response
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Signup Error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

//forgotpassword

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const otp = await user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    const message = `Your password reset OTP is: ${otp}\nIt is valid for 10 minutes.\nDo not share this code with anyone.`;

    await sendEmail(user.email, 'Password Reset OTP', message);

    res.status(200).json({ message: 'OTP sent to your email' });
  } catch (error) {
    console.error('Forgot Password Error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};



//reset password
export const resetPassword = async (req, res) => {
  try {
    const { otp, newPassword } = req.body;

    if (!otp || !newPassword) {
      return res.status(400).json({ message: 'OTP and new password are required' });
    }

    // Get all users with non-expired OTPs
    const candidates = await User.find({
      passwordResetExpires: { $gt: Date.now() },
    });

    let user = null;
    for (let i = 0; i < candidates.length; i++) {
      const match = await bcrypt.compare(otp, candidates[i].passwordResetToken || '');
      if (match) {
        user = candidates[i];
        break;
      }
    }

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }
    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    // user.password = await bcrypt.hash(newPassword, 10);
    // user.passwordResetToken = null;
    // user.passwordResetExpires = null;
    // await user.save();

    res.status(200).json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset Password Error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get current user
export const getCurrentUser = async (req, res) => {
  try {
    // The authMiddleware already validates the token and adds the user to req.user
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      id: user._id,
      email: user.email,
      role: user.role,
      name: user.name,
      phone: user.phone
    });
  } catch (error) {
    console.error('Get Current User Error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};
