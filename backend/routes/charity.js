import express from 'express';
import { body, validationResult } from 'express-validator';
import Charity from '../models/Charity.js';
import Donation from '../models/Donation.js';
import { authenticate } from '../middlewares/auth.js';
import { createOrder } from '../utils/razorpay.js';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const { category, search, featured } = req.query;
        const filter = { isActive: true };

        if (category) filter.category = category;
        if (featured === 'true') filter.isFeatured = true;
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        const charities = await Charity.find(filter).sort({ isFeatured: -1, name: 1 });
        res.json(charities);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/categories', async (req, res) => {
    try {
        const categories = await Charity.distinct('category', { isActive: true });
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/featured', async (req, res) => {
    try {
        const charity = await Charity.findOne({ isFeatured: true, isActive: true });
        res.json(charity);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const charity = await Charity.findOne({ _id: req.params.id, isActive: true });
        if (!charity) {
            return res.status(404).json({ message: 'Charity not found' });
        }
        res.json(charity);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/donate', authenticate, [
    body('charityId').isMongoId(),
    body('amount').isFloat({ min: 1 })
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { charityId, amount } = req.body;

        const charity = await Charity.findOne({ _id: charityId, isActive: true });
        if (!charity) {
            return res.status(404).json({ message: 'Charity not found' });
        }

        const order = await createOrder(amount);

        const donation = new Donation({
            user: req.user._id,
            charity: charityId,
            amount,
            type: 'direct',
            razorpayPaymentId: order.id,
            status: 'pending'
        });

        await donation.save();

        res.json({
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            donationId: donation._id
        });
    } catch (error) {
        console.error('Donation error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/donations/history', authenticate, async (req, res) => {
    try {
        const donations = await Donation.find({ user: req.user._id })
            .populate('charity', 'name logo')
            .sort({ createdAt: -1 });

        res.json(donations);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;