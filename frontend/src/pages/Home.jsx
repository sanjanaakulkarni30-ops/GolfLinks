import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Heart, Users, DollarSign, ArrowRight } from 'lucide-react';
import useCharityStore from '../store/charityStore';
import useDrawStore from '../store/drawStore';

const Home = () => {
    const { featuredCharity, fetchFeaturedCharity } = useCharityStore();
    const { stats, fetchDrawStats } = useDrawStore();

    useEffect(() => {
        fetchFeaturedCharity();
        fetchDrawStats();
    }, [fetchFeaturedCharity, fetchDrawStats]);

    return (
        <div className="min-h-screen">
            <section className="bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 text-white py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h1 className="text-5xl md:text-6xl font-bold mb-6">
                            Golf for Good
                        </h1>
                        <p className="text-xl md:text-2xl mb-8 text-blue-100">
                            Play golf, support charities, win prizes
                        </p>
                        <p className="text-lg mb-10 text-blue-200 max-w-3xl mx-auto">
                            Join our community of golfers making a difference. Enter your scores,
                            participate in monthly draws, and help raise money for amazing causes.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link to="/register" className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors duration-200">
                                Start Playing for Good
                            </Link>
                            <Link to="/charities" className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-blue-600 transition-colors duration-200">
                                Explore Charities
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            How It Works
                        </h2>
                        <p className="text-xl text-gray-600">
                            Simple steps to make a difference while playing golf
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="text-center">
                            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Users className="text-blue-600" size={32} />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">1. Subscribe & Choose</h3>
                            <p className="text-gray-600">
                                Subscribe monthly or yearly and select your favorite charity to support
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Trophy className="text-green-600" size={32} />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">2. Play & Record</h3>
                            <p className="text-gray-600">
                                Enter your golf scores (Stableford format) after each round you play
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <DollarSign className="text-purple-600" size={32} />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">3. Win & Give</h3>
                            <p className="text-gray-600">
                                Participate in monthly draws, win prizes, and automatically donate to charity
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="py-16 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <div className="text-center">
                            <div className="text-3xl font-bold text-blue-600 mb-2">
                                {stats.totalUsers?.toLocaleString() || '0'}+
                            </div>
                            <div className="text-gray-600">Active Players</div>
                        </div>

                        <div className="text-center">
                            <div className="text-3xl font-bold text-green-600 mb-2">
                                ${stats.totalPrizesPaid?.toLocaleString() || '0'}
                            </div>
                            <div className="text-gray-600">Prizes Awarded</div>
                        </div>

                        <div className="text-center">
                            <div className="text-3xl font-bold text-purple-600 mb-2">
                                ${stats.charityContributions?.toLocaleString() || '0'}
                            </div>
                            <div className="text-gray-600">Raised for Charity</div>
                        </div>

                        <div className="text-center">
                            <div className="text-3xl font-bold text-red-600 mb-2">
                                ${stats.currentPrizePool?.toLocaleString() || '0'}
                            </div>
                            <div className="text-gray-600">Current Prize Pool</div>
                        </div>
                    </div>
                </div>
            </section>

            {featuredCharity && (
                <section className="py-16 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                                Featured Charity
                            </h2>
                            <p className="text-xl text-gray-600">
                                This month's highlighted cause
                            </p>
                        </div>

                        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-8 max-w-4xl mx-auto">
                            <div className="flex flex-col md:flex-row items-center gap-8">
                                <img
                                    src={featuredCharity.logo}
                                    alt={featuredCharity.name}
                                    className="w-32 h-32 object-cover rounded-lg"
                                />
                                <div className="flex-1 text-center md:text-left">
                                    <h3 className="text-2xl font-bold mb-2">{featuredCharity.name}</h3>
                                    <p className="text-gray-600 mb-4">{featuredCharity.description}</p>
                                    <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                                        <div className="flex items-center text-green-600">
                                            <DollarSign size={20} className="mr-1" />
                                            <span className="font-semibold">
                                                ${featuredCharity.totalRaised?.toLocaleString() || '0'} raised
                                            </span>
                                        </div>
                                        <div className="flex items-center text-blue-600">
                                            <Users size={20} className="mr-1" />
                                            <span className="font-semibold">
                                                {featuredCharity.totalDonors || 0} supporters
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <Link
                                    to={`/charities/${featuredCharity._id}`}
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center"
                                >
                                    Learn More
                                    <ArrowRight size={16} className="ml-2" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            <section className="py-16 bg-gradient-to-br from-pink-500 via-red-500 to-pink-600 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold mb-6">
                        Ready to Make a Difference?
                    </h2>
                    <p className="text-xl mb-8 text-pink-100">
                        Join thousands of golfers who are already playing for good
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/register" className="bg-white text-pink-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors duration-200">
                            Get Started Today
                        </Link>
                        <Link to="/draws" className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-pink-600 transition-colors duration-200">
                            View Current Draws
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;