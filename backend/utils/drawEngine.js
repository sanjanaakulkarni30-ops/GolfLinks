import User from '../models/User.js';
import Draw from '../models/Draw.js';
import Subscription from '../models/Subscription.js';

export const generateDrawNumbers = () => {
    const numbers = [];
    while (numbers.length < 5) {
        const num = Math.floor(Math.random() * 45) + 1;
        if (!numbers.includes(num)) {
            numbers.push(num);
        }
    }
    return numbers.sort((a, b) => a - b);
};

export const generateUserNumbers = (scores) => {
    if (scores.length < 5) return [];

    const sortedScores = [...scores].sort((a, b) => new Date(b.date) - new Date(a.date));
    return sortedScores.slice(0, 5).map(score => score.value).sort((a, b) => a - b);
};

export const calculateMatches = (userNumbers, drawNumbers) => {
    const matches = userNumbers.filter(num => drawNumbers.includes(num));
    return {
        count: matches.length,
        numbers: matches
    };
};

export const calculatePrizePool = async () => {
    const activeSubscriptions = await Subscription.find({ status: 'active' }).populate('user');
    let totalPool = 0;

    for (const subscription of activeSubscriptions) {
        const contributionPercentage = (100 - subscription.user.charityContribution) / 100;
        totalPool += subscription.amount * contributionPercentage;
    }

    return totalPool;
};

export const runMonthlyDraw = async () => {
    try {
        const now = new Date();
        const month = now.getMonth() + 1;
        const year = now.getFullYear();

        const existingDraw = await Draw.findOne({ month, year });
        if (existingDraw && existingDraw.status === 'published') {
            console.log('Draw already exists for this month');
            return;
        }

        const drawNumbers = generateDrawNumbers();
        const totalPrizePool = await calculatePrizePool();

        const previousDraw = await Draw.findOne({
            $or: [
                { month: month - 1, year },
                { month: 12, year: year - 1 }
            ]
        }).sort({ createdAt: -1 });

        const jackpotRollover = previousDraw?.prizeDistribution?.fiveMatch?.winners === 0
            ? previousDraw.prizeDistribution.fiveMatch.amount
            : 0;

        const adjustedPrizePool = totalPrizePool + jackpotRollover;

        const prizeDistribution = {
            fiveMatch: {
                percentage: 40,
                amount: Math.floor(adjustedPrizePool * 0.4),
                winners: 0,
                amountPerWinner: 0
            },
            fourMatch: {
                percentage: 35,
                amount: Math.floor(adjustedPrizePool * 0.35),
                winners: 0,
                amountPerWinner: 0
            },
            threeMatch: {
                percentage: 25,
                amount: Math.floor(adjustedPrizePool * 0.25),
                winners: 0,
                amountPerWinner: 0
            }
        };

        const activeUsers = await User.find({
            subscription: { $exists: true },
            'scores.4': { $exists: true }
        }).populate('subscription');

        const winners = [];
        const matchCounts = { 3: 0, 4: 0, 5: 0 };

        for (const user of activeUsers) {
            if (!user.subscription.isActive()) continue;

            const userNumbers = generateUserNumbers(user.scores);
            if (userNumbers.length < 5) continue;

            const matches = calculateMatches(userNumbers, drawNumbers);

            if (matches.count >= 3) {
                matchCounts[matches.count]++;
                winners.push({
                    user: user._id,
                    matchType: `${matches.count}-match`,
                    matchedNumbers: matches.numbers,
                    userNumbers,
                    prizeAmount: 0,
                    status: 'pending'
                });
            }
        }

        if (matchCounts[5] > 0) {
            prizeDistribution.fiveMatch.winners = matchCounts[5];
            prizeDistribution.fiveMatch.amountPerWinner = Math.floor(prizeDistribution.fiveMatch.amount / matchCounts[5]);
        }

        if (matchCounts[4] > 0) {
            prizeDistribution.fourMatch.winners = matchCounts[4];
            prizeDistribution.fourMatch.amountPerWinner = Math.floor(prizeDistribution.fourMatch.amount / matchCounts[4]);
        }

        if (matchCounts[3] > 0) {
            prizeDistribution.threeMatch.winners = matchCounts[3];
            prizeDistribution.threeMatch.amountPerWinner = Math.floor(prizeDistribution.threeMatch.amount / matchCounts[3]);
        }

        winners.forEach(winner => {
            const matchCount = parseInt(winner.matchType.split('-')[0]);
            if (matchCount === 5) winner.prizeAmount = prizeDistribution.fiveMatch.amountPerWinner;
            else if (matchCount === 4) winner.prizeAmount = prizeDistribution.fourMatch.amountPerWinner;
            else if (matchCount === 3) winner.prizeAmount = prizeDistribution.threeMatch.amountPerWinner;
        });

        const draw = new Draw({
            month,
            year,
            drawNumbers,
            totalPrizePool: adjustedPrizePool,
            prizeDistribution,
            winners,
            jackpotRollover,
            status: 'published',
            publishedAt: new Date(),
            totalParticipants: activeUsers.length
        });

        await draw.save();

        // Update user winnings without sending emails
        for (const user of activeUsers) {
            const userWinnings = winners.filter(w => w.user.toString() === user._id.toString());

            if (userWinnings.length > 0) {
                user.winnings.push(...userWinnings.map(w => ({
                    drawId: draw._id,
                    amount: w.prizeAmount,
                    matchType: w.matchType,
                    status: 'pending'
                })));
                await user.save();
            }
        }

        console.log(`Monthly draw completed for ${month}/${year}`);
        return draw;

    } catch (error) {
        console.error('Error running monthly draw:', error);
        throw error;
    }
};