import mongoose from 'mongoose';

const donationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    charity: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Charity',
        required: true
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    type: {
        type: String,
        enum: ['subscription', 'direct'],
        required: true
    },
    razorpayPaymentId: String,
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'pending'
    },
    month: Number,
    year: Number
}, {
    timestamps: true
});

export default mongoose.model('Donation', donationSchema);