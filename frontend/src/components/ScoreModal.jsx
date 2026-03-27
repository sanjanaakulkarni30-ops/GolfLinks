import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const ScoreModal = ({ score, onSubmit, onClose }) => {
    const [formData, setFormData] = useState({
        score: '',
        date: ''
    });

    useEffect(() => {
        if (score) {
            setFormData({
                score: score.value.toString(),
                date: new Date(score.date).toISOString().split('T')[0]
            });
        } else {
            setFormData({
                score: '',
                date: new Date().toISOString().split('T')[0]
            });
        }
    }, [score]);

    const handleSubmit = (e) => {
        e.preventDefault();

        const scoreValue = parseInt(formData.score);
        if (scoreValue < 1 || scoreValue > 45) {
            alert('Score must be between 1 and 45');
            return;
        }

        onSubmit({
            score: scoreValue,
            date: formData.date
        });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">
                        {score ? 'Edit Score' : 'Add New Score'}
                    </h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Score (Stableford Points)
                        </label>
                        <input
                            type="number"
                            min="1"
                            max="45"
                            required
                            className="input-field"
                            value={formData.score}
                            onChange={(e) => setFormData({ ...formData, score: e.target.value })}
                            placeholder="Enter your score (1-45)"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Enter your Stableford points for the round
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Date Played
                        </label>
                        <input
                            type="date"
                            required
                            className="input-field"
                            value={formData.date}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            max={new Date().toISOString().split('T')[0]}
                        />
                    </div>

                    <div className="flex space-x-3 pt-4">
                        <button type="submit" className="btn-primary flex-1">
                            {score ? 'Update Score' : 'Add Score'}
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

export default ScoreModal;