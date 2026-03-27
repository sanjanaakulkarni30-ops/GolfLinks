import { useState } from 'react';
import { X, Upload } from 'lucide-react';

const ProofModal = ({ winning, onSubmit, onClose }) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [preview, setPreview] = useState(null);

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                alert('File size must be less than 5MB');
                return;
            }

            if (!file.type.startsWith('image/')) {
                alert('Please select an image file');
                return;
            }

            setSelectedFile(file);

            const reader = new FileReader();
            reader.onload = (e) => setPreview(e.target.result);
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!selectedFile) {
            alert('Please select a file');
            return;
        }
        onSubmit(selectedFile);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Submit Proof of Scores</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <X size={24} />
                    </button>
                </div>

                <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                    <h3 className="font-semibold text-blue-800">Winning Details</h3>
                    <p className="text-blue-700">
                        Amount: ${winning.amount} ({winning.matchType})
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Upload Screenshot of Your Scores
                        </label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                            {preview ? (
                                <div className="space-y-4">
                                    <img
                                        src={preview}
                                        alt="Preview"
                                        className="max-w-full h-48 object-contain mx-auto rounded"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSelectedFile(null);
                                            setPreview(null);
                                        }}
                                        className="text-red-600 hover:text-red-800 text-sm"
                                    >
                                        Remove Image
                                    </button>
                                </div>
                            ) : (
                                <div>
                                    <Upload className="mx-auto text-gray-400 mb-4" size={48} />
                                    <p className="text-gray-600 mb-2">
                                        Click to upload or drag and drop
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        PNG, JPG up to 5MB
                                    </p>
                                </div>
                            )}
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileSelect}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                            Please upload a clear screenshot showing your golf scores that match your winning numbers.
                        </p>
                    </div>

                    <div className="flex space-x-3 pt-4">
                        <button
                            type="submit"
                            disabled={!selectedFile}
                            className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Submit Proof
                        </button>
                        <button type="button" onClick={onClose} className="btn-secondary flex-1">
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProofModal;