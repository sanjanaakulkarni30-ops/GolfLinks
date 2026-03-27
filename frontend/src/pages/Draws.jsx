import { useState, useEffect } from 'react';
import { Trophy, Calendar, Users, DollarSign, Star } from 'lucide-react';
import useDrawStore from '../store/drawStore';
import useAuthStore from '../store/authStore';

const Draws = () => {
    const { user } = useAuthStore();
    const {
        currentDraw,
        drawHistory,
        myNumbers,
        stats,
        isLoading,
        fetchCurrentDraw,
        fetchDrawHistory,
        fetchMyNumbers,
        fetchDrawStats
    } = useDrawStore();

    useEffect(() => {
        fetchCurrentDraw();
        fetchDrawHistory();
        fetchDrawStats();

        if (user) {
            fetchMyNumbers();
        }
    }, [user, fetchCurrentDraw, fetchDrawHistory, fetchDrawStats, fetchMyNumbers]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        Monthly Prize Draws
                    </h1>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                        Enter your golf scores and participate in our monthly draws for amazing cash prizes.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 text-center">
                        <Trophy className="mx-auto text-yellow-500 mb-3" size={32} />
                        <div className="text-2xl font-bold text-gray-900">
                            {stats.totalDraws || 0}
                        </div>
                        <div className="text-gray-600">Total Draws</div>
                    </div>

                    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 text-center">
                        <Users className="mx-auto text-blue-500 mb-3" size={32} />
                        <div className="text-2xl font-bold text-gray-900">
                            {stats.totalWinners || 0}
                        </div>
                        <div className="text-gray-600">Total Winners</div>
                    </div>

                    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 text-center">
                        <DollarSign className="mx-auto text-green-500 mb-3" size={32} />
                        <div className="text-2xl font-bold text-gray-900">
                            ${(stats.totalPrizesPaid || 0).toLocaleString()}
                        </div>
                        <div className="text-gray-600">Prizes Paid</div>
                    </div>

                    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 text-center">
                        <Star className="mx-auto text-purple-500 mb-3" size={32} />
                        <div className="text-2xl font-bold text-gray-900">
                            ${(stats.currentPrizePool || 0).toLocaleString()}
                        </div>
                        <div className="text-gray-600">Current Pool</div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        {currentDraw && currentDraw.drawNumbers ? (
                            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-8">
                                <div className="text-center mb-6">
                                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                        Current Draw Results
                                    </h2>
                                    <p className="text-gray-600">
                                        {currentDraw.month}/{currentDraw.year}
                                    </p>
                                </div>

                                <div className="flex justify-center mb-8">
                                    <div className="flex space-x-3">
                                        {currentDraw.drawNumbers.map((number, index) => (
                                            <div
                                                key={index}
                                                className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-lg font-bold"
                                            >
                                                {number}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="text-center p-4 bg-yellow-50 rounded-lg">
                                        <div className="text-lg font-bold text-yellow-800">5 Match</div>
                                        <div className="text-2xl font-bold text-yellow-600">
                                            ${currentDraw.prizeDistribution.fiveMatch.amountPerWinner || 0}
                                        </div>
                                        <div className="text-sm text-yellow-700">
                                            {currentDraw.prizeDistribution.fiveMatch.winners} winner(s)
                                        </div>
                                    </div>

                                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                                        <div className="text-lg font-bold text-blue-800">4 Match</div>
                                        <div className="text-2xl font-bold text-blue-600">
                                            ${currentDraw.prizeDistribution.fourMatch.amountPerWinner || 0}
                                        </div>
                                        <div className="text-sm text-blue-700">
                                            {currentDraw.prizeDistribution.fourMatch.winners} winner(s)
                                        </div>
                                    </div>

                                    <div className="text-center p-4 bg-green-50 rounded-lg">
                                        <div className="text-lg font-bold text-green-800">3 Match</div>
                                        <div className="text-2xl font-bold text-green-600">
                                            ${currentDraw.prizeDistribution.threeMatch.amountPerWinner || 0}
                                        </div>
                                        <div className="text-sm text-green-700">
                                            {currentDraw.prizeDistribution.threeMatch.winners} winner(s)
                                        </div>
                                    </div>
                                </div>

                                <div className="text-center mt-6 text-gray-600">
                                    <p>Total Prize Pool: ${currentDraw.totalPrizePool?.toLocaleString() || '0'}</p>
                                    <p>Participants: {currentDraw.totalParticipants || 0}</p>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-8 text-center">
                                <Trophy className="mx-auto text-gray-400 mb-4" size={64} />
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                    Next Draw Coming Soon
                                </h2>
                                <p className="text-gray-600 mb-4">
                                    The next monthly draw will be held at the beginning of next month.
                                </p>
                                <div className="text-lg font-semibold text-blue-600">
                                    Current Prize Pool: ${(stats.currentPrizePool || 0).toLocaleString()}
                                </div>
                            </div>
                        )}

                        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Draw History</h2>

                            {drawHistory.length === 0 ? (
                                <div className="text-center py-8">
                                    <Calendar className="mx-auto text-gray-400 mb-4" size={48} />
                                    <p className="text-gray-600">No previous draws yet</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {drawHistory.map((draw) => (
                                        <div key={draw._id} className="border border-gray-200 rounded-lg p-4">
                                            <div className="flex justify-between items-start mb-3">
                                                <div>
                                                    <h3 className="font-semibold text-gray-900">
                                                        {draw.month}/{draw.year} Draw
                                                    </h3>
                                                    <p className="text-sm text-gray-600">
                                                        {draw.totalParticipants} participants
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-lg font-bold text-green-600">
                                                        ${draw.totalPrizePool?.toLocaleString() || '0'}
                                                    </div>
                                                    <div className="text-sm text-gray-600">Prize Pool</div>
                                                </div>
                                            </div>

                                            <div className="flex space-x-2 mb-3">
                                                {draw.drawNumbers?.map((number, index) => (
                                                    <div
                                                        key={index}
                                                        className="w-8 h-8 bg-gray-600 text-white rounded-full flex items-center justify-center text-sm font-bold"
                                                    >
                                                        {number}
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="grid grid-cols-3 gap-2 text-xs">
                                                <div className="text-center">
                                                    <div className="font-semibold">5 Match</div>
                                                    <div>{draw.prizeDistribution?.fiveMatch?.winners || 0} winners</div>
                                                </div>
                                                <div className="text-center">
                                                    <div className="font-semibold">4 Match</div>
                                                    <div>{draw.prizeDistribution?.fourMatch?.winners || 0} winners</div>
                                                </div>
                                                <div className="text-center">
                                                    <div className="font-semibold">3 Match</div>
                                                    <div>{draw.prizeDistribution?.threeMatch?.winners || 0} winners</div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-6">
                        {user ? (
                            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                                <h2 className="text-xl font-bold text-gray-900 mb-4">Your Numbers</h2>

                                {myNumbers && myNumbers.canParticipate ? (
                                    <div>
                                        <div className="flex justify-center mb-4">
                                            <div className="flex space-x-2">
                                                {myNumbers.numbers.map((number, index) => (
                                                    <div
                                                        key={index}
                                                        className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold"
                                                    >
                                                        {number}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <p className="text-center text-sm text-gray-600">
                                            Based on your latest 5 scores
                                        </p>
                                    </div>
                                ) : (
                                    <div className="text-center py-4">
                                        <Trophy className="mx-auto text-gray-400 mb-4" size={48} />
                                        <p className="text-gray-600 mb-2">
                                            {myNumbers?.message || 'You need 5 scores to participate'}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            Current scores: {myNumbers?.scoresCount || 0}/5
                                        </p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 text-center">
                                <h2 className="text-xl font-bold text-gray-900 mb-4">Join the Draw</h2>
                                <p className="text-gray-600 mb-4">
                                    Sign up and enter your golf scores to participate in monthly draws.
                                </p>
                                <a href="/register" className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200">
                                    Get Started
                                </a>
                            </div>
                        )}

                        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                            <h2 className="text-lg font-bold text-gray-900 mb-4">How It Works</h2>
                            <div className="space-y-3 text-sm">
                                <div className="flex items-start">
                                    <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">
                                        1
                                    </div>
                                    <p className="text-gray-700">
                                        Enter your 5 most recent golf scores (Stableford format)
                                    </p>
                                </div>
                                <div className="flex items-start">
                                    <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">
                                        2
                                    </div>
                                    <p className="text-gray-700">
                                        Your scores become your draw numbers (sorted lowest to highest)
                                    </p>
                                </div>
                                <div className="flex items-start">
                                    <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">
                                        3
                                    </div>
                                    <p className="text-gray-700">
                                        Match 3, 4, or 5 numbers with the monthly draw to win prizes
                                    </p>
                                </div>
                                <div className="flex items-start">
                                    <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">
                                        4
                                    </div>
                                    <p className="text-gray-700">
                                        Winners submit proof of scores and receive their prizes
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Draws;