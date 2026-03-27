import { useState, useEffect } from 'react';
import { Play, Eye, BarChart3 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../utils/axiosUtil';

const AdminDraws = () => {
    const [draws, setDraws] = useState([]);
    const [loading, setLoading] = useState(true);
    const [simulation, setSimulation] = useState(null);
    const [showSimulation, setShowSimulation] = useState(false);
    const [runningDraw, setRunningDraw] = useState(false);

    useEffect(() => {
        fetchDraws();
    }, []);

    const fetchDraws = async () => {
        try {
            const response = await api.get('/admin/draws');
            setDraws(response.data.draws);
        } catch (error) {
            toast.error('Failed to fetch draws');
        } finally {
            setLoading(false);
        }
    };

    const handleSimulateDraw = async () => {
        try {
            const response = await api.post('/admin/draws/simulate');
            setSimulation(response.data);
            setShowSimulation(true);
        } catch (error) {
            toast.error('Failed to simulate draw');
        }
    };

    const handleRunDraw = async () => {
        if (!confirm('Are you sure you want to run the monthly draw? This action cannot be undone.')) {
            return;
        }

        setRunningDraw(true);
        try {
            await api.post('/admin/draws/run');
            toast.success('Draw completed successfully!');
            fetchDraws();
            setShowSimulation(false);
        } catch (error) {
            toast.error('Failed to run draw');
        } finally {
            setRunningDraw(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Draw Management</h1>
                    <p className="text-gray-600 mt-2">
                        Manage monthly draws and view results
                    </p>
                </div>
                <div className="flex space-x-3">
                    <button
                        onClick={handleSimulateDraw}
                        className="btn-secondary flex items-center"
                    >
                        <BarChart3 size={16} className="mr-2" />
                        Simulate Draw
                    </button>
                    <button
                        onClick={handleRunDraw}
                        disabled={runningDraw}
                        className="btn-primary flex items-center disabled:opacity-50"
                    >
                        <Play size={16} className="mr-2" />
                        {runningDraw ? 'Running...' : 'Run Monthly Draw'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <div className="card p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-6">Draw History</h2>

                        {draws.length === 0 ? (
                            <div className="text-center py-8">
                                <Play className="mx-auto text-gray-400 mb-4" size={48} />
                                <p className="text-gray-600">No draws have been run yet</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {draws.map((draw) => (
                                    <div key={draw._id} className="border border-gray-200 rounded-lg p-4">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h3 className="font-semibold text-gray-900">
                                                    {draw.month}/{draw.year} Draw
                                                </h3>
                                                <p className="text-sm text-gray-600">
                                                    {draw.totalParticipants} participants • ${draw.totalPrizePool.toLocaleString()} prize pool
                                                </p>
                                            </div>
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${draw.status === 'published' ? 'bg-green-100 text-green-800' :
                                                    draw.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                                                        'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                {draw.status}
                                            </span>
                                        </div>

                                        <div className="flex space-x-2 mb-4">
                                            <span className="text-sm font-medium text-gray-700">Winning Numbers:</span>
                                            {draw.drawNumbers.map((number, index) => (
                                                <div
                                                    key={index}
                                                    className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold"
                                                >
                                                    {number}
                                                </div>
                                            ))}
                                        </div>

                                        <div className="grid grid-cols-3 gap-4 text-sm">
                                            <div className="text-center p-2 bg-yellow-50 rounded">
                                                <div className="font-semibold text-yellow-800">5 Match</div>
                                                <div className="text-yellow-600">
                                                    {draw.prizeDistribution.fiveMatch.winners} winners
                                                </div>
                                                <div className="text-yellow-600">
                                                    ${draw.prizeDistribution.fiveMatch.amountPerWinner || 0} each
                                                </div>
                                            </div>

                                            <div className="text-center p-2 bg-blue-50 rounded">
                                                <div className="font-semibold text-blue-800">4 Match</div>
                                                <div className="text-blue-600">
                                                    {draw.prizeDistribution.fourMatch.winners} winners
                                                </div>
                                                <div className="text-blue-600">
                                                    ${draw.prizeDistribution.fourMatch.amountPerWinner || 0} each
                                                </div>
                                            </div>

                                            <div className="text-center p-2 bg-green-50 rounded">
                                                <div className="font-semibold text-green-800">3 Match</div>
                                                <div className="text-green-600">
                                                    {draw.prizeDistribution.threeMatch.winners} winners
                                                </div>
                                                <div className="text-green-600">
                                                    ${draw.prizeDistribution.threeMatch.amountPerWinner || 0} each
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div>
                    {showSimulation && simulation && (
                        <div className="card p-6 mb-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Draw Simulation</h2>

                            <div className="space-y-4">
                                <div className="flex space-x-2 mb-4">
                                    <span className="text-sm font-medium text-gray-700">Simulated Numbers:</span>
                                    {simulation.drawNumbers.map((number, index) => (
                                        <div
                                            key={index}
                                            className="w-8 h-8 bg-gray-600 text-white rounded-full flex items-center justify-center text-sm font-bold"
                                        >
                                            {number}
                                        </div>
                                    ))}
                                </div>

                                <div className="text-center p-3 bg-blue-50 rounded">
                                    <div className="text-lg font-bold text-blue-800">
                                        {simulation.totalParticipants}
                                    </div>
                                    <div className="text-sm text-blue-600">Total Participants</div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between items-center p-2 bg-yellow-50 rounded">
                                        <span className="font-medium text-yellow-800">5 Match Winners</span>
                                        <span className="font-bold text-yellow-600">{simulation.winners[5]}</span>
                                    </div>
                                    <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
                                        <span className="font-medium text-blue-800">4 Match Winners</span>
                                        <span className="font-bold text-blue-600">{simulation.winners[4]}</span>
                                    </div>
                                    <div className="flex justify-between items-center p-2 bg-green-50 rounded">
                                        <span className="font-medium text-green-800">3 Match Winners</span>
                                        <span className="font-bold text-green-600">{simulation.winners[3]}</span>
                                    </div>
                                </div>

                                {simulation.sampleWinners.length > 0 && (
                                    <div>
                                        <h4 className="font-medium text-gray-900 mb-2">Sample Winners:</h4>
                                        <div className="space-y-1 text-sm">
                                            {simulation.sampleWinners.slice(0, 5).map((winner, index) => (
                                                <div key={index} className="text-gray-600">
                                                    {winner.user} - {winner.matches} matches
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <button
                                    onClick={handleRunDraw}
                                    disabled={runningDraw}
                                    className="w-full btn-success disabled:opacity-50"
                                >
                                    {runningDraw ? 'Running Draw...' : 'Confirm & Run Draw'}
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="card p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Draw Instructions</h2>
                        <div className="space-y-3 text-sm text-gray-600">
                            <p>1. Click "Simulate Draw" to preview the results</p>
                            <p>2. Review the simulation results carefully</p>
                            <p>3. Click "Confirm & Run Draw" to execute the actual draw</p>
                            <p>4. Winners will be notified automatically via email</p>
                            <p>5. Winners must submit proof to claim prizes</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDraws;