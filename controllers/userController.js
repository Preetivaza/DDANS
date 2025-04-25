import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import { sendEmail } from '../utils/sendEmail.js'; 

// Get all users (Admin only)
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, 'name email role phone created_at'); // Exclude sensitive fields like password
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all staff members (Admin/Authority only)
export const getAllStaff = async (req, res) => {
  try {
    const staffMembers = await User.find({ role: 'staff' }, 'name email phone created_at');
    res.status(200).json(staffMembers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a new staff member (Admin only)


// Helper function to generate a random password
const generateRandomPassword = (length = 10) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

// Create a new staff member (Admin only)
export const createStaff = async (req, res) => {
  try {
    const { name, email, phone } = req.body;

    // Validate required fields
    if (!name || !email) {
      return res.status(400).json({ message: 'Name and email are required' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Generate random password
    const generatedPassword = generateRandomPassword();
    const hashedPassword = await bcrypt.hash(generatedPassword, 10);

    // Create user
    const staff = new User({
      name,
      email,
      password:generatedPassword ,
      role: 'staff',
      phone,
    });

    await staff.save();

    // Send welcome email with credentials
    const emailSubject = 'Welcome to Our Platform - Your Account Details';
    const emailText = `
Dear ${name},

Your staff account has been created successfully. Below are your login details:

Email: ${email}
Password: ${generatedPassword}

You can access the platform at: ${process.env.FRONTEND_URL}

Please log in and change your password immediately for security reasons.

Regards,  
The Management Team
`;

    await sendEmail(email, emailSubject, emailText);

    res.status(201).json({ message: 'Staff member created successfully', staff });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};







// Update user details (Admin only)
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, phone } = req.body;

    // Validate input
    if (!name || !email || !role) {
      return res.status(400).json({ message: 'Name, email, and role are required' });
    }

    // Find the user
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update user details
    user.name = name;
    user.email = email;
    user.role = role;
    user.phone = phone || user.phone; // Optional field

    await user.save();

    res.status(200).json({ message: 'User updated successfully', user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete user (Admin only)
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Find and delete the user
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};