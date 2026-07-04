import mongoose from 'mongoose';

const dutySchema = new mongoose.Schema({
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  task: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['assigned', 'completed', 'cancelled'],
    default: 'assigned'
  }
}, { _id: false });

const volunteerSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  skills: {
    type: [String],
    default: []
  },
  availability: {
    type: [String],
    default: [] // e.g., ['Weekends', 'Morning', 'Evening']
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  dutiesAssigned: [dutySchema]
}, { timestamps: true });

const Volunteer = mongoose.model('Volunteer', volunteerSchema);
export default Volunteer;
