import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, Users, DollarSign, ExternalLink, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import useCharityStore from '../store/charityStore';
import useAuthStore from '../store/authStore';

const CharityDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const {
        selectedCharity,
        isLoading,
        fetchCharityById,
        selectCharity,
        makeDonation
    } = useCharityStore();

    const [donationAmount, setDonationAmount] = useState('');
    const [showDonationModal, setShowDonationModal] = useState(false);

    useEffect(() => {
        fetchCharityById(id);
    }, [id, fetchCharityById]);

    const handleSelectCharity = async () => {
        if (!user) {
            toast.error('Please login to select a charity');
            navigate('/login');
            return;
        }

        const result = await selectCharity(id);
        if (result.success) {
            toast.success('Charity selected successfully!');
        } else {
            toast.error('Failed to select charity');
        }
    };

    const handleDonate = async () => {
        if (!user) {
            toast.error('Please login to donate');
            navigate('/login');
            return;
        }

        const amount = parseFloat(donationAmount);
        if (!amount || amount < 1) {
            toast.error('Please enter a valid donation amount');
            return;
        }

        const result = await makeDonation(id, amount);
        if (result.success) {
            // In a real app, redirect to Razorpay checkout or handle payment
            toast.success('Donation initiated successfully!');
            setShowDonationModal(false);
            setDonationAmount('');
        } else {
            toast.error('Failed to process donation');
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!selectedCharity) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Charity not found</h2>
                    <button
                        onClick={() => navigate('/charities')}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                    >
                        Back to Charities
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="relative h-64 md:h-96 bg-gray-200">
                <img
                    src={selectedCharity.images?.[0] || selectedCharity.logo}
                    alt={selectedCharity.name}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-40"></div>
                <div className="absolute top-4 left-4">
                    <button
                        onClick={() => navigate('/charities')}
                        className="bg-white bg-opacity-90 hover:bg-opacity-100 text-gray-900 p-2 rounded-full transition-all duration-200"
                    >
                        <ArrowLeft size={24} />
                    </button>
                </div>
                {selectedCharity.isFeatured && (
                    <div className="absolute top-4 right-4 bg-yellow-500 text-white text-sm font-bold px-3 py-1 rounded-full">
                        FEATURED
                    </div>
                )}
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-8">
                            <div className="flex items-start gap-6 mb-6">
                                <img
                                    src={selectedCharity.logo}
                                    alt={selectedCharity.name}
                                    className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                                />
                                <div className="flex-1">
                                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                        {selectedCharity.name}
                                    </h1>
                                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                            {selectedCharity.category}
                                        </span>
                                        <span>Reg: {selectedCharity.registrationNumber}</span>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="flex items-center text-green-600">
                                            <DollarSign size={20} className="mr-1" />
                                            <span className="font-semibold">
                                                ${selectedCharity.totalRaised?.toLocaleString() || '0'} raised
                                            </span>
                                        </div>
                                        <div className="flex items-center text-blue-600">
                                            <Users size={20} className="mr-1" />
                                            <span className="font-semibold">
                                                {selectedCharity.totalDonors || 0} supporters
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="prose max-w-none">
                                <h2 className="text-xl font-bold text-gray-900 mb-4">About This Charity</h2>
                                <p className="text-gray-700 leading-relaxed mb-6">
                                    {selectedCharity.description}
                                </p>

                                <div className="flex items-center gap-4 mb-6">
                                    <a
                                        href={selectedCharity.website}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center"
                                    >
                                        <ExternalLink size={16} className="mr-2" />
                                        Visit Website
                                    </a>
                                </div>
                            </div>

                            {selectedCharity.events && selectedCharity.events.length > 0 && (
                                <div className="mt-8">
                                    <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Events</h2>
                                    <div className="space-y-4">
                                        {selectedCharity.events.map((event, index) => (
                                            <div key={index} className="border border-gray-200 rounded-lg p-4">
                                                <div className="flex items-start gap-4">
                                                    {event.image && (
                                                        <img
                                                            src={event.image}
                                                            alt={event.title}
                                                            className="w-16 h-16 object-cover rounded-lg"
                                                        />
                                                    )}
                                                    <div className="flex-1">
                                                        <h3 className="font-semibold text-gray-900">{event.title}</h3>
                                                        <p className="text-gray-600 text-sm mb-2">{event.description}</p>
                                                        <div className="flex items-center text-gray-500 text-sm">
                                                            <Calendar size={14} className="mr-1" />
                                                            {new Date(event.date).toLocaleDateString()}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Support This Charity</h2>

                            <div className="space-y-4">
                                <button
                                    onClick={handleSelectCharity}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
                                >
                                    <Heart size={16} className="mr-2" />
                                    Select as My Charity
                                </button>

                                <div className="text-center text-sm text-gray-600">
                                    <p>By selecting this charity, a portion of your subscription will automatically support their cause.</p>
                                </div>

                                <div className="border-t pt-4">
                                    <button
                                        onClick={() => setShowDonationModal(true)}
                                        className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                                    >
                                        Make Direct Donation
                                    </button>
                                </div>
                            </div>
                        </div>

                        {selectedCharity.images && selectedCharity.images.length > 1 && (
                            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Gallery</h3>
                                <div className="grid grid-cols-2 gap-2">
                                    {selectedCharity.images.slice(1, 5).map((image, index) => (
                                        <img
                                            key={index}
                                            src={image}
                                            alt={`${selectedCharity.name} ${index + 1}`}
                                            className="w-full h-20 object-cover rounded-lg"
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {showDonationModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                        <h2 className="text-xl font-bold mb-4">Make a Donation</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Donation Amount ($)
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    step="0.01"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    value={donationAmount}
                                    onChange={(e) => setDonationAmount(e.target.value)}
                                    placeholder="Enter amount"
                                />
                            </div>
                            <div className="flex space-x-3">
                                <button
                                    onClick={handleDonate}
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex-1"
                                >
                                    Donate Now
                                </button>
                                <button
                                    onClick={() => setShowDonationModal(false)}
                                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex-1"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CharityDetail;