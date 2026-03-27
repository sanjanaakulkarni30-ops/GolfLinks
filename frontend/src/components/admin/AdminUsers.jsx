import { useState, useEffect } from 'react';
import { Search, Edit, Eye, UserCheck, UserX } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../utils/axiosUtil';

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedUser, setSelectedUser] = useState(null);
    const [showUserModal, setShowUserModal] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, [currentPage, searchTerm]);

    const fetchUsers = async () => {
        try {
            const params = new URLSearchParams({
                page: currentPage,
                limit: 20
            });

            if (searchTerm) {
                params.append('search', searchTerm);
            }

            const response = await api.get(`/admin/users?${params}`);
            setUsers(response.data.users);
            setTotalPages(response.data.totalPages);
        } catch (error) {
            toast.error('Failed to fetch users');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    const handleViewUser = (user) => {
        setSelectedUser(user);
        setShowUserModal(true);
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
                <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
                <p className="text-gray-600 mt-2">
                    Manage user accounts and subscriptions
                </p>
            </div>

            <div className="card p-6">
                <div className="flex justify-between items-center mb-6">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search users..."
                            className="input-field pl-10"
                            value={searchTerm}
                            onChange={handleSearch}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    User
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Subscription
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Charity
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Scores
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Joined
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {users.map((user) => (
                                <tr key={user._id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">
                                                {user.firstName} {user.lastName}
                                            </div>
                                            <div className="text-sm text-gray-500">{user.email}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {user.subscription ? (
                                            <div>
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${user.subscription.status === 'active'
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-red-100 text-red-800'
                                                    }`}>
                                                    {user.subscription.status}
                                                </span>
                                                <div className="text-xs text-gray-500 mt-1">
                                                    {user.subscription.plan}
                                                </div>
                                            </div>
                                        ) : (
                                            <span className="text-gray-400">No subscription</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {user.selectedCharity ? (
                                            <div className="text-sm text-gray-900">
                                                {user.selectedCharity.name}
                                            </div>
                                        ) : (
                                            <span className="text-gray-400">None selected</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">
                                            {user.scores?.length || 0}/5
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(user.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <button
                                            onClick={() => handleViewUser(user)}
                                            className="text-blue-600 hover:text-blue-900 mr-3"
                                        >
                                            <Eye size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {totalPages > 1 && (
                    <div className="flex justify-center mt-6">
                        <div className="flex space-x-2">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                <button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    className={`px-3 py-2 rounded ${currentPage === page
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                        }`}
                                >
                                    {page}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {showUserModal && selectedUser && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-screen overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold">User Details</h2>
                            <button
                                onClick={() => setShowUserModal(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                ×
                            </button>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-semibold mb-3">Personal Information</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Name</label>
                                        <p className="text-gray-900">{selectedUser.firstName} {selectedUser.lastName}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Email</label>
                                        <p className="text-gray-900">{selectedUser.email}</p>
                                    </div>
                                </div>
                            </div>

                            {selectedUser.subscription && (
                                <div>
                                    <h3 className="text-lg font-semibold mb-3">Subscription</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Plan</label>
                                            <p className="text-gray-900">{selectedUser.subscription.plan}</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Status</label>
                                            <p className="text-gray-900">{selectedUser.subscription.status}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div>
                                <h3 className="text-lg font-semibold mb-3">Golf Scores</h3>
                                {selectedUser.scores && selectedUser.scores.length > 0 ? (
                                    <div className="space-y-2">
                                        {selectedUser.scores.map((score, index) => (
                                            <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                                <span>Score: {score.value}</span>
                                                <span className="text-sm text-gray-500">
                                                    {new Date(score.date).toLocaleDateString()}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-500">No scores recorded</p>
                                )}
                            </div>

                            {selectedUser.winnings && selectedUser.winnings.length > 0 && (
                                <div>
                                    <h3 className="text-lg font-semibold mb-3">Winnings</h3>
                                    <div className="space-y-2">
                                        {selectedUser.winnings.map((winning, index) => (
                                            <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                                <span>${winning.amount} ({winning.matchType})</span>
                                                <span className={`px-2 py-1 text-xs rounded-full ${winning.status === 'paid' ? 'bg-green-100 text-green-800' :
                                                        winning.status === 'verified' ? 'bg-blue-100 text-blue-800' :
                                                            'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                    {winning.status}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminUsers;