import Donation from '../models/Donation.js';
import Transaction from '../models/Transaction.js';
import Receipt from '../models/Receipt.js';
import AuditLog from '../models/AuditLog.js';
import { createRazorpayOrder, verifyRazorpaySignature } from '../config/razorpay.js';
import { generateDonationReceiptPDF } from '../services/pdfService.js';
import { exportDonationsToExcel } from '../services/excelService.js';
import { sendEmail } from '../services/emailService.js';
import { BadRequestError, NotFoundError, ForbiddenError } from '../utils/customErrors.js';

export const initializeDonation = async (req, res, next) => {
  try {
    const { amount, category, donorName, donorEmail, donorPhone, panCard, anonymous } = req.body;
    const devoteeId = req.user ? req.user._id : null;

    // 1. Create Donation Record
    const donation = await Donation.create({
      devoteeId,
      donorName,
      donorEmail,
      donorPhone,
      amount,
      category,
      panCard,
      anonymous
    });

    // 2. Generate Razorpay Order
    const order = await createRazorpayOrder(amount);

    // 3. Create Transaction Record
    await Transaction.create({
      donationId: donation._id,
      amount,
      gateway: 'Razorpay',
      razorpayOrderId: order.id,
      status: 'pending'
    });

    res.status(200).json({
      status: 'success',
      data: {
        donationId: donation._id,
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        key: process.env.RAZORPAY_KEY_ID || 'rzp_test_mockkeyid123'
      }
    });
  } catch (error) {
    next(error);
  }
};

export const verifyDonation = async (req, res, next) => {
  try {
    const { donationId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    const transaction = await Transaction.findOne({ razorpayOrderId }).populate('donationId');
    if (!transaction) {
      return next(new NotFoundError('Transaction not found.'));
    }

    // Verify signature
    const isValid = verifyRazorpaySignature(razorpayOrderId, razorpayPaymentId, razorpaySignature);
    if (!isValid) {
      transaction.status = 'failed';
      await transaction.save();
      return next(new BadRequestError('Payment signature verification failed.'));
    }

    // Update Transaction
    transaction.status = 'success';
    transaction.razorpayPaymentId = razorpayPaymentId;
    transaction.razorpaySignature = razorpaySignature;
    await transaction.save();

    const donation = await Donation.findById(donationId);
    if (!donation) {
      return next(new NotFoundError('Associated donation record not found.'));
    }

    // Generate unique receipt number
    const count = await Receipt.countDocuments();
    const receiptNumber = `TX-${new Date().getFullYear()}-${String(count + 1).padStart(5, '0')}`;

    // Generate PDF receipt buffer
    const pdfBuffer = await generateDonationReceiptPDF(donation, transaction, receiptNumber);

    // Simulated cloud upload or mock URL
    const pdfUrl = `/api/v1/donations/receipt/${donation._id}/file`;

    // Create receipt
    await Receipt.create({
      donationId: donation._id,
      receiptNumber,
      pdfUrl
    });

    donation.isTaxReceiptGenerated = true;
    await donation.save();

    // Audit log
    await AuditLog.create({
      userId: donation.devoteeId,
      action: 'DONATION_SUCCESS',
      details: `Successful donation of Rs. ${donation.amount} by ${donation.donorEmail}`,
      ipAddress: req.ip
    });

    // Send confirmation email with PDF attachment
    try {
      await sendEmail({
        to: donation.donorEmail,
        subject: `Thank you for your donation to BrahamBaba Trust - ${receiptNumber}`,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; line-height: 1.6; color: #1f2937;">
            <h2 style="color: #d97706;">Namaste ${donation.donorName},</h2>
            <p>We are deeply grateful for your generous donation of <strong>Rs. ${donation.amount}</strong> towards the <strong>${donation.category}</strong> fund.</p>
            <p>Your contribution helps us sustain the daily Pujas, maintain the shrine, and support our community programs like Annadanam (free meals).</p>
            <p>Your official tax-exemption receipt <strong>${receiptNumber}</strong> is attached to this email. You can also download it at any time from your dashboard.</p>
            <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 20px 0;">
            <p style="font-size: 12px; color: #6b7280;">BrahamBaba Devotee Trust | Registered 80G Charity</p>
          </div>
        `,
        attachments: [
          {
            filename: `${receiptNumber}.pdf`,
            content: pdfBuffer
          }
        ]
      });
    } catch (mailError) {
      console.error('Mail notification failed:', mailError.message);
    }

    res.status(200).json({
      status: 'success',
      message: 'Donation processed and verified successfully.',
      receiptNumber
    });
  } catch (error) {
    next(error);
  }
};

export const getMyDonations = async (req, res, next) => {
  try {
    const donations = await Donation.find({ devoteeId: req.user._id })
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      data: donations
    });
  } catch (error) {
    next(error);
  }
};

export const downloadReceiptFile = async (req, res, next) => {
  try {
    const { id } = req.params;
    const donation = await Donation.findById(id);
    if (!donation) {
      return next(new NotFoundError('Donation not found.'));
    }

    // Restrict access to owner or Admin/Trustees
    if (donation.devoteeId && req.user && req.user.role.name !== 'Admin' && req.user.role.name !== 'Super Admin' && req.user.role.name !== 'Trustee') {
      if (donation.devoteeId.toString() !== req.user._id.toString()) {
        return next(new ForbiddenError('You are not authorized to download this receipt.'));
      }
    }

    const transaction = await Transaction.findOne({ donationId: donation._id, status: 'success' });
    const receipt = await Receipt.findOne({ donationId: donation._id });
    const receiptNo = receipt ? receipt.receiptNumber : `TX-${new Date().getFullYear()}-00000`;

    const pdfBuffer = await generateDonationReceiptPDF(donation, transaction, receiptNo);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Receipt-${receiptNo}.pdf`);
    res.send(pdfBuffer);
  } catch (error) {
    next(error);
  }
};

export const exportDonationReport = async (req, res, next) => {
  try {
    const donations = await Donation.find().sort({ createdAt: -1 });
    const buffer = await exportDonationsToExcel(donations);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=DonationsReport.xlsx');
    res.send(buffer);
  } catch (error) {
    next(error);
  }
};
