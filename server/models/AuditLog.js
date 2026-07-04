import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  action: {
    type: String,
    required: true,
    index: true // e.g., 'USER_REGISTER', 'DONATION_SUCCESS', 'ROLE_UPDATE'
  },
  details: {
    type: String,
    required: true
  },
  ipAddress: {
    type: String,
    default: ''
  }
}, { timestamps: true });

const AuditLog = mongoose.model('AuditLog', auditLogSchema);
export default AuditLog;
