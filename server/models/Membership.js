import mongoose from 'mongoose';

const membershipSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  plan: {
    type: String,
    enum: ['Regular', 'Annual', 'Lifetime'],
    required: true
  },
  amountPaid: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'expired', 'suspended'],
    default: 'pending'
  },
  startDate: {
    type: Date,
    default: null
  },
  endDate: {
    type: Date,
    default: null // Null for Lifetime memberships
  },
  membershipCardUrl: {
    type: String,
    default: ''
  }
}, { timestamps: true });

const Membership = mongoose.model('Membership', membershipSchema);
export default Membership;
