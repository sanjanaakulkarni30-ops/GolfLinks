import { Link } from 'react-router-dom';
import { Heart, Mail, Phone } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-gray-900 text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="col-span-1 md:col-span-2">
                        <div className="flex items-center mb-4">
                            <span className="text-2xl font-bold">GolfCharity</span>
                            <Heart className="ml-2 text-red-500" size={24} />
                        </div>
                        <p className="text-gray-300 mb-4">
                            Combining your passion for golf with making a difference.
                            Play, compete, and support charities while winning amazing prizes.
                        </p>
                        <div className="flex space-x-4">
                            <div className="flex items-center text-gray-300">
                                <Mail size={16} className="mr-2" />
                                <span>support@golfcharity.com</span>
                            </div>
                            <div className="flex items-center text-gray-300">
                                <Phone size={16} className="mr-2" />
                                <span>+1 (555) 123-4567</span>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link to="/charities" className="text-gray-300 hover:text-white transition-colors">
                                    Browse Charities
                                </Link>
                            </li>
                            <li>
                                <Link to="/draws" className="text-gray-300 hover:text-white transition-colors">
                                    Current Draws
                                </Link>
                            </li>
                            <li>
                                <Link to="/subscription" className="text-gray-300 hover:text-white transition-colors">
                                    Subscription Plans
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold mb-4">Support</h3>
                        <ul className="space-y-2">
                            <li>
                                <a href="#" className="text-gray-300 hover:text-white transition-colors">
                                    How It Works
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-gray-300 hover:text-white transition-colors">
                                    FAQ
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-gray-300 hover:text-white transition-colors">
                                    Contact Us
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-gray-300 hover:text-white transition-colors">
                                    Terms of Service
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-gray-800 mt-8 pt-8 text-center">
                    <p className="text-gray-300">
                        © 2026 GolfCharity Platform. All rights reserved. Built with ❤️ for golfers who care.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;