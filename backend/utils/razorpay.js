import Razorpay from 'razorpay';
import crypto from 'crypto';

let razorpay = null;

const getRazorpayInstance = () => {
    if (!razorpay) {
        if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
            throw new Error('Razorpay credentials not found in environment variables');
        }

        razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET
        });
    }
    return razorpay;
};

export const createOrder = async (amount, currency = 'INR', receipt = null) => {
    try {
        const razorpayInstance = getRazorpayInstance();
        const options = {
            amount: Math.round(amount * 100), // Amount in paise
            currency,
            receipt: receipt || `receipt_${Date.now()}`,
            payment_capture: 1
        };

        return await razorpayInstance.orders.create(options);
    } catch (error) {
        throw new Error(`Razorpay order creation failed: ${error.message}`);
    }
};

export const createSubscription = async (planId, customerId, totalCount = 12) => {
    try {
        const razorpayInstance = getRazorpayInstance();
        const options = {
            plan_id: planId,
            customer_notify: 1,
            total_count: totalCount,
            quantity: 1
        };

        return await razorpayInstance.subscriptions.create(options);
    } catch (error) {
        throw new Error(`Razorpay subscription creation failed: ${error.message}`);
    }
};

export const createPlan = async (period, interval, amount) => {
    try {
        const razorpayInstance = getRazorpayInstance();
        const options = {
            period,
            interval,
            item: {
                name: `Golf Charity ${period.charAt(0).toUpperCase() + period.slice(1)} Plan`,
                amount: Math.round(amount), // Amount already in paise
                currency: 'INR'
            }
        };

        return await razorpayInstance.plans.create(options);
    } catch (error) {
        throw new Error(`Razorpay plan creation failed: ${error.message}`);
    }
};

export const createCustomer = async (name, email, contact = null) => {
    try {
        const razorpayInstance = getRazorpayInstance();
        const options = {
            name,
            email,
            contact: contact || '9999999999'
        };

        return await razorpayInstance.customers.create(options);
    } catch (error) {
        throw new Error(`Razorpay customer creation failed: ${error.message}`);
    }
};

export const verifyPaymentSignature = (orderId, paymentId, signature) => {
    const body = orderId + '|' + paymentId;
    const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest('hex');

    return expectedSignature === signature;
};

export const verifySubscriptionSignature = (paymentId, subscriptionId, signature) => {
    const body = paymentId + '|' + subscriptionId;
    const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest('hex');

    return expectedSignature === signature;
};

export const cancelSubscription = async (subscriptionId) => {
    try {
        const razorpayInstance = getRazorpayInstance();
        return await razorpayInstance.subscriptions.cancel(subscriptionId);
    } catch (error) {
        throw new Error(`Razorpay subscription cancellation failed: ${error.message}`);
    }
};

export const fetchSubscription = async (subscriptionId) => {
    try {
        const razorpayInstance = getRazorpayInstance();
        return await razorpayInstance.subscriptions.fetch(subscriptionId);
    } catch (error) {
        throw new Error(`Razorpay subscription fetch failed: ${error.message}`);
    }
};

export default getRazorpayInstance;