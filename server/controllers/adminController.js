import User from '../models/User.js';
import Role from '../models/Role.js';
import Donation from '../models/Donation.js';
import PoojaBooking from '../models/PoojaBooking.js';
import Volunteer from '../models/Volunteer.js';
import Membership from '../models/Membership.js';
import AuditLog from '../models/AuditLog.js';
import ContactMessage from '../models/ContactMessage.js';
import Settings from '../models/Settings.js';
import TempleInfo from '../models/TempleInfo.js';
import { BadRequestError, NotFoundError } from '../utils/customErrors.js';

export const getDashboardStats = async (req, res, next) => {
  try {
    // 1. Total donations
    const totalDonationsArray = await Donation.aggregate([
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalDonations = totalDonationsArray[0]?.total || 0;

    // 2. Monthly Revenue
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const monthlyDonations = await Donation.aggregate([
      { $match: { createdAt: { $gte: startOfMonth } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const monthlyBookings = await PoojaBooking.aggregate([
      { $match: { createdAt: { $gte: startOfMonth }, paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$amountPaid' } } }
    ]);

    const monthlyMemberships = await Membership.aggregate([
      { $match: { createdAt: { $gte: startOfMonth }, status: 'active' } },
      { $group: { _id: null, total: { $sum: '$amountPaid' } } }
    ]);

    const monthlyRevenue = (monthlyDonations[0]?.total || 0) + 
                            (monthlyBookings[0]?.total || 0) + 
                            (monthlyMemberships[0]?.total || 0);

    // 3. Devotee Count
    const devoteeRole = await Role.findOne({ name: 'Devotee' });
    const devoteeCount = devoteeRole ? await User.countDocuments({ role: devoteeRole._id }) : 0;

    // 4. Bookings count
    const totalBookings = await PoojaBooking.countDocuments({ paymentStatus: 'paid' });

    // 5. Volunteers
    const volunteersCount = await Volunteer.countDocuments({ status: 'approved' });
    const pendingVolunteers = await Volunteer.countDocuments({ status: 'pending' });

    // 6. Active Memberships
    const activeMemberships = await Membership.countDocuments({ status: 'active' });
    const pendingMemberships = await Membership.countDocuments({ status: 'pending' });

    // 7. Monthly analytics data for chart
    const monthlyAnalytics = await Donation.aggregate([
      {
        $group: {
          _id: { $month: '$createdAt' },
          amount: { $sum: '$amount' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const chartData = monthlyAnalytics.map(item => ({
      name: months[item._id - 1] || 'Unknown',
      amount: item.amount
    }));

    res.status(200).json({
      status: 'success',
      data: {
        totalDonations,
        monthlyRevenue,
        devoteeCount,
        totalBookings,
        volunteersCount,
        activeMemberships,
        pendingVolunteers,
        pendingMemberships,
        chartData
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getUsers = async (req, res, next) => {
  try {
    const users = await User.find().populate('role').sort({ createdAt: -1 });
    res.status(200).json({
      status: 'success',
      data: users
    });
  } catch (error) {
    next(error);
  }
};

export const updateUserRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { roleId } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return next(new NotFoundError('User not found.'));
    }

    const role = await Role.findById(roleId);
    if (!role) {
      return next(new NotFoundError('Role not found.'));
    }

    user.role = roleId;
    await user.save();

    await AuditLog.create({
      userId: req.user._id,
      action: 'ROLE_UPDATE',
      details: `Updated role of user ${user.email} to ${role.name}`,
      ipAddress: req.ip
    });

    res.status(200).json({
      status: 'success',
      message: 'User role updated successfully.',
      data: user
    });
  } catch (error) {
    next(error);
  }
};

export const getAuditLogs = async (req, res, next) => {
  try {
    const logs = await AuditLog.find()
      .populate({ path: 'userId', select: 'name email' })
      .sort({ createdAt: -1 })
      .limit(100);

    res.status(200).json({
      status: 'success',
      data: logs
    });
  } catch (error) {
    next(error);
  }
};

export const getContactMessages = async (req, res, next) => {
  try {
    const messages = await ContactMessage.find().sort({ createdAt: -1 });
    res.status(200).json({
      status: 'success',
      data: messages
    });
  } catch (error) {
    next(error);
  }
};

export const submitContactMessage = async (req, res, next) => {
  try {
    const { name, email, phone, message } = req.body;
    if (!name || !email || !message) {
      return next(new BadRequestError('Name, email, and message are required.'));
    }

    const msg = await ContactMessage.create({ name, email, phone, message });

    res.status(201).json({
      status: 'success',
      message: 'Message sent successfully. We will contact you soon.',
      data: msg
    });
  } catch (error) {
    next(error);
  }
};

export const replyContactMessage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const msg = await ContactMessage.findById(id);
    if (!msg) {
      return next(new NotFoundError('Message not found.'));
    }

    msg.status = 'replied';
    await msg.save();

    res.status(200).json({
      status: 'success',
      message: 'Message marked as resolved/replied.',
      data: msg
    });
  } catch (error) {
    next(error);
  }
};

export const getSystemSettings = async (req, res, next) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
    }
    res.status(200).json({
      status: 'success',
      data: settings
    });
  } catch (error) {
    next(error);
  }
};

export const updateSystemSettings = async (req, res, next) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings();
    }

    Object.assign(settings, req.body);
    await settings.save();

    res.status(200).json({
      status: 'success',
      data: settings
    });
  } catch (error) {
    next(error);
  }
};

export const getTempleContent = async (req, res, next) => {
  try {
    let content = await TempleInfo.findOne();
    if (!content) {
      content = await TempleInfo.create({});
    }
    res.status(200).json({
      status: 'success',
      data: content
    });
  } catch (error) {
    next(error);
  }
};

export const updateTempleContent = async (req, res, next) => {
  try {
    let content = await TempleInfo.findOne();
    if (!content) {
      content = new TempleInfo();
    }

    Object.assign(content, req.body);
    await content.save();

    res.status(200).json({
      status: 'success',
      data: content
    });
  } catch (error) {
    next(error);
  }
};

export const getRoles = async (req, res, next) => {
  try {
    const roles = await Role.find();
    res.status(200).json({
      status: 'success',
      data: roles
    });
  } catch (error) {
    next(error);
  }
};

export const getFinancials = async (req, res, next) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
    }
    res.status(200).json({
      status: 'success',
      data: {
        totalFundsComing: settings.totalFundsComing || 0,
        totalExpenses: settings.totalExpenses || 0
      }
    });
  } catch (error) {
    next(error);
  }
};

