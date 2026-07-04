import mongoose from 'mongoose';

const poojaBookingSchema = new mongoose.Schema({
  devoteeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  slotId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PoojaSlot',
    required: true
  },
  devoteeName: {
    type: String,
    required: true
  },
  gotra: {
    type: String,
    default: ''
  },
  nakshatra: {
    type: String,
    default: ''
  },
  amountPaid: {
    type: Number,
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  bookingStatus: {
    type: String,
    enum: ['confirmed', 'cancelled', 'rescheduled'],
    default: 'confirmed'
  },
  razorpayPaymentId: {
    type: String,
    default: null
  }
}, { timestamps: true });

const PoojaBooking = mongoose.model('PoojaBooking', poojaBookingSchema);
export default PoojaBooking;
