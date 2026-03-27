import { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import {
    Users,
    Heart,
    Trophy,
    DollarSign,
    Settings,
    BarChart3,
    UserCheck,
    Play
} from 'lucide-react';
import api from '../utils/axiosUtil';
import AdminUsers from '../components/admin/AdminUsers';
import AdminCharities from '../components/admin/AdminCharities';
import AdminDraws from '../components/admin/AdminDraws';
import AdminWinners from '../components/admin/AdminWinners';

const AdminDashboard = () => {
    const location = useLocation();
    const [stats, setStats] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardStats();
    }, []);

    const fetchDashboardStats = async () => {
        try {
            const response = await api.get('/admin/dashboard');
            setStats(response.data);
        } catch (error) {
            console.error('Error fetching admin stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const navigation = [
        { name: 'Overview', href: '/admin', icon: BarChart3 },
        { name: 'Users', href: '/admin/users', icon: Users },
        { name: 'Charities', href: '/admin/charities', icon: Heart },
        { name: 'Draws', href: '/admin/draws', icon: Trophy },
        { name: 'Winners', href: '/admin/winners', icon: UserCheck }
    ];

    const isActive = (path) => {
        if (path === '/admin') {
            return location.pathname === '/admin';
        }
        return location.pathname.startsWith(path);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="flex">
                <div className="w-64 bg-white shadow-lg">
                    <div className="p-6">
                        <h2 className="text-xl font-bold text-gray-900">Admin Panel</h2>
                    </div>

                    <nav className="mt-6">
                        {navigation.map((item) => {
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.name}
                                    to={item.href}
                                    className={`flex items-center px-6 py-3 text-sm font-medium transition-colors ${isActive(item.href)
                                            ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600'
                                            : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                                        }`}
                                >
                                    <Icon size={20} className="mr-3" />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                <div className="flex-1 p-8">
                    <Routes>
                        <Route path="/" element={
                            <div>
                                <div className="mb-8">
                                    <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
                                    <p className="text-gray-600 mt-2">
                                        Monitor platform performance and manage system operations
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                                    <div className="card p-6">
                                        <div className="flex items-center">
                                            <Users className="text-blue-600" size={32} />
                                            <div className="ml-4">
                                                <p className="text-sm text-gray-600">Total Users</p>
                                                <p className="text-2xl font-bold text-gray-900">
                                                    {stats.totalUsers?.toLocaleString() || 0}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="card p-6">
                                        <div className="flex items-center">
                                            <UserCheck className="text-green-600" size={32} />
                                            <div className="ml-4">
                                                <p className="text-sm text-gray-600">Active Subscriptions</p>
                                                <p className="text-2xl font-bold text-gray-900">
                                                    {stats.activeSubscriptions?.toLocaleString() || 0}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="card p-6">
                                        <div className="flex items-center">
                                            <Heart className="text-red-600" size={32} />
                                            <div className="ml-4">
                                                <p className="text-sm text-gray-600">Active Charities</p>
                                                <p className="text-2xl font-bold text-gray-900">
                                                    {stats.totalCharities?.toLocaleString() || 0}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="card p-6">
                                        <div className="flex items-center">
                                            <Trophy className="text-yellow-600" size={32} />
                                            <div className="ml-4">
                                                <p className="text-sm text-gray-600">Total Draws</p>
                                                <p className="text-2xl font-bold text-gray-900">
                                                    {stats.totalDraws?.toLocaleString() || 0}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="card p-6">
                                        <div className="flex items-center">
                                            <DollarSign className="text-green-600" size={32} />
                                            <div className="ml-4">
                                                <p className="text-sm text-gray-600">Monthly Revenue</p>
                                                <p className="text-2xl font-bold text-gray-900">
                                                    ${stats.monthlyRevenue?.toLocaleString() || 0}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="card p-6">
                                        <div className="flex items-center">
                                            <Heart className="text-purple-600" size={32} />
                                            <div className="ml-4">
                                                <p className="text-sm text-gray-600">Charity Contributions</p>
                                                <p className="text-2xl font-bold text-gray-900">
                                                    ${stats.charityContributions?.toLocaleString() || 0}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    <div className="card p-6">
                                        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
                                        <div className="space-y-3">
                                            <Link to="/admin/draws" className="btn-primary w-full flex items-center justify-center">
                                                <Play size={16} className="mr-2" />
                                                Run Monthly Draw
                                            </Link>
                                            <Link to="/admin/charities" className="btn-secondary w-full">
                                                Add New Charity
                                            </Link>
                                            <Link to="/admin/users" className="btn-secondary w-full">
                                                Manage Users
                                            </Link>
                                        </div>
                                    </div>

                                    <div className="card p-6">
                                        <h2 className="text-xl font-bold text-gray-900 mb-4">System Status</h2>
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-600">Platform Status</span>
                                                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm">
                                                    Operational
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-600">Payment System</span>
                                                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm">
                                                    Active
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-600">Email Service</span>
                                                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm">
                                                    Active
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        } />
                        <Route path="/users" element={<AdminUsers />} />
                        <Route path="/charities" element={<AdminCharities />} />
                        <Route path="/draws" element={<AdminDraws />} />
                        <Route path="/winners" element={<AdminWinners />} />
                    </Routes>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;