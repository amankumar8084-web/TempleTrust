import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true,
    index: true
  },
  time: {
    type: String,
    required: true
  },
  venue: {
    type: String,
    required: true
  },
  registrationLimit: {
    type: Number,
    required: true,
    default: 100
  },
  registeredCount: {
    type: Number,
    required: true,
    default: 0
  },
  fees: {
    type: Number,
    required: true,
    default: 0 // 0 means free event
  },
  bannerImage: {
    type: String,
    default: 'https://images.unsplash.com/photo-1609137144814-7fa2536fae7c?w=800&auto=format&fit=crop&q=60'
  },
  volunteersAssigned: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, { timestamps: true });

const Event = mongoose.model('Event', eventSchema);
export default Event;
