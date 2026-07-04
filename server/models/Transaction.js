import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  donationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Donation',
    default: null
  },
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PoojaBooking',
    default: null
  },
  membershipId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Membership',
    default: null
  },
  amount: {
    type: Number,
    required: true
  },
  gateway: {
    type: String,
    enum: ['Razorpay', 'UPI', 'QR'],
    default: 'Razorpay'
  },
  razorpayOrderId: {
    type: String,
    index: true
  },
  razorpayPaymentId: {
    type: String,
    unique: true,
    sparse: true,
    index: true
  },
  razorpaySignature: {
    type: String
  },
  status: {
    type: String,
    enum: ['pending', 'success', 'failed'],
    default: 'pending'
  },
  rawResponse: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  }
}, { timestamps: true });

const Transaction = mongoose.model('Transaction', transactionSchema);
export default Transaction;
