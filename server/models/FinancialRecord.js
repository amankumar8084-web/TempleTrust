import mongoose from 'mongoose';

const financialRecordSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['Donation', 'Revenue', 'Expenditure'],
        required: [true, 'Transaction type is required']
    },
    amount: {
        type: Number,
        required: [true, 'Amount is required'],
        min: [0, 'Amount cannot be negative']
    },
    date: {
        type: Date,
        required: [true, 'Transaction date is required'],
        default: Date.now
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        trim: true
    },
    paymentMethod: {
        type: String,
        enum: ['Cash', 'UPI', 'Bank', 'Cheque', 'Online', 'Other'],
        default: 'Cash'
    },
    personOrOrg: {
        type: String,
        trim: true,
        default: ''
    },
    referenceNo: {
        type: String,
        trim: true,
        default: ''
    },
    description: {
        type: String,
        trim: true,
        default: ''
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, { timestamps: true });

financialRecordSchema.index({ type: 1, date: -1 });
financialRecordSchema.index({ category: 1 });
financialRecordSchema.index({ date: -1 });

const FinancialRecord = mongoose.model('FinancialRecord', financialRecordSchema);
export default FinancialRecord;
