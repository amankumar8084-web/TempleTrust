import mongoose from 'mongoose';

const eventRegistrationSchema = new mongoose.Schema({
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['registered', 'cancelled', 'attended'],
    default: 'registered'
  },
  paymentStatus: {
    type: String,
    enum: ['free', 'pending', 'paid'],
    default: 'free'
  }
}, { timestamps: true });

// Ensure a user can only register once per event
eventRegistrationSchema.index({ eventId: 1, userId: 1 }, { unique: true });

const EventRegistration = mongoose.model('EventRegistration', eventRegistrationSchema);
export default EventRegistration;
