import mongoose from 'mongoose';

const donationSchema = new mongoose.Schema({
  devoteeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  donorName: {
    type: String,
    required: [true, 'Please provide donor name'],
    trim: true
  },
  donorEmail: {
    type: String,
    required: [true, 'Please provide donor email'],
    trim: true,
    lowercase: true
  },
  donorPhone: {
    type: String,
    required: [true, 'Please provide donor phone number'],
    trim: true
  },
  amount: {
    type: Number,
    required: [true, 'Please provide donation amount'],
    min: [1, 'Donation amount must be at least 1']
  },
  category: {
    type: String,
    enum: ['General', 'Annadanam', 'Development', 'Festival', 'Gau Seva', 'Education'],
    default: 'General'
  },
  panCard: {
    type: String,
    trim: true,
    uppercase: true,
    default: ''
  },
  isTaxReceiptGenerated: {
    type: Boolean,
    default: false
  },
  anonymous: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

const Donation = mongoose.model('Donation', donationSchema);
export default Donation;
