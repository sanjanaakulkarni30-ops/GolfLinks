import express from 'express';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import { authenticate, requireSubscription } from '../middlewares/auth.js';

const router = express.Router();

router.get('/', authenticate, requireSubscription, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('scores');
        res.json(user.scores);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/', authenticate, requireSubscription, [
    body('score').isInt({ min: 1, max: 45 }),
    body('date').isISO8601()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { score, date } = req.body;
        const scoreDate = new Date(date);

        if (scoreDate > new Date()) {
            return res.status(400).json({ message: 'Score date cannot be in the future' });
        }

        const user = await User.findById(req.user._id);

        const existingScore = user.scores.find(s =>
            s.date.toDateString() === scoreDate.toDateString()
        );

        if (existingScore) {
            return res.status(400).json({ message: 'Score already exists for this date' });
        }

        await user.addScore(score, scoreDate);

        const updatedUser = await User.findById(req.user._id).select('scores');
        res.json(updatedUser.scores);
    } catch (error) {
        console.error('Score creation error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.put('/:scoreId', authenticate, requireSubscription, [
    body('score').isInt({ min: 1, max: 45 }),
    body('date').isISO8601()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { scoreId } = req.params;
        const { score, date } = req.body;
        const scoreDate = new Date(date);

        if (scoreDate > new Date()) {
            return res.status(400).json({ message: 'Score date cannot be in the future' });
        }

        const user = await User.findById(req.user._id);
        const scoreIndex = user.scores.findIndex(s => s._id.toString() === scoreId);

        if (scoreIndex === -1) {
            return res.status(404).json({ message: 'Score not found' });
        }

        const existingScore = user.scores.find((s, index) =>
            index !== scoreIndex && s.date.toDateString() === scoreDate.toDateString()
        );

        if (existingScore) {
            return res.status(400).json({ message: 'Score already exists for this date' });
        }

        user.scores[scoreIndex].value = score;
        user.scores[scoreIndex].date = scoreDate;

        await user.save();

        const updatedUser = await User.findById(req.user._id).select('scores');
        res.json(updatedUser.scores);
    } catch (error) {
        console.error('Score update error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.delete('/:scoreId', authenticate, requireSubscription, async (req, res) => {
    try {
        const { scoreId } = req.params;
        const user = await User.findById(req.user._id);

        const scoreIndex = user.scores.findIndex(s => s._id.toString() === scoreId);

        if (scoreIndex === -1) {
            return res.status(404).json({ message: 'Score not found' });
        }

        user.scores.splice(scoreIndex, 1);
        await user.save();

        const updatedUser = await User.findById(req.user._id).select('scores');
        res.json(updatedUser.scores);
    } catch (error) {
        console.error('Score deletion error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;