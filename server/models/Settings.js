import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
  smsNotificationEnabled: {
    type: Boolean,
    default: false
  },
  emailNotificationEnabled: {
    type: Boolean,
    default: true
  },
  whatsappNotificationEnabled: {
    type: Boolean,
    default: false
  },
  maintenanceMode: {
    type: Boolean,
    default: false
  },
  aiAssistantFallback: {
    type: Boolean,
    default: true
  },
  announcementAlert: {
    type: String,
    default: ''
  },
  totalFundsComing: {
    type: Number,
    default: 0
  },
  totalExpenses: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

const Settings = mongoose.model('Settings', settingsSchema);
export default Settings;
