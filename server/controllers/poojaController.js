import PoojaSlot from '../models/PoojaSlot.js';
import PoojaBooking from '../models/PoojaBooking.js';
import Transaction from '../models/Transaction.js';
import AuditLog from '../models/AuditLog.js';
import { createRazorpayOrder, verifyRazorpaySignature } from '../config/razorpay.js';
import { sendEmail } from '../services/emailService.js';
import { BadRequestError, NotFoundError } from '../utils/customErrors.js';

// Get slots for a specific date, auto-generating defaults if empty to facilitate testing
export const getPoojaSlots = async (req, res, next) => {
  try {
    const { date } = req.query;
    if (!date) {
      return next(new BadRequestError('Date parameter is required.'));
    }

    const queryDate = new Date(date);
    queryDate.setHours(0, 0, 0, 0);
    const endDate = new Date(queryDate);
    endDate.setDate(endDate.getDate() + 1);

    let slots = await PoojaSlot.find({
      date: {
        $gte: queryDate,
        $lt: endDate
      }
    });

    // If no slots exist, seed some defaults for this date
    if (slots.length === 0) {
      const defaultSlots = [
        { poojaType: 'Archana', startTime: '07:00 AM', endTime: '08:00 AM', maxCapacity: 20, price: 101 },
        { poojaType: 'Abhishekam', startTime: '08:30 AM', endTime: '09:30 AM', maxCapacity: 10, price: 251 },
        { poojaType: 'Rudrabhishekam', startTime: '10:00 AM', endTime: '11:30 AM', maxCapacity: 5, price: 501 },
        { poojaType: 'Satyanarayan Pooja', startTime: '04:00 PM', endTime: '05:30 PM', maxCapacity: 15, price: 351 },
        { poojaType: 'Special Festival Pooja', startTime: '06:00 PM', endTime: '07:30 PM', maxCapacity: 30, price: 1001 }
      ].map(s => ({
        ...s,
        date: queryDate,
        bookedCount: 0
      }));

      slots = await PoojaSlot.insertMany(defaultSlots);
    }

    res.status(200).json({
      status: 'success',
      data: slots
    });
  } catch (error) {
    next(error);
  }
};

export const bookPooja = async (req, res, next) => {
  try {
    const { slotId, devoteeName, gotra, nakshatra } = req.body;
    const devoteeId = req.user._id;

    const slot = await PoojaSlot.findById(slotId);
    if (!slot) {
      return next(new NotFoundError('Pooja slot not found.'));
    }

    if (slot.bookedCount >= slot.maxCapacity) {
      return next(new BadRequestError('Selected slot is fully booked.'));
    }

    // 1. Create Booking Record
    const booking = await PoojaBooking.create({
      devoteeId,
      slotId,
      devoteeName,
      gotra,
      nakshatra,
      amountPaid: slot.price,
      paymentStatus: 'pending',
      bookingStatus: 'confirmed'
    });

    // 2. Generate Razorpay Order
    const order = await createRazorpayOrder(slot.price);

    // 3. Create Transaction Record
    await Transaction.create({
      bookingId: booking._id,
      amount: slot.price,
      gateway: 'Razorpay',
      razorpayOrderId: order.id,
      status: 'pending'
    });

    res.status(200).json({
      status: 'success',
      data: {
        bookingId: booking._id,
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        key: process.env.RAZORPAY_KEY_ID || 'rzp_test_mockkeyid123'
      }
    });
  } catch (error) {
    next(error);
  }
};

