import DutyOrder from '../models/DutyOrder.js';
import mongoose from 'mongoose';

// Total duties by status
export const getDutySummary = async (req, res) => {
  try {
    const summary = await DutyOrder.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);
    res.json(summary);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Duties per month for last 6 months
export const getMonthlyDutyStats = async (req, res) => {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);

  try {
    const monthlyStats = await DutyOrder.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          total: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    res.json(monthlyStats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Top staff with most duties
export const getTopStaff = async (req, res) => {
  try {
    const topStaff = await DutyOrder.aggregate([
      { $group: { _id: "$staff_id", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "staff"
        }
      },
      { $unwind: "$staff" },
      {
        $project: {
          name: "$staff.name",
          email: "$staff.email",
          count: 1
        }
      }
    ]);
    res.json(topStaff);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Status-wise count per day for line chart
export const getStatusTrends = async (req, res) => {
  try {
    const trends = await DutyOrder.aggregate([
      {
        $group: {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            status: "$status"
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.date": 1 } }
    ]);
    res.json(trends);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Count of duties created per creator
export const getCreatorStats = async (req, res) => {
  try {
    const creators = await DutyOrder.aggregate([
      { $group: { _id: "$created_by", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "creator"
        }
      },
      { $unwind: "$creator" },
      {
        $project: {
          name: "$creator.name",
          count: 1
        }
      }
    ]);
    res.json(creators);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
