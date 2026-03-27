import mongoose from 'mongoose';

const drawSchema = new mongoose.Schema({
    month: {
        type: Number,
        required: true
    },
    year: {
        type: Number,
        required: true
    },
    drawNumbers: {
        type: [Number],
        required: true,
        validate: {
            validator: function (arr) {
                return arr.length === 5 && arr.every(num => num >= 1 && num <= 45);
            },
            message: 'Draw must have exactly 5 numbers between 1 and 45'
        }
    },
    totalPrizePool: {
        type: Number,
        required: true
    },
    prizeDistribution: {
        fiveMatch: {
            percentage: { type: Number, default: 40 },
            amount: Number,
            winners: Number,
            amountPerWinner: Number
        },
        fourMatch: {
            percentage: { type: Number, default: 35 },
            amount: Number,
            winners: Number,
            amountPerWinner: Number
        },
        threeMatch: {
            percentage: { type: Number, default: 25 },
            amount: Number,
            winners: Number,
            amountPerWinner: Number
        }
    },
    winners: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        matchType: {
            type: String,
            enum: ['3-match', '4-match', '5-match']
        },
        matchedNumbers: [Number],
        userNumbers: [Number],
        prizeAmount: Number,
        status: {
            type: String,
            enum: ['pending', 'verified', 'paid', 'rejected'],
            default: 'pending'
        }
    }],
    jackpotRollover: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['draft', 'published', 'completed'],
        default: 'draft'
    },
    publishedAt: Date,
    completedAt: Date,
    totalParticipants: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

drawSchema.index({ month: 1, year: 1 }, { unique: true });

export default mongoose.model('Draw', drawSchema);