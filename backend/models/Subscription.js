import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    razorpaySubscriptionId: {
        type: String,
        required: true,
        unique: true
    },
    razorpayPlanId: {
        type: String,
        required: true
    },
    razorpayCustomerId: {
        type: String,
        required: true
    },
    plan: {
        type: String,
        enum: ['monthly', 'yearly'],
        required: true
    },
    status: {
        type: String,
        enum: ['created', 'authenticated', 'active', 'paused', 'halted', 'cancelled', 'completed', 'expired'],
        default: 'created'
    },
    amount: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        default: 'INR'
    },
    currentPeriodStart: {
        type: Date,
        required: true
    },
    currentPeriodEnd: {
        type: Date,
        required: true
    },
    totalCount: {
        type: Number,
        default: 12
    },
    paidCount: {
        type: Number,
        default: 0
    },
    remainingCount: {
        type: Number,
        default: 12
    },
    cancelAtPeriodEnd: {
        type: Boolean,
        default: false
    },
    canceledAt: Date,
    endedAt: Date
}, {
    timestamps: true
});

subscriptionSchema.methods.isActive = function () {
    return ['active', 'authenticated'].includes(this.status) && new Date() < this.currentPeriodEnd;
};

export default mongoose.model('Subscription', subscriptionSchema);