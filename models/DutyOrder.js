import mongoose from 'mongoose';


// models/DutyOrder.js
const dutyOrderSchema = new mongoose.Schema(
  {
    staff_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Staff ID is required'],
    },
    duty_date: {
      type: Date,
      required: [true, 'Duty date is required'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'cancelled'],
      default: 'pending',
    },
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Created by is required'],
    },
    approved_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    // Optional: for cancellation and rejection details
    cancelled_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    cancellation_reason: String,
    rejected_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    rejection_reason: String,
    signature_file_url: String,
  },
  { timestamps: true }
);

export default mongoose.model('DutyOrder', dutyOrderSchema);