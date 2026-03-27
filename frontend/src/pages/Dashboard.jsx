import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Heart, DollarSign, Plus, Edit, Trash2, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import useDashboardStore from '../store/dashboardStore';
import useScoreStore from '../store/scoreStore';
import useDrawStore from '../store/drawStore';
import ScoreModal from '../components/ScoreModal';
import ProofModal from '../components/ProofModal';

const Dashboard = () => {
    const { dashboardData, fetchDashboardData, isLoading } = useDashboardStore();
    const { addScore, updateScore, deleteScore } = useScoreStore();
    const { submitProof } = useDrawStore();

    const [showScoreModal, setShowScoreModal] = useState(false);
    const [showProofModal, setShowProofModal] = useState(false);
    const [editingScore, setEditingScore] = useState(null);
    const [selectedWinning, setSelectedWinning] = useState(null);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    const handleScoreSubmit = async (scoreData) => {
        try {
            let result;
            if (editingScore) {
                result = await updateScore(editingScore._id, scoreData);
            } else {
                result = await addScore(scoreData);
            }

            if (result.success) {
                toast.success(editingScore ? 'Score updated successfully' : 'Score added successfully');
                setShowScoreModal(false);
                setEditingScore(null);
                fetchDashboardData();
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            toast.error('Failed to save score');
        }
    };

    const handleDeleteScore = async (scoreId) => {
        if (!confirm('Are you sure you want to delete this score?')) return;

        const result = await deleteScore(scoreId);
        if (result.success) {
            toast.success('Score deleted successfully');
            fetchDashboardData();
        } else {
            toast.error('Failed to delete score');
        }
    };

    const handleProofSubmit = async (file) => {
        const result = await submitProof(selectedWinning._id, file);
        if (result.success) {
            toast.success('Proof submitted successfully');
            setShowProofModal(false);
            setSelectedWinning(null);
            fetchDashboardData();
        } else {
            toast.error('Failed to submit proof');
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!dashboardData) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Failed to load dashboard</h2>
                    <button onClick={fetchDashboardData} className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200">
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    const { user, subscription, selectedCharity, scores, winnings, stats } = dashboardData;

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Welcome back, {user.firstName}!
                    </h1>
                    <p className="text-gray-600 mt-2">
                        Track your progress and manage your golf charity journey
                    </p>
                </div>

                {!subscription && (
                    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-8 border-l-4 border-yellow-400 bg-yellow-50">
                        <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                            Subscription Required
                        </h3>
                        <p className="text-yellow-700 mb-4">
                            You need an active subscription to enter scores and participate in draws.
                        </p>
                        <Link to="/subscription" className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200">
                            Choose a Plan
                        </Link>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                        <div className="flex items-center">
                            <Trophy className="text-blue-600" size={32} />
                            <div className="ml-4">
                                <p className="text-sm text-gray-600">Total Winnings</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    ${stats.totalWinnings?.toLocaleString() || '0'}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                        <div className="flex items-center">
                            <Heart className="text-red-600" size={32} />
                            <div className="ml-4">
                                <p className="text-sm text-gray-600">Charity Contribution</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {dashboardData.charityContribution || 10}%
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                        <div className="flex items-center">
                            <DollarSign className="text-green-600" size={32} />
                            <div className="ml-4">
                                <p className="text-sm text-gray-600">Average Score</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {stats.averageScore || 'N/A'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-900">Your Scores</h2>
                            {subscription && (
                                <button
                                    onClick={() => setShowScoreModal(true)}
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center"
                                >
                                    <Plus size={16} className="mr-2" />
                                    Add Score
                                </button>
                            )}
                        </div>

                        {scores?.length === 0 ? (
                            <div className="text-center py-8">
                                <Trophy className="mx-auto text-gray-400 mb-4" size={48} />
                                <p className="text-gray-600">No scores recorded yet</p>
                                {subscription && (
                                    <button
                                        onClick={() => setShowScoreModal(true)}
                                        className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 mt-4"
                                    >
                                        Add Your First Score
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {scores?.map((score) => (
                                    <div key={score._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div>
                                            <span className="font-semibold text-lg">{score.value}</span>
                                            <span className="text-gray-600 ml-2">
                                                {new Date(score.date).toLocaleDateString()}
                                            </span>
                                        </div>
                                        {subscription && (
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => {
                                                        setEditingScore(score);
                                                        setShowScoreModal(true);
                                                    }}
                                                    className="text-blue-600 hover:text-blue-800 transition-colors duration-200"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteScore(score._id)}
                                                    className="text-red-600 hover:text-red-800 transition-colors duration-200"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}

                                {scores?.length < 5 && subscription && (
                                    <div className="text-center py-4 border-2 border-dashed border-gray-300 rounded-lg">
                                        <p className="text-gray-600 mb-2">
                                            You need {5 - scores.length} more score{5 - scores.length !== 1 ? 's' : ''} to participate in draws
                                        </p>
                                        <button
                                            onClick={() => setShowScoreModal(true)}
                                            className="text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200"
                                        >
                                            Add Score
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="space-y-6">
                        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Selected Charity</h2>
                            {selectedCharity ? (
                                <div className="flex items-center space-x-4">
                                    <img
                                        src={selectedCharity.logo}
                                        alt={selectedCharity.name}
                                        className="w-16 h-16 object-cover rounded-lg"
                                    />
                                    <div className="flex-1">
                                        <h3 className="font-semibold">{selectedCharity.name}</h3>
                                        <p className="text-sm text-gray-600">
                                            {dashboardData.charityContribution || 10}% of your subscription
                                        </p>
                                    </div>
                                    <Link to="/charities" className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors duration-200">
                                        Change
                                    </Link>
                                </div>
                            ) : (
                                <div className="text-center py-4">
                                    <Heart className="mx-auto text-gray-400 mb-4" size={48} />
                                    <p className="text-gray-600 mb-4">No charity selected</p>
                                    <Link to="/charities" className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200">
                                        Choose Charity
                                    </Link>
                                </div>
                            )}
                        </div>

                        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Winnings</h2>
                            {winnings?.length === 0 ? (
                                <div className="text-center py-4">
                                    <Trophy className="mx-auto text-gray-400 mb-4" size={48} />
                                    <p className="text-gray-600">No winnings yet</p>
                                    <p className="text-sm text-gray-500 mt-2">
                                        Keep playing and good luck in the next draw!
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {winnings?.slice(0, 5).map((winning) => (
                                        <div key={winning._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <div>
                                                <span className="font-semibold">${winning.amount}</span>
                                                <span className="text-gray-600 ml-2">{winning.matchType}</span>
                                                <div className="text-sm text-gray-500">
                                                    Status: {winning.status}
                                                </div>
                                            </div>
                                            {winning.status === 'pending' && !winning.proofImage && (
                                                <button
                                                    onClick={() => {
                                                        setSelectedWinning(winning);
                                                        setShowProofModal(true);
                                                    }}
                                                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-1 px-3 rounded text-sm transition-colors duration-200 flex items-center"
                                                >
                                                    <Upload size={14} className="mr-1" />
                                                    Submit Proof
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {showScoreModal && (
                <ScoreModal
                    score={editingScore}
                    onSubmit={handleScoreSubmit}
                    onClose={() => {
                        setShowScoreModal(false);
                        setEditingScore(null);
                    }}
                />
            )}

            {showProofModal && (
                <ProofModal
                    winning={selectedWinning}
                    onSubmit={handleProofSubmit}
                    onClose={() => {
                        setShowProofModal(false);
                        setSelectedWinning(null);
                    }}
                />
            )}
        </div>
    );
};

export default Dashboard;