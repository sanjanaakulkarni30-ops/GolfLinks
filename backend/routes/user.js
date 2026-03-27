import express from 'express';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import Charity from '../models/Charity.js';
import { authenticate } from '../middlewares/auth.js';

const router = express.Router();

router.get('/profile', authenticate, async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .populate('subscription selectedCharity')
            .select('-password');

        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.put('/profile', authenticate, [
    body('firstName').optional().trim().isLength({ min: 1 }),
    body('lastName').optional().trim().isLength({ min: 1 }),
    body('charityContribution').optional().isInt({ min: 10, max: 100 })
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { firstName, lastName, charityContribution } = req.body;
        const updates = {};

        if (firstName) updates.firstName = firstName;
        if (lastName) updates.lastName = lastName;
        if (charityContribution) updates.charityContribution = charityContribution;

        const user = await User.findByIdAndUpdate(
            req.user._id,
            updates,
            { new: true }
        ).populate('subscription selectedCharity').select('-password');

        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.put('/charity', authenticate, [
    body('charityId').isMongoId()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { charityId } = req.body;

        const charity = await Charity.findById(charityId);
        if (!charity || !charity.isActive) {
            return res.status(404).json({ message: 'Charity not found' });
        }

        const user = await User.findByIdAndUpdate(
            req.user._id,
            { selectedCharity: charityId },
            { new: true }
        ).populate('subscription selectedCharity').select('-password');

        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/dashboard', authenticate, async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .populate('subscription selectedCharity')
            .select('-password');

        const dashboardData = {
            user: {
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email
            },
            subscription: user.subscription,
            selectedCharity: user.selectedCharity,
            charityContribution: user.charityContribution,
            scores: user.scores,
            winnings: user.winnings,
            stats: {
                totalWinnings: user.winnings.reduce((sum, w) => sum + (w.amount || 0), 0),
                totalScores: user.scores.length,
                averageScore: user.scores.length > 0
                    ? Math.round(user.scores.reduce((sum, s) => sum + s.value, 0) / user.scores.length)
                    : 0
            }
        };

        res.json(dashboardData);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;