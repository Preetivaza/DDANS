import DutyOrder from '../models/DutyOrder.js';
import User from '../models/User.js';
import AuditLog from '../models/AuditLog.js';
import Notification from '../models/Notification.js';

// Get all duties for the logged-in staff member
export const getStaffDuties = async (req, res) => {
  try {
    const staffId = req.user.id;
    
    // Get staff details
    const staff = await User.findById(staffId);
    if (!staff) {
      return res.status(404).json({ message: 'Staff member not found' });
    }

    // Get all duties for the staff
    const duties = await DutyOrder.find({ staff_id: staffId })
      .sort({ duty_date: -1 })
      .populate('staff_id', 'name email')
      .populate('approved_by', 'name email');

    res.status(200).json({
      staff: {
        id: staff._id,
        name: staff.name,
        email: staff.email
      },
      duties
    });
  } catch (error) {
    console.error('Error fetching staff duties:', error);
    res.status(500).json({ message: 'Failed to fetch duties' });
  }
};

// Get duties by staff ID (for admin/authority)
export const getDutiesByStaffId = async (req, res) => {
  try {
    const { id } = req.params;
    const currentUser = req.user;

    // If staff is accessing, they can only view their own duties
    if (currentUser.role === 'staff' && currentUser.id !== id) {
      // Instead of returning an error, redirect to their own duties
      const duties = await DutyOrder.find({ staff_id: currentUser.id })
        .sort({ duty_date: -1 })
        .populate('staff_id', 'name email')
        .populate('approved_by', 'name email');

      const staff = await User.findById(currentUser.id);
      
      return res.status(200).json({
        staff: {
          id: staff._id,
          name: staff.name,
          email: staff.email
        },
        duties
      });
    }

    // Verify if staff exists
    const staff = await User.findById(id);
    if (!staff) {
      return res.status(404).json({ message: 'Staff member not found' });
    }

    // Get all duties for the specified staff
    const duties = await DutyOrder.find({ staff_id: id })
      .sort({ duty_date: -1 })
      .populate('staff_id', 'name email')
      .populate('approved_by', 'name email');

    res.status(200).json({
      staff: {
        id: staff._id,
        name: staff.name,
        email: staff.email
      },
      duties
    });
  } catch (error) {
    console.error('Error fetching duties by staff ID:', error);
    res.status(500).json({ message: 'Failed to fetch duties' });
  }
};

// Get specific duty by ID
export const getStaffDutyById = async (req, res) => {
  try {
    const { id } = req.params;
    const staffId = req.user.id;

    const duty = await DutyOrder.findOne({
      _id: id,
      staff_id: staffId
    })
      .populate('staff_id', 'name email')
      .populate('approved_by', 'name email');

    if (!duty) {
      return res.status(404).json({ message: 'Duty not found' });
    }

    res.status(200).json(duty);
  } catch (error) {
    console.error('Error fetching duty:', error);
    res.status(500).json({ message: 'Failed to fetch duty' });
  }
};

// Mark duty as completed
export const markDutyAsCompleted = async (req, res) => {
  try {
    const { id } = req.params;
    const { progress_report } = req.body;
    const staffId = req.user.id;

    // Find the duty
    const duty = await DutyOrder.findOne({
      _id: id,
      staff_id: staffId
    });

    if (!duty) {
      return res.status(404).json({ message: 'Duty not found' });
    }

    // Update duty status and add progress report
    duty.status = 'completed';
    duty.progress_report = progress_report;
    duty.completed_at = new Date();
    
    await duty.save();

    // Create audit log
    await AuditLog.create({
      action: 'DUTY_COMPLETED',
      user_id: staffId,
      details: {
        duty_id: id,
        progress_report: progress_report
      }
    });

    // Create notification for approver
    if (duty.approved_by) {
      await Notification.create({
        user_id: duty.approved_by,
        type: 'DUTY_COMPLETED',
        message: `Duty has been completed by ${req.user.name}`,
        related_id: id
      });
    }

    res.status(200).json({
      message: 'Duty marked as completed successfully',
      duty
    });
  } catch (error) {
    console.error('Error marking duty as completed:', error);
    res.status(500).json({ message: 'Failed to mark duty as completed' });
  }
};

// Get staff profile
export const getStaffProfile = async (req, res) => {
  try {
    const staffId = req.user.id;
    const profile = await User.findById(staffId)
      .select('-password')
      .populate('department', 'name');

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    res.status(200).json(profile);
  } catch (error) {
    console.error('Error fetching staff profile:', error);
    res.status(500).json({ message: 'Failed to fetch profile' });
  }
};

// Update staff profile
export const updateStaffProfile = async (req, res) => {
  try {
    const staffId = req.user.id;
    const { name, email, phone, department } = req.body;

    const profile = await User.findById(staffId);
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    // Update allowed fields
    if (name) profile.name = name;
    if (email) profile.email = email;
    if (phone) profile.phone = phone;
    if (department) profile.department = department;

    await profile.save();

    // Create audit log
    const auditLog = new AuditLog({
      action: 'Profile Updated',
      performed_by: staffId,
      details: {
        updated_fields: Object.keys(req.body)
      }
    });
    await auditLog.save();

    res.status(200).json({
      message: 'Profile updated successfully',
      profile: {
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
        department: profile.department
      }
    });
  } catch (error) {
    console.error('Error updating staff profile:', error);
    res.status(500).json({ message: 'Failed to update profile' });
  }
}; 