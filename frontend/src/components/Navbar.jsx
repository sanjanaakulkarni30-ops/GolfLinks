import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, User, LogOut, Settings } from 'lucide-react';
import useAuthStore from '../store/authStore';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
        setShowUserMenu(false);
    };

    return (
        <nav className="bg-white shadow-lg sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link to="/" className="flex-shrink-0 flex items-center">
                            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                GolfCharity
                            </span>
                        </Link>
                    </div>

                    <div className="hidden md:flex items-center space-x-8">
                        <Link to="/charities" className="text-gray-700 hover:text-blue-600 transition-colors duration-200">
                            Charities
                        </Link>
                        <Link to="/draws" className="text-gray-700 hover:text-blue-600 transition-colors duration-200">
                            Draws
                        </Link>

                        {user ? (
                            <div className="relative">
                                <button
                                    onClick={() => setShowUserMenu(!showUserMenu)}
                                    className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors duration-200"
                                >
                                    <User size={20} />
                                    <span>{user.firstName}</span>
                                </button>

                                {showUserMenu && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                                        <Link
                                            to="/dashboard"
                                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                                            onClick={() => setShowUserMenu(false)}
                                        >
                                            <Settings size={16} className="mr-2" />
                                            Dashboard
                                        </Link>
                                        {user.isAdmin && (
                                            <Link
                                                to="/admin"
                                                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                                                onClick={() => setShowUserMenu(false)}
                                            >
                                                <Settings size={16} className="mr-2" />
                                                Admin Panel
                                            </Link>
                                        )}
                                        <button
                                            onClick={handleLogout}
                                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                                        >
                                            <LogOut size={16} className="mr-2" />
                                            Logout
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center space-x-4">
                                <Link
                                    to="/login"
                                    className="text-gray-700 hover:text-blue-600 transition-colors duration-200"
                                >
                                    Login
                                </Link>
                                <Link
                                    to="/register"
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                                >
                                    Get Started
                                </Link>
                            </div>
                        )}
                    </div>

                    <div className="md:hidden flex items-center">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="text-gray-700 hover:text-blue-600 transition-colors duration-200"
                        >
                            {isOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {isOpen && (
                <div className="md:hidden">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200">
                        <Link
                            to="/charities"
                            className="block px-3 py-2 text-gray-700 hover:text-blue-600 transition-colors duration-200"
                            onClick={() => setIsOpen(false)}
                        >
                            Charities
                        </Link>
                        <Link
                            to="/draws"
                            className="block px-3 py-2 text-gray-700 hover:text-blue-600 transition-colors duration-200"
                            onClick={() => setIsOpen(false)}
                        >
                            Draws
                        </Link>

                        {user ? (
                            <>
                                <Link
                                    to="/dashboard"
                                    className="block px-3 py-2 text-gray-700 hover:text-blue-600 transition-colors duration-200"
                                    onClick={() => setIsOpen(false)}
                                >
                                    Dashboard
                                </Link>
                                {user.isAdmin && (
                                    <Link
                                        to="/admin"
                                        className="block px-3 py-2 text-gray-700 hover:text-blue-600 transition-colors duration-200"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        Admin Panel
                                    </Link>
                                )}
                                <button
                                    onClick={handleLogout}
                                    className="block w-full text-left px-3 py-2 text-gray-700 hover:text-blue-600 transition-colors duration-200"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link
                                    to="/login"
                                    className="block px-3 py-2 text-gray-700 hover:text-blue-600 transition-colors duration-200"
                                    onClick={() => setIsOpen(false)}
                                >
                                    Login
                                </Link>
                                <Link
                                    to="/register"
                                    className="block px-3 py-2 text-blue-600 font-medium transition-colors duration-200"
                                    onClick={() => setIsOpen(false)}
                                >
                                    Get Started
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;