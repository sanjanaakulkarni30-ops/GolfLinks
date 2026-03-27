import express from 'express';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import Subscription from '../models/Subscription.js';
import Charity from '../models/Charity.js';
import Draw from '../models/Draw.js';
import Donation from '../models/Donation.js';
import { authenticate, requireAdmin } from '../middlewares/auth.js';
import { upload, uploadToCloudinary } from '../middlewares/upload.js';
import { runMonthlyDraw, generateDrawNumbers } from '../utils/drawEngine.js';

const router = express.Router();

router.use(authenticate);
router.use(requireAdmin);

router.get('/dashboard', async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const activeSubscriptions = await Subscription.countDocuments({ status: 'active' });
        const totalCharities = await Charity.countDocuments({ isActive: true });
        const totalDraws = await Draw.countDocuments({ status: 'published' });

        const monthlyRevenue = await Subscription.aggregate([
            { $match: { status: 'active' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        const charityContributions = await Donation.aggregate([
            { $match: { status: 'completed' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        res.json({
            totalUsers,
            activeSubscriptions,
            totalCharities,
            totalDraws,
            monthlyRevenue: monthlyRevenue[0]?.total || 0,
            charityContributions: charityContributions[0]?.total || 0
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/users', async (req, res) => {
    try {
        const { page = 1, limit = 20, search } = req.query;
        const filter = {};

        if (search) {
            filter.$or = [
                { firstName: { $regex: search, $options: 'i' } },
                { lastName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        const users = await User.find(filter)
            .populate('subscription selectedCharity')
            .select('-password')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await User.countDocuments(filter);

        res.json({
            users,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});
router.put('/users/:id/scores', [
    body('scores').isArray(),
    body('scores.*.value').isInt({ min: 1, max: 45 }),
    body('scores.*.date').isISO8601()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { id } = req.params;
        const { scores } = req.body;

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.scores = scores.slice(0, 5).map(score => ({
            value: score.value,
            date: new Date(score.date),
            createdAt: new Date()
        }));

        await user.save();
        res.json({ message: 'User scores updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/charities', async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;

        const charities = await Charity.find()
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Charity.countDocuments();

        res.json({
            charities,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/charities', upload.single('logo'), [
    body('name').trim().isLength({ min: 1 }),
    body('description').trim().isLength({ min: 10 }),
    body('website').isURL(),
    body('category').trim().isLength({ min: 1 }),
    body('registrationNumber').trim().isLength({ min: 1 })
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        if (!req.file) {
            return res.status(400).json({ message: 'Logo is required' });
        }

        const logoUrl = await uploadToCloudinary(req.file.buffer, 'charities');

        const charity = new Charity({
            ...req.body,
            logo: logoUrl
        });

        await charity.save();
        res.status(201).json(charity);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.put('/charities/:id', upload.single('logo'), async (req, res) => {
    try {
        const { id } = req.params;
        const updates = { ...req.body };

        if (req.file) {
            updates.logo = await uploadToCloudinary(req.file.buffer, 'charities');
        }

        const charity = await Charity.findByIdAndUpdate(id, updates, { new: true });
        if (!charity) {
            return res.status(404).json({ message: 'Charity not found' });
        }

        res.json(charity);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.delete('/charities/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const charity = await Charity.findByIdAndUpdate(
            id,
            { isActive: false },
            { new: true }
        );

        if (!charity) {
            return res.status(404).json({ message: 'Charity not found' });
        }

        res.json({ message: 'Charity deactivated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/draws', async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;

        const draws = await Draw.find()
            .populate('winners.user', 'firstName lastName email')
            .sort({ year: -1, month: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Draw.countDocuments();

        res.json({
            draws,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/draws/simulate', async (req, res) => {
    try {
        const drawNumbers = generateDrawNumbers();

        const activeUsers = await User.find({
            subscription: { $exists: true },
            'scores.4': { $exists: true }
        }).populate('subscription');

        const simulation = {
            drawNumbers,
            totalParticipants: 0,
            winners: { 3: 0, 4: 0, 5: 0 },
            sampleWinners: []
        };

        for (const user of activeUsers) {
            if (!user.subscription.isActive()) continue;

            simulation.totalParticipants++;

            const userNumbers = user.scores.slice(0, 5).map(s => s.value).sort((a, b) => a - b);
            const matches = userNumbers.filter(num => drawNumbers.includes(num)).length;

            if (matches >= 3) {
                simulation.winners[matches]++;
                if (simulation.sampleWinners.length < 10) {
                    simulation.sampleWinners.push({
                        user: `${user.firstName} ${user.lastName}`,
                        matches,
                        userNumbers,
                        matchedNumbers: userNumbers.filter(num => drawNumbers.includes(num))
                    });
                }
            }
        }

        res.json(simulation);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/draws/run', async (req, res) => {
    try {
        const draw = await runMonthlyDraw();
        res.json({ message: 'Draw completed successfully', draw });
    } catch (error) {
        console.error('Manual draw error:', error);
        res.status(500).json({ message: 'Failed to run draw' });
    }
});

router.get('/winners', async (req, res) => {
    try {
        const { status = 'all' } = req.query;

        const users = await User.find({ 'winnings.0': { $exists: true } })
            .populate('winnings.drawId', 'month year drawNumbers')
            .select('firstName lastName email winnings');

        const winners = [];

        users.forEach(user => {
            user.winnings.forEach(winning => {
                if (status === 'all' || winning.status === status) {
                    winners.push({
                        _id: winning._id,
                        user: {
                            _id: user._id,
                            firstName: user.firstName,
                            lastName: user.lastName,
                            email: user.email
                        },
                        draw: winning.drawId,
                        amount: winning.amount,
                        matchType: winning.matchType,
                        status: winning.status,
                        proofImage: winning.proofImage,
                        verifiedAt: winning.verifiedAt,
                        paidAt: winning.paidAt
                    });
                }
            });
        });

        res.json(winners.sort((a, b) => new Date(b.draw?.createdAt) - new Date(a.draw?.createdAt)));
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.put('/winners/:userId/:winningId/verify', [
    body('status').isIn(['verified', 'rejected'])
], async (req, res) => {
    try {
        const { userId, winningId } = req.params;
        const { status } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const winning = user.winnings.id(winningId);
        if (!winning) {
            return res.status(404).json({ message: 'Winning not found' });
        }

        winning.status = status;
        if (status === 'verified') {
            winning.verifiedAt = new Date();
        }

        await user.save();
        res.json({ message: `Winner ${status} successfully` });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.put('/winners/:userId/:winningId/pay', async (req, res) => {
    try {
        const { userId, winningId } = req.params;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const winning = user.winnings.id(winningId);
        if (!winning) {
            return res.status(404).json({ message: 'Winning not found' });
        }

        if (winning.status !== 'verified') {
            return res.status(400).json({ message: 'Winner must be verified first' });
        }

        winning.status = 'paid';
        winning.paidAt = new Date();

        await user.save();
        res.json({ message: 'Winner marked as paid successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;