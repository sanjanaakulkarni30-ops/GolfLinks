import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const authenticate = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({ message: 'Access denied. No token provided.' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId).populate('subscription selectedCharity');

        if (!user) {
            return res.status(401).json({ message: 'Invalid token.' });
        }

        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Invalid token.' });
    }
};

export const requireSubscription = async (req, res, next) => {
    try {
        if (!req.user.subscription) {
            return res.status(403).json({ message: 'Active subscription required.' });
        }

        if (!req.user.subscription.isActive()) {
            return res.status(403).json({ message: 'Subscription expired or inactive.' });
        }

        next();
    } catch (error) {
        res.status(500).json({ message: 'Error checking subscription status.' });
    }
};

export const requireAdmin = (req, res, next) => {
    if (!req.user.isAdmin) {
        return res.status(403).json({ message: 'Admin access required.' });
    }
    next();
};