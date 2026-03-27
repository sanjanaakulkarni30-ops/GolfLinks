import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../utils/axiosUtil';

const AdminCharities = () => {
    const [charities, setCharities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingCharity, setEditingCharity] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        website: '',
        category: '',
        registrationNumber: '',
        isFeatured: false
    });
    const [logoFile, setLogoFile] = useState(null);

    useEffect(() => {
        fetchCharities();
    }, []);

    const fetchCharities = async () => {
        try {
            const response = await api.get('/admin/charities');
            setCharities(response.data.charities);
        } catch (error) {
            toast.error('Failed to fetch charities');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const formDataToSend = new FormData();
            Object.keys(formData).forEach(key => {
                formDataToSend.append(key, formData[key]);
            });

            if (logoFile) {
                formDataToSend.append('logo', logoFile);
            }

            if (editingCharity) {
                await api.put(`/admin/charities/${editingCharity._id}`, formDataToSend, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                toast.success('Charity updated successfully');
            } else {
                await api.post('/admin/charities', formDataToSend, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                toast.success('Charity created successfully');
            }

            setShowModal(false);
            setEditingCharity(null);
            resetForm();
            fetchCharities();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to save charity');
        }
    };

    const handleEdit = (charity) => {
        setEditingCharity(charity);
        setFormData({
            name: charity.name,
            description: charity.description,
            website: charity.website,
            category: charity.category,
            registrationNumber: charity.registrationNumber,
            isFeatured: charity.isFeatured
        });
        setShowModal(true);
    };

    const handleDelete = async (charityId) => {
        if (!confirm('Are you sure you want to deactivate this charity?')) return;

        try {
            await api.delete(`/admin/charities/${charityId}`);
            toast.success('Charity deactivated successfully');
            fetchCharities();
        } catch (error) {
            toast.error('Failed to deactivate charity');
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            website: '',
            category: '',
            registrationNumber: '',
            isFeatured: false
        });
        setLogoFile(null);
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
                    <h1 className="text-3xl font-bold text-gray-900">Charity Management</h1>
                    <p className="text-gray-600 mt-2">
                        Manage charities and their information
                    </p>
                </div>
                <button
                    onClick={() => {
                        resetForm();
                        setShowModal(true);
                    }}
                    className="btn-primary flex items-center"
                >
                    <Plus size={16} className="mr-2" />
                    Add Charity
                </button>
            </div>

            <div className="card p-6">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Charity
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Category
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Total Raised
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Donors
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
                            {charities.map((charity) => (
                                <tr key={charity._id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <img
                                                src={charity.logo}
                                                alt={charity.name}
                                                className="w-10 h-10 object-cover rounded-lg mr-3"
                                            />
                                            <div>
                                                <div className="text-sm font-medium text-gray-900 flex items-center">
                                                    {charity.name}
                                                    {charity.isFeatured && (
                                                        <Star className="ml-2 text-yellow-500" size={16} />
                                                    )}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    Reg: {charity.registrationNumber}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                            {charity.category}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        ${charity.totalRaised.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {charity.totalDonors}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${charity.isActive
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-red-100 text-red-800'
                                            }`}>
                                            {charity.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <button
                                            onClick={() => handleEdit(charity)}
                                            className="text-blue-600 hover:text-blue-900 mr-3"
                                        >
                                            <Edit size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(charity._id)}
                                            className="text-red-600 hover:text-red-900"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-screen overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold">
                                {editingCharity ? 'Edit Charity' : 'Add New Charity'}
                            </h2>
                            <button
                                onClick={() => {
                                    setShowModal(false);
                                    setEditingCharity(null);
                                    resetForm();
                                }}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                ×
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Charity Name
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        className="input-field"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Category
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        className="input-field"
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Description
                                </label>
                                <textarea
                                    required
                                    rows={4}
                                    className="input-field"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Website
                                    </label>
                                    <input
                                        type="url"
                                        required
                                        className="input-field"
                                        value={formData.website}
                                        onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Registration Number
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        className="input-field"
                                        value={formData.registrationNumber}
                                        onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Logo
                                </label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="input-field"
                                    onChange={(e) => setLogoFile(e.target.files[0])}
                                    required={!editingCharity}
                                />
                            </div>

                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="isFeatured"
                                    className="mr-2"
                                    checked={formData.isFeatured}
                                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                                />
                                <label htmlFor="isFeatured" className="text-sm font-medium text-gray-700">
                                    Featured Charity
                                </label>
                            </div>

                            <div className="flex space-x-3 pt-4">
                                <button type="submit" className="btn-primary flex-1">
                                    {editingCharity ? 'Update Charity' : 'Add Charity'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowModal(false);
                                        setEditingCharity(null);
                                        resetForm();
                                    }}
                                    className="btn-secondary flex-1"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminCharities;