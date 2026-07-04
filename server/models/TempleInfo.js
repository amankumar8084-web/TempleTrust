import mongoose from 'mongoose';

const timingSchema = new mongoose.Schema({
  activity: { type: String, required: true }, // e.g., 'Morning Aarti', 'Temple Opening'
  time: { type: String, required: true }      // e.g., '06:00 AM'
}, { _id: false });

const trusteeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: { type: String, required: true },
  image: { type: String, default: '' },
  description: { type: String, default: '' }
}, { _id: false });

const templeInfoSchema = new mongoose.Schema({
  history: {
    type: String,
    default: 'Welcome to BrahamBaba Temple, a historic spiritual sanctuary.'
  },
  significance: {
    type: String,
    default: 'A sacred shrine of peace and divine presence.'
  },
  architecture: {
    type: String,
    default: 'Constructed using modern Vedic architecture with sandstone carvings.'
  },
  founderDetails: {
    type: String,
    default: 'Established by local devotees and sages in ancient times.'
  },
  mission: {
    type: String,
    default: 'To spread spirituality, peace, and humanitarian services like Annadanam.'
  },
  vision: {
    type: String,
    default: 'To build a global community of service and devotion.'
  },
  trustInformation: {
    type: String,
    default: 'BrahamBaba Trust is a registered non-profit organization managing temple operations.'
  },
  liveDarshanUrl: {
    type: String,
    default: '' // e.g., YouTube embed URL
  },
  address: {
    type: String,
    default: 'BrahamBaba Temple, Near Main Square, Sector 1, City'
  },
  phone: {
    type: String,
    default: '+91-9876543210'
  },
  email: {
    type: String,
    default: 'contact@brahambaba.org'
  },
  timings: [timingSchema],
  trustees: [trusteeSchema]
}, { timestamps: true });

const TempleInfo = mongoose.model('TempleInfo', templeInfoSchema);
export default TempleInfo;