export const verifyBookingPayment = async (req, res, next) => {
  try {
    const { bookingId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    const transaction = await Transaction.findOne({ razorpayOrderId }).populate('bookingId');
    if (!transaction) {
      return next(new NotFoundError('Transaction record not found.'));
    }

    const isValid = verifyRazorpaySignature(razorpayOrderId, razorpayPaymentId, razorpaySignature);
    if (!isValid) {
      transaction.status = 'failed';
      await transaction.save();
      return next(new BadRequestError('Payment signature verification failed.'));
    }

    // Update Transaction
    transaction.status = 'success';
    transaction.razorpayPaymentId = razorpayPaymentId;
    transaction.razorpaySignature = razorpaySignature;
    await transaction.save();

    // Update Booking
    const booking = await PoojaBooking.findById(bookingId).populate('slotId');
    if (!booking) {
      return next(new NotFoundError('Associated booking record not found.'));
    }

    booking.paymentStatus = 'paid';
    booking.razorpayPaymentId = razorpayPaymentId;
    await booking.save();

    // Increment booked count on slot
    const slot = booking.slotId;
    slot.bookedCount += 1;
    await slot.save();

    // Audit log
    await AuditLog.create({
      userId: booking.devoteeId,
      action: 'POOJA_BOOKING_SUCCESS',
      details: `Pooja booking success for slot ID ${slot._id} by devotee ${booking.devoteeName}`,
      ipAddress: req.ip
    });

    // Send confirmation email
    try {
      await sendEmail({
        to: req.user.email,
        subject: `Pooja Booking Confirmed - BrahamBaba Temple`,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; color: #1f2937;">
            <h2 style="color: #d97706;">Namaste ${booking.devoteeName},</h2>
            <p>Your booking for <strong>${slot.poojaType}</strong> is confirmed!</p>
            <div style="background-color: #fef3c7; padding: 15px; border-radius: 6px; margin: 20px 0; color: #b45309;">
              <strong>Date:</strong> ${new Date(slot.date).toLocaleDateString()}<br>
              <strong>Time:</strong> ${slot.startTime} - ${slot.endTime}<br>
              <strong>Gotra:</strong> ${booking.gotra || 'N/A'}<br>
              <strong>Nakshatra:</strong> ${booking.nakshatra || 'N/A'}<br>
              <strong>Amount Paid:</strong> Rs. ${booking.amountPaid}
            </div>
            <p>Please arrive at the temple 15 minutes before the scheduled time. Bring a copy of this email confirmation.</p>
          </div>
        `
      });
    } catch (mailError) {
      console.error('Mail notification failed:', mailError.message);
    }

    res.status(200).json({
      status: 'success',
      message: 'Pooja booking confirmed successfully.',
      booking
    });
  } catch (error) {
    next(error);
  }
};

export const getMyBookings = async (req, res, next) => {
  try {
    const bookings = await PoojaBooking.find({ devoteeId: req.user._id })
      .populate('slotId')
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      data: bookings
    });
  } catch (error) {
    next(error);
  }
};

// Admin Operations
export const adminGetBookings = async (req, res, next) => {
  try {
    const bookings = await PoojaBooking.find()
      .populate('slotId')
      .populate({ path: 'devoteeId', select: 'name email phone' })
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      data: bookings
    });
  } catch (error) {
    next(error);
  }
};

export const adminCreateSlot = async (req, res, next) => {
  try {
    const { poojaType, date, startTime, endTime, maxCapacity, price } = req.body;

    const slot = await PoojaSlot.create({
      poojaType,
      date: new Date(date),
      startTime,
      endTime,
      maxCapacity,
      price
    });

    res.status(201).json({
      status: 'success',
      data: slot
    });
  } catch (error) {
    next(error);
  }
};

export const adminRescheduleBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { newSlotId } = req.body;

    const booking = await PoojaBooking.findById(id);
    if (!booking) {
      return next(new NotFoundError('Booking not found.'));
    }

    const oldSlot = await PoojaSlot.findById(booking.slotId);
    const newSlot = await PoojaSlot.findById(newSlotId);

    if (!newSlot) {
      return next(new NotFoundError('New slot not found.'));
    }

    if (newSlot.bookedCount >= newSlot.maxCapacity) {
      return next(new BadRequestError('Target slot is fully booked.'));
    }

    // Decrement old slot count
    if (oldSlot && oldSlot.bookedCount > 0) {
      oldSlot.bookedCount -= 1;
      await oldSlot.save();
    }

    // Increment new slot count
    newSlot.bookedCount += 1;
    await newSlot.save();

    booking.slotId = newSlotId;
    booking.bookingStatus = 'rescheduled';
    await booking.save();

    res.status(200).json({
      status: 'success',
      message: 'Booking rescheduled successfully.',
      booking
    });
  } catch (error) {
    next(error);
  }
};

export const adminCancelBooking = async (req, res, next) => {
  try {
    const { id } = req.params;

    const booking = await PoojaBooking.findById(id).populate('slotId');
    if (!booking) {
      return next(new NotFoundError('Booking not found.'));
    }

    booking.bookingStatus = 'cancelled';
    await booking.save();

    const slot = booking.slotId;
    if (slot && slot.bookedCount > 0) {
      slot.bookedCount -= 1;
      await slot.save();
    }

    res.status(200).json({
      status: 'success',
      message: 'Booking cancelled successfully.'
    });
  } catch (error) {
    next(error);
  }
};
