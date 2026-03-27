import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    subscription: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subscription'
    },
    selectedCharity: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Charity'
    },
    charityContribution: {
        type: Number,
        default: 10,
        min: 10,
        max: 100
    },
    scores: [{
        value: {
            type: Number,
            required: true,
            min: 1,
            max: 45
        },
        date: {
            type: Date,
            required: true
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    winnings: [{
        drawId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Draw'
        },
        amount: Number,
        matchType: String,
        status: {
            type: String,
            enum: ['pending', 'verified', 'paid', 'rejected'],
            default: 'pending'
        },
        proofImage: String,
        verifiedAt: Date,
        paidAt: Date
    }],
    razorpayCustomerId: String,
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;

    // Check if password is already hashed (starts with $2b$ or $2a$)
    if (this.password.startsWith('$2b$') || this.password.startsWith('$2a$')) {
        return;
    }

    this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = async function (password) {
    return bcrypt.compare(password, this.password);
};

userSchema.methods.addScore = function (score, date) {
    this.scores.unshift({ value: score, date });
    if (this.scores.length > 5) {
        this.scores = this.scores.slice(0, 5);
    }
    return this.save();
};

export default mongoose.model('User', userSchema);