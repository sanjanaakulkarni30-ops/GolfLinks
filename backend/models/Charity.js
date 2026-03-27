import mongoose from 'mongoose';

const charitySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    website: {
        type: String,
        required: true
    },
    logo: {
        type: String,
        required: true
    },
    images: [String],
    category: {
        type: String,
        required: true
    },
    registrationNumber: {
        type: String,
        required: true
    },
    totalRaised: {
        type: Number,
        default: 0
    },
    totalDonors: {
        type: Number,
        default: 0
    },
    isFeatured: {
        type: Boolean,
        default: false
    },
    isActive: {
        type: Boolean,
        default: true
    },
    events: [{
        title: String,
        description: String,
        date: Date,
        image: String
    }]
}, {
    timestamps: true
});

export default mongoose.model('Charity', charitySchema);