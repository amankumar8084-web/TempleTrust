import Volunteer from '../models/Volunteer.js';
import User from '../models/User.js';
import Role from '../models/Role.js';
import AuditLog from '../models/AuditLog.js';
import { BadRequestError, NotFoundError } from '../utils/customErrors.js';

export const registerAsVolunteer = async (req, res, next) => {
  try {
    const { skills, availability } = req.body;
    const userId = req.user._id;

    const existingVolunteer = await Volunteer.findOne({ userId });
    if (existingVolunteer) {
      return next(new BadRequestError('You have already applied or registered as a volunteer.'));
    }

    const volunteer = await Volunteer.create({
      userId,
      skills: skills || [],
      availability: availability || [],
      status: 'pending'
    });

    res.status(201).json({
      status: 'success',
      message: 'Volunteer registration submitted successfully. Pending Admin review.',
      data: volunteer
    });
  } catch (error) {
    next(error);
  }
};

export const getVolunteerProfile = async (req, res, next) => {
  try {
    const volunteer = await Volunteer.findOne({ userId: req.user._id })
      .populate({ path: 'dutiesAssigned.eventId', select: 'title date time venue' });

    if (!volunteer) {
      return next(new NotFoundError('Volunteer profile not found.'));
    }

    res.status(200).json({
      status: 'success',
      data: volunteer
    });
  } catch (error) {
    next(error);
  }
};

// Admin Operations
export const adminGetVolunteers = async (req, res, next) => {
  try {
    const volunteers = await Volunteer.find()
      .populate({ path: 'userId', select: 'name email phone status' })
      .populate({ path: 'dutiesAssigned.eventId', select: 'title date' })
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      data: volunteers
    });
  } catch (error) {
    next(error);
  }
};

export const adminApproveVolunteer = async (req, res, next) => {
  try {
    const { id } = req.params; // Volunteer ID
    const { status } = req.body; // 'approved' or 'rejected'

    if (!['approved', 'rejected'].includes(status)) {
      return next(new BadRequestError('Invalid approval status.'));
    }

    const volunteer = await Volunteer.findById(id);
    if (!volunteer) {
      return next(new NotFoundError('Volunteer application not found.'));
    }

    volunteer.status = status;
    await volunteer.save();

    if (status === 'approved') {
      // Elevate User Role to 'Volunteer'
      const volunteerRole = await Role.findOne({ name: 'Volunteer' });
      if (volunteerRole) {
        await User.findByIdAndUpdate(volunteer.userId, { role: volunteerRole._id });
      }

      await AuditLog.create({
        userId: req.user._id,
        action: 'VOLUNTEER_APPROVED',
        details: `Approved volunteer user ID: ${volunteer.userId}`,
        ipAddress: req.ip
      });
    }

    res.status(200).json({
      status: 'success',
      message: `Volunteer application has been ${status}.`,
      data: volunteer
    });
  } catch (error) {
    next(error);
  }
};

export const adminAssignDuty = async (req, res, next) => {
  try {
    const { volunteerId, eventId, task } = req.body;

    const volunteer = await Volunteer.findById(volunteerId);
    if (!volunteer) {
      return next(new NotFoundError('Volunteer not found.'));
    }

    // Add task duty
    volunteer.dutiesAssigned.push({
      eventId,
      task,
      status: 'assigned'
    });

    await volunteer.save();

    res.status(200).json({
      status: 'success',
      message: 'Duty assigned to volunteer successfully.',
      data: volunteer
    });
  } catch (error) {
    next(error);
  }
};
