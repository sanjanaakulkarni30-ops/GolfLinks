import express from 'express';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import Subscription from '../models/Subscription.js';
import { authenticate } from '../middlewares/auth.js';
import {
    createOrder,
    createSubscription,
    createPlan,
    createCustomer,
    cancelSubscription,
    fetchSubscription,
    verifyPaymentSignature,
    verifySubscriptionSignature
} from '../utils/razorpay.js';

const router = express.Router();

const PLAN_AMOUNTS = {
    monthly: 200, // ₹2.00 (in paise)
    yearly: 20000  // ₹200.00 (in paise)
};

// Store created plans in memory (in production, store in database)
let createdPlans = {};

router.post('/create', authenticate, [
    body('plan').isIn(['monthly', 'yearly'])
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { plan } = req.body;
        const user = req.user;

        // Check if user already has an active subscription
        if (user.subscription) {
            // Clear the existing subscription reference to allow new subscription
            user.subscription = null;
            await user.save();
        }

        const amount = PLAN_AMOUNTS[plan];
        const period = plan === 'monthly' ? 'monthly' : 'yearly';
        const interval = 1;

        // Create or get existing plan
        let razorpayPlan;
        if (createdPlans[plan]) {
            razorpayPlan = createdPlans[plan];
        } else {
            razorpayPlan = await createPlan(period, interval, amount);
            createdPlans[plan] = razorpayPlan;
        }

        // Create or get customer - always create a new customer to avoid autopay conflicts
        let razorpayCustomer;
        try {
            razorpayCustomer = await createCustomer(
                `${user.firstName} ${user.lastName}`,
                user.email,
                '9999999999' // Default contact
            );

            // Update user with new customer ID
            user.razorpayCustomerId = razorpayCustomer.id;
            await user.save();
        } catch (error) {
            console.error('Customer creation error:', error);
            return res.status(500).json({ message: 'Failed to create customer' });
        }

        // Create subscription
        let razorpaySubscription;
        try {
            razorpaySubscription = await createSubscription(
                razorpayPlan.id,
                razorpayCustomer.id,
                plan === 'monthly' ? 12 : 1
            );
        } catch (error) {
            console.error('Razorpay subscription creation error:', error);

            // Handle specific Razorpay errors
            if (error.message.includes('autopay') || error.message.includes('already exists')) {
                return res.status(400).json({
                    message: 'A subscription already exists for this plan. Please contact support.'
                });
            }

            return res.status(500).json({
                message: 'Failed to create subscription. Please try again.'
            });
        }

        res.json({
            subscriptionId: razorpaySubscription.id,
            planId: razorpayPlan.id,
            customerId: razorpayCustomer.id,
            amount: amount,
            currency: 'INR'
        });
    } catch (error) {
        console.error('Subscription creation error:', error);
        res.status(500).json({ message: 'Failed to create subscription' });
    }
});

router.post('/verify', authenticate, [
    body('razorpay_payment_id').notEmpty(),
    body('razorpay_subscription_id').notEmpty(),
    body('razorpay_signature').notEmpty(),
    body('plan').isIn(['monthly', 'yearly'])
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const {
            razorpay_payment_id,
            razorpay_subscription_id,
            razorpay_signature,
            plan
        } = req.body;

        // Verify signature
        const isValid = verifySubscriptionSignature(
            razorpay_payment_id,
            razorpay_subscription_id,
            razorpay_signature
        );

        if (!isValid) {
            return res.status(400).json({ message: 'Invalid payment signature' });
        }

        // Fetch subscription details from Razorpay
        const razorpaySubscription = await fetchSubscription(razorpay_subscription_id);

        // Create subscription in database
        const subscription = new Subscription({
            user: req.user._id,
            razorpaySubscriptionId: razorpay_subscription_id,
            razorpayPlanId: razorpaySubscription.plan_id,
            razorpayCustomerId: req.user.razorpayCustomerId,
            plan,
            status: razorpaySubscription.status,
            amount: PLAN_AMOUNTS[plan],
            currentPeriodStart: new Date(razorpaySubscription.current_start * 1000),
            currentPeriodEnd: new Date(razorpaySubscription.current_end * 1000),
            totalCount: razorpaySubscription.total_count,
            paidCount: razorpaySubscription.paid_count,
            remainingCount: razorpaySubscription.remaining_count
        });

        await subscription.save();

        // Update user
        req.user.subscription = subscription._id;
        await req.user.save();

        res.json({ message: 'Subscription verified and activated successfully' });
    } catch (error) {
        console.error('Subscription verification error:', error);
        res.status(500).json({ message: 'Failed to verify subscription' });
    }
});

router.post('/cancel', authenticate, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate('subscription');

        if (!user.subscription) {
            return res.status(404).json({ message: 'No active subscription found' });
        }

        await cancelSubscription(user.subscription.razorpaySubscriptionId);

        user.subscription.cancelAtPeriodEnd = true;
        user.subscription.status = 'cancelled';
        user.subscription.canceledAt = new Date();
        await user.subscription.save();

        res.json({ message: 'Subscription canceled successfully' });
    } catch (error) {
        console.error('Subscription cancellation error:', error);
        res.status(500).json({ message: 'Failed to cancel subscription' });
    }
});

router.get('/status', authenticate, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate('subscription');

        if (!user.subscription) {
            return res.json({ hasSubscription: false });
        }

        // Fetch latest status from Razorpay
        let razorpaySubscription;
        try {
            razorpaySubscription = await fetchSubscription(user.subscription.razorpaySubscriptionId);

            // Update local subscription status
            user.subscription.status = razorpaySubscription.status;
            user.subscription.paidCount = razorpaySubscription.paid_count;
            user.subscription.remainingCount = razorpaySubscription.remaining_count;
            await user.subscription.save();
        } catch (error) {
            console.error('Error fetching Razorpay subscription:', error);
        }

        const isActive = user.subscription.isActive();

        res.json({
            hasSubscription: true,
            subscription: {
                ...user.subscription.toObject(),
                isActive,
                razorpayStatus: razorpaySubscription?.status || user.subscription.status
            }
        });
    } catch (error) {
        console.error('Subscription status error:', error);
        res.status(500).json({ message: 'Failed to get subscription status' });
    }
});

router.get('/plans', (req, res) => {
    res.json({
        plans: [
            {
                id: 'monthly',
                name: 'Monthly Plan',
                price: PLAN_AMOUNTS.monthly / 100, // Convert paise to rupees for display
                currency: 'INR',
                interval: 'month',
                features: [
                    'Enter golf scores',
                    'Monthly prize draws',
                    'Support charity',
                    'Win cash prizes'
                ]
            },
            {
                id: 'yearly',
                name: 'Yearly Plan',
                price: PLAN_AMOUNTS.yearly / 100, // Convert paise to rupees for display
                currency: 'INR',
                interval: 'year',
                savings: Math.round(((PLAN_AMOUNTS.monthly * 12 - PLAN_AMOUNTS.yearly) / 100) * 100) / 100,
                features: [
                    'Enter golf scores',
                    'Monthly prize draws',
                    'Support charity',
                    'Win cash prizes',
                    'Save ₹' + Math.round(((PLAN_AMOUNTS.monthly * 12 - PLAN_AMOUNTS.yearly) / 100) * 100) / 100
                ]
            }
        ]
    });
});

export default router;