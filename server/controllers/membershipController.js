import Membership from '../models/Membership.js';
import Transaction from '../models/Transaction.js';
import AuditLog from '../models/AuditLog.js';
import { createRazorpayOrder, verifyRazorpaySignature } from '../config/razorpay.js';
import { sendEmail } from '../services/emailService.js';
import { BadRequestError, NotFoundError } from '../utils/customErrors.js';

const PLAN_PRICES = {
  Regular: 500,   // Rs. 500
  Annual: 1500,   // Rs. 1500
  Lifetime: 5000  // Rs. 5000
};

export const joinMembership = async (req, res, next) => {
  try {
    const { plan } = req.body;
    const userId = req.user._id;

    if (!PLAN_PRICES[plan]) {
      return next(new BadRequestError('Invalid membership plan selected.'));
    }

    const price = PLAN_PRICES[plan];

    const existingMembership = await Membership.findOne({ userId });
    if (existingMembership && existingMembership.status === 'active') {
      return next(new BadRequestError('You already have an active membership.'));
    }

    // 1. Create or update pending Membership profile
    let membership = await Membership.findOne({ userId });
    if (!membership) {
      membership = await Membership.create({
        userId,
        plan,
        amountPaid: price,
        status: 'pending'
      });
    } else {
      membership.plan = plan;
      membership.amountPaid = price;
      membership.status = 'pending';
      await membership.save();
    }

    // 2. Generate Razorpay order
    const order = await createRazorpayOrder(price);

    // 3. Create Transaction log
    await Transaction.create({
      membershipId: membership._id,
      amount: price,
      gateway: 'Razorpay',
      razorpayOrderId: order.id,
      status: 'pending'
    });

    res.status(200).json({
      status: 'success',
      data: {
        membershipId: membership._id,
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

export const verifyMembershipPayment = async (req, res, next) => {
  try {
    const { membershipId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    const transaction = await Transaction.findOne({ razorpayOrderId }).populate('membershipId');
    if (!transaction) {
      return next(new NotFoundError('Transaction record not found.'));
    }

    const isValid = verifyRazorpaySignature(razorpayOrderId, razorpayPaymentId, razorpaySignature);
    if (!isValid) {
      transaction.status = 'failed';
      await transaction.save();
      return next(new BadRequestError('Payment signature verification failed.'));
    }

    transaction.status = 'success';
    transaction.razorpayPaymentId = razorpayPaymentId;
    transaction.razorpaySignature = razorpaySignature;
    await transaction.save();

    const membership = await Membership.findById(membershipId);
    if (!membership) {
      return next(new NotFoundError('Membership application record not found.'));
    }

    const now = new Date();
    let endDate = null;

    if (membership.plan === 'Regular') {
      endDate = new Date(now);
      endDate.setMonth(endDate.getMonth() + 1); // 1 month
    } else if (membership.plan === 'Annual') {
      endDate = new Date(now);
      endDate.setFullYear(endDate.getFullYear() + 1); // 1 year
    }

    membership.status = 'active';
    membership.startDate = now;
    membership.endDate = endDate;
    
    // Mock a membership card URL using a generic vector styled SVG template placeholder
    membership.membershipCardUrl = `https://api.dicebear.com/7.x/identicon/svg?seed=BrahamBaba-${membership._id}`;
    await membership.save();

    // Audit log
    await AuditLog.create({
      userId: membership.userId,
      action: 'MEMBERSHIP_ACTIVE',
      details: `Membership active: Plan: ${membership.plan} for user ID: ${membership.userId}`,
      ipAddress: req.ip
    });

    // Send confirmation email
    try {
      await sendEmail({
        to: req.user.email,
        subject: `Welcome to BrahamBaba Temple Trust Membership!`,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; color: #1f2937;">
            <h2 style="color: #d97706;">Namaste Devotee,</h2>
            <p>We are delighted to welcome you as a registered member of the <strong>BrahamBaba Devotee Trust</strong>.</p>
            <p>Your membership details:</p>
            <div style="background-color: #fef3c7; padding: 15px; border-radius: 6px; margin: 20px 0; color: #b45309;">
              <strong>Plan Tiers:</strong> ${membership.plan}<br>
              <strong>Start Date:</strong> ${now.toLocaleDateString()}<br>
              <strong>Renewal Date:</strong> ${endDate ? endDate.toLocaleDateString() : 'Lifetime Membership'}<br>
              <strong>Status:</strong> Active
            </div>
            <p>Your support helps us maintain the daily Pujas, charity programs, and expand temple development projects.</p>
          </div>
        `
      });
    } catch (mailError) {
      console.error('Mail notification failed:', mailError.message);
    }

    res.status(200).json({
      status: 'success',
      message: 'Membership activated successfully.',
      membership
    });
  } catch (error) {
    next(error);
  }
};

export const getMembershipStatus = async (req, res, next) => {
  try {
    const membership = await Membership.findOne({ userId: req.user._id });
    if (!membership) {
      return res.status(200).json({
        status: 'success',
        data: null
      });
    }

    res.status(200).json({
      status: 'success',
      data: membership
    });
  } catch (error) {
    next(error);
  }
};

// Admin Operations
export const adminGetMemberships = async (req, res, next) => {
  try {
    const memberships = await Membership.find()
      .populate({ path: 'userId', select: 'name email phone' })
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      data: memberships
    });
  } catch (error) {
    next(error);
  }
};
