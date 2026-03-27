import express from 'express';
import Draw from '../models/Draw.js';
import User from '../models/User.js';
import { authenticate, requireSubscription } from '../middlewares/auth.js';
import { upload, uploadToCloudinary } from '../middlewares/upload.js';
import { generateUserNumbers } from '../utils/drawEngine.js';

const router = express.Router();

router.get('/current', async (req, res) => {
    try {
        const now = new Date();
        const currentMonth = now.getMonth() + 1;
        const currentYear = now.getFullYear();

        const draw = await Draw.findOne({
            month: currentMonth,
            year: currentYear,
            status: 'published'
        });

        if (!draw) {
            return res.json({ message: 'No draw available for current month' });
        }

        res.json(draw);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/history', async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;

        const draws = await Draw.find({ status: 'published' })
            .sort({ year: -1, month: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Draw.countDocuments({ status: 'published' });

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

router.get('/my-numbers', authenticate, requireSubscription, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('scores');

        if (user.scores.length < 5) {
            return res.json({
                message: 'You need at least 5 scores to participate in draws',
                numbers: [],
                scoresCount: user.scores.length
            });
        }

        const numbers = generateUserNumbers(user.scores);

        res.json({
            numbers,
            scoresCount: user.scores.length,
            canParticipate: true
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/my-winnings', authenticate, async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .populate({
                path: 'winnings.drawId',
                select: 'month year drawNumbers'
            })
            .select('winnings');

        res.json(user.winnings);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/submit-proof/:winningId', authenticate, upload.single('proof'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Proof image is required' });
        }

        const { winningId } = req.params;
        const user = await User.findById(req.user._id);

        const winning = user.winnings.id(winningId);
        if (!winning) {
            return res.status(404).json({ message: 'Winning not found' });
        }

        if (winning.status !== 'pending') {
            return res.status(400).json({ message: 'Proof already submitted or processed' });
        }

        const imageUrl = await uploadToCloudinary(req.file.buffer, 'proofs');

        winning.proofImage = imageUrl;
        winning.status = 'pending';

        await user.save();

        res.json({ message: 'Proof submitted successfully', winning });
    } catch (error) {
        console.error('Proof submission error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/stats', async (req, res) => {
    try {
        const totalDraws = await Draw.countDocuments({ status: 'published' });
        const totalWinners = await Draw.aggregate([
            { $match: { status: 'published' } },
            { $unwind: '$winners' },
            { $group: { _id: null, count: { $sum: 1 } } }
        ]);

        const totalPrizesPaid = await Draw.aggregate([
            { $match: { status: 'published' } },
            { $group: { _id: null, total: { $sum: '$totalPrizePool' } } }
        ]);

        const currentDraw = await Draw.findOne({
            month: new Date().getMonth() + 1,
            year: new Date().getFullYear(),
            status: { $in: ['draft', 'published'] }
        });

        res.json({
            totalDraws,
            totalWinners: totalWinners[0]?.count || 0,
            totalPrizesPaid: totalPrizesPaid[0]?.total || 0,
            currentPrizePool: currentDraw?.totalPrizePool || 0
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;