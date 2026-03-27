import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Heart, Users, DollarSign, Filter } from 'lucide-react';
import useCharityStore from '../store/charityStore';

const Charities = () => {
    const {
        charities,
        categories,
        isLoading,
        fetchCharities,
        fetchCategories
    } = useCharityStore();

    const [filters, setFilters] = useState({
        search: '',
        category: '',
        featured: false
    });

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    useEffect(() => {
        fetchCharities(filters);
    }, [filters, fetchCharities]);

    const handleSearchChange = (e) => {
        setFilters({ ...filters, search: e.target.value });
    };

    const handleCategoryChange = (category) => {
        setFilters({ ...filters, category: category === filters.category ? '' : category });
    };

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
                        Support Amazing Causes
                    </h1>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                        Choose from our carefully selected charities and make a difference with every golf round you play.
                    </p>
                </div>

                <div className="mb-8 space-y-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search charities..."
                                className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                value={filters.search}
                                onChange={handleSearchChange}
                            />
                        </div>

                        <button
                            onClick={() => setFilters({ ...filters, featured: !filters.featured })}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${filters.featured
                                    ? 'bg-yellow-500 text-white'
                                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                                }`}
                        >
                            <Filter size={16} className="inline mr-2" />
                            Featured Only
                        </button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {categories.map((category) => (
                            <button
                                key={category}
                                onClick={() => handleCategoryChange(category)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${filters.category === category
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                                    }`}
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                </div>

                {charities.length === 0 ? (
                    <div className="text-center py-12">
                        <Heart className="mx-auto text-gray-400 mb-4" size={64} />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No charities found</h3>
                        <p className="text-gray-600">Try adjusting your search or filters.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {charities.map((charity) => (
                            <div key={charity._id} className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-200">
                                {charity.isFeatured && (
                                    <div className="bg-yellow-500 text-white text-xs font-bold px-3 py-1 absolute top-4 left-4 rounded-full z-10">
                                        FEATURED
                                    </div>
                                )}

                                <div className="relative h-48 bg-gray-200">
                                    <img
                                        src={charity.logo}
                                        alt={charity.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>

                                <div className="p-6">
                                    <div className="flex items-start justify-between mb-3">
                                        <h3 className="text-xl font-bold text-gray-900 line-clamp-2">
                                            {charity.name}
                                        </h3>
                                    </div>

                                    <p className="text-gray-600 mb-4 line-clamp-3">
                                        {charity.description}
                                    </p>

                                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                                        <div className="flex items-center">
                                            <DollarSign size={16} className="mr-1" />
                                            <span>${charity.totalRaised?.toLocaleString() || '0'} raised</span>
                                        </div>
                                        <div className="flex items-center">
                                            <Users size={16} className="mr-1" />
                                            <span>{charity.totalDonors || 0} supporters</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                                            {charity.category}
                                        </span>
                                        <Link
                                            to={`/charities/${charity._id}`}
                                            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 text-sm"
                                        >
                                            Learn More
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Charities;