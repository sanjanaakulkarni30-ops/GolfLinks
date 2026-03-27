import { useState, useEffect } from 'react';
import { Check, X, Eye, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../utils/axiosUtil';

const AdminWinners = () => {
    const [winners, setWinners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [selectedWinner, setSelectedWinner] = useState(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        fetchWinners();
    }, [filter]);

    const fetchWinners = async () => {
        try {
            const response = await api.get(`/admin/winners?status=${filter}`);
            setWinners(response.data);
        } catch (error) {
            toast.error('Failed to fetch winners');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyWinner = async (userId, winningId, status) => {
        try {
            await api.put(`/admin/winners/${userId}/${winningId}/verify`, { status });
            toast.success(`Winner ${status} successfully`);
            fetchWinners();
        } catch (error) {
            toast.error(`Failed to ${status} winner`);
        }
    };

    const handlePayWinner = async (userId, winningId) => {
        if (!confirm('Mark this winner as paid?')) return;

        try {
            await api.put(`/admin/winners/${userId}/${winningId}/pay`);
            toast.success('Winner marked as paid');
            fetchWinners();
        } catch (error) {
            toast.error('Failed to mark winner as paid');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'verified': return 'bg-blue-100 text-blue-800';
            case 'paid': return 'bg-green-100 text-green-800';
            case 'rejected': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
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
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Winner Management</h1>
                <p className="text-gray-600 mt-2">
                    Verify winners and manage prize payouts
                </p>
            </div>

            <div className="card p-6">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex space-x-2">
                        {['all', 'pending', 'verified', 'paid', 'rejected'].map((status) => (
                            <button
                                key={status}
                                onClick={() => setFilter(status)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === status
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                            >
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                {winners.length === 0 ? (
                    <div className="text-center py-8">
                        <DollarSign className="mx-auto text-gray-400 mb-4" size={48} />
                        <p className="text-gray-600">No winners found for the selected filter</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Winner
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Draw
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Prize
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {winners.map((winner) => (
                                    <tr key={winner._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">
                                                    {winner.user.firstName} {winner.user.lastName}
                                                </div>
                                                <div className="text-sm text-gray-500">{winner.user.email}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {winner.draw?.month}/{winner.draw?.year}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {winner.matchType}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                ${winner.amount.toLocaleString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(winner.status)}`}>
                                                {winner.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => {
                                                        setSelectedWinner(winner);
                                                        setShowModal(true);
                                                    }}
                                                    className="text-blue-600 hover:text-blue-900"
                                                >
                                                    <Eye size={16} />
                                                </button>

                                                {winner.status === 'pending' && winner.proofImage && (
                                                    <>
                                                        <button
                                                            onClick={() => handleVerifyWinner(winner.user._id, winner._id, 'verified')}
                                                            className="text-green-600 hover:text-green-900"
                                                        >
                                                            <Check size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleVerifyWinner(winner.user._id, winner._id, 'rejected')}
                                                            className="text-red-600 hover:text-red-900"
                                                        >
                                                            <X size={16} />
                                                        </button>
                                                    </>
                                                )}

                                                {winner.status === 'verified' && (
                                                    <button
                                                        onClick={() => handlePayWinner(winner.user._id, winner._id)}
                                                        className="text-green-600 hover:text-green-900"
                                                    >
                                                        <DollarSign size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {showModal && selectedWinner && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-screen overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold">Winner Details</h2>
                            <button
                                onClick={() => setShowModal(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                ×
                            </button>
                        </div>

                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Winner</label>
                                    <p className="text-gray-900">
                                        {selectedWinner.user.firstName} {selectedWinner.user.lastName}
                                    </p>
                                    <p className="text-sm text-gray-500">{selectedWinner.user.email}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Prize Amount</label>
                                    <p className="text-2xl font-bold text-green-600">
                                        ${selectedWinner.amount.toLocaleString()}
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Draw</label>
                                    <p className="text-gray-900">
                                        {selectedWinner.draw?.month}/{selectedWinner.draw?.year}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Match Type</label>
                                    <p className="text-gray-900">{selectedWinner.matchType}</p>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                                <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(selectedWinner.status)}`}>
                                    {selectedWinner.status}
                                </span>
                            </div>

                            {selectedWinner.draw?.drawNumbers && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Winning Numbers</label>
                                    <div className="flex space-x-2">
                                        {selectedWinner.draw.drawNumbers.map((number, index) => (
                                            <div
                                                key={index}
                                                className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold"
                                            >
                                                {number}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {selectedWinner.proofImage && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Proof of Scores</label>
                                    <img
                                        src={selectedWinner.proofImage}
                                        alt="Proof of scores"
                                        className="max-w-full h-64 object-contain border border-gray-300 rounded"
                                    />
                                </div>
                            )}

                            {selectedWinner.status === 'pending' && selectedWinner.proofImage && (
                                <div className="flex space-x-3">
                                    <button
                                        onClick={() => {
                                            handleVerifyWinner(selectedWinner.user._id, selectedWinner._id, 'verified');
                                            setShowModal(false);
                                        }}
                                        className="btn-success flex-1"
                                    >
                                        Verify Winner
                                    </button>
                                    <button
                                        onClick={() => {
                                            handleVerifyWinner(selectedWinner.user._id, selectedWinner._id, 'rejected');
                                            setShowModal(false);
                                        }}
                                        className="btn-danger flex-1"
                                    >
                                        Reject Winner
                                    </button>
                                </div>
                            )}

                            {selectedWinner.status === 'verified' && (
                                <button
                                    onClick={() => {
                                        handlePayWinner(selectedWinner.user._id, selectedWinner._id);
                                        setShowModal(false);
                                    }}
                                    className="btn-success w-full"
                                >
                                    Mark as Paid
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminWinners;