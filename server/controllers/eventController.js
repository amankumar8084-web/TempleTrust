import Event from '../models/Event.js';
import EventRegistration from '../models/EventRegistration.js';
import User from '../models/User.js';
import { BadRequestError, NotFoundError } from '../utils/customErrors.js';

export const getEvents = async (req, res, next) => {
  try {
    const events = await Event.find().sort({ date: 1 });
    res.status(200).json({
      status: 'success',
      data: events
    });
  } catch (error) {
    next(error);
  }
};

export const registerForEvent = async (req, res, next) => {
  try {
    const { eventId } = req.body;
    const userId = req.user._id;

    const event = await Event.findById(eventId);
    if (!event) {
      return next(new NotFoundError('Event not found.'));
    }

    if (event.registeredCount >= event.registrationLimit) {
      return next(new BadRequestError('Event registration limit reached.'));
    }

    // Check duplicate registration
    const existingRegistration = await EventRegistration.findOne({ eventId, userId });
    if (existingRegistration) {
      return next(new BadRequestError('You are already registered for this event.'));
    }

    const registration = await EventRegistration.create({
      eventId,
      userId,
      status: 'registered',
      paymentStatus: event.fees > 0 ? 'pending' : 'free'
    });

    event.registeredCount += 1;
    await event.save();

    res.status(201).json({
      status: 'success',
      data: registration
    });
  } catch (error) {
    next(error);
  }
};

export const getMyEvents = async (req, res, next) => {
  try {
    const registrations = await EventRegistration.find({ userId: req.user._id })
      .populate('eventId')
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      data: registrations
    });
  } catch (error) {
    next(error);
  }
};

// Admin operations
export const adminCreateEvent = async (req, res, next) => {
  try {
    const { title, description, date, time, venue, registrationLimit, fees, bannerImage } = req.body;

    const event = await Event.create({
      title,
      description,
      date: new Date(date),
      time,
      venue,
      registrationLimit,
      fees,
      bannerImage
    });

    res.status(201).json({
      status: 'success',
      data: event
    });
  } catch (error) {
    next(error);
  }
};

export const adminUpdateEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const event = await Event.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    if (!event) {
      return next(new NotFoundError('Event not found.'));
    }
    res.status(200).json({
      status: 'success',
      data: event
    });
  } catch (error) {
    next(error);
  }
};

export const adminDeleteEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const event = await Event.findByIdAndDelete(id);
    if (!event) {
      return next(new NotFoundError('Event not found.'));
    }
    res.status(200).json({
      status: 'success',
      message: 'Event deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};

export const adminAssignVolunteer = async (req, res, next) => {
  try {
    const { eventId, volunteerUserId } = req.body;

    const event = await Event.findById(eventId);
    if (!event) {
      return next(new NotFoundError('Event not found.'));
    }

    const volunteerUser = await User.findById(volunteerUserId).populate('role');
    if (!volunteerUser || (volunteerUser.role.name !== 'Volunteer' && volunteerUser.role.name !== 'Staff' && volunteerUser.role.name !== 'Admin' && volunteerUser.role.name !== 'Super Admin')) {
      return next(new BadRequestError('Selected user is not registered as a volunteer.'));
    }

    if (event.volunteersAssigned.includes(volunteerUserId)) {
      return next(new BadRequestError('Volunteer is already assigned to this event.'));
    }

    event.volunteersAssigned.push(volunteerUserId);
    await event.save();

    res.status(200).json({
      status: 'success',
      message: 'Volunteer assigned successfully.',
      data: event
    });
  } catch (error) {
    next(error);
  }
};
