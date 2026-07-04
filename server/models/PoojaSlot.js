import mongoose from 'mongoose';

const poojaSlotSchema = new mongoose.Schema({
  poojaType: {
    type: String,
    required: true,
    enum: ['Archana', 'Abhishekam', 'Rudrabhishekam', 'Satyanarayan Pooja', 'Special Festival Pooja']
  },
  date: {
    type: Date,
    required: true,
    index: true
  },
  startTime: {
    type: String,
    required: true // e.g., '08:00 AM'
  },
  endTime: {
    type: String,
    required: true // e.g., '09:00 AM'
  },
  maxCapacity: {
    type: Number,
    required: true,
    default: 10
  },
  bookedCount: {
    type: Number,
    required: true,
    default: 0
  },
  price: {
    type: Number,
    required: true,
    min: 0
  }
}, { timestamps: true });

const PoojaSlot = mongoose.model('PoojaSlot', poojaSlotSchema);
export default PoojaSlot;
