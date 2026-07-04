import mongoose from 'mongoose';

const receiptSchema = new mongoose.Schema({
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
  receiptNumber: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  pdfUrl: {
    type: String,
    required: true
  }
}, { timestamps: true });

const Receipt = mongoose.model('Receipt', receiptSchema);
export default Receipt;
