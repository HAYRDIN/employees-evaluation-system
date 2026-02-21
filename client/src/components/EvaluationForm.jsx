import React, { useState, useEffect } from 'react';
import api from '../api';

const EvaluationForm = ({ employee, onSave, onScoreUpdate }) => {
    const [criteria, setCriteria] = useState([]);
    const [scores, setScores] = useState({});
    const [notes, setNotes] = useState('');

    useEffect(() => {
        fetchCriteria();
    }, []);

    useEffect(() => {
        // Reset form when employee changes
        setScores({});
        setNotes('');
    }, [employee]);

    // Recalculate score whenever individual scores change
    useEffect(() => {
        calculateTotalScore();
    }, [scores, criteria]);

    const fetchCriteria = async () => {
        try {
            const res = await api.get('/api/criteria');
            setCriteria(res.data.data);
            // Initialize scores
            const initialScores = {};
            res.data.data.forEach(c => initialScores[c.id] = 0);
            setScores(initialScores);
        } catch (error) {
            console.error('Error fetching criteria:', error);
        }
    };

    const calculateTotalScore = () => {
        if (criteria.length === 0) return;

        let totalWeight = 0;
        let weightedSum = 0;

        criteria.forEach(crit => {
            totalWeight += crit.max_score * crit.weight; // Max possible points
            const currentScore = scores[crit.id] || 0;
            weightedSum += currentScore * crit.weight;
        });

        const percentage = totalWeight > 0 ? (weightedSum / totalWeight) * 100 : 0;
        onScoreUpdate(percentage);
    };

    const handleScoreChange = (criteriaId, value) => {
        setScores(prev => ({
            ...prev,
            [criteriaId]: parseInt(value)
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({
            scores_json: scores,
            notes,
            date: new Date().toISOString()
        });
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-6">Evaluation Criteria</h3>
            <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                    {criteria.map((crit) => (
                        <div key={crit.id} className="border-b pb-4 last:border-0 last:pb-0">
                            <div className="flex justify-between items-center mb-2">
                                <label className="font-medium text-gray-700">{crit.name}</label>
                                <div className="flex gap-1">
                                    {[1, 2, 3, 4, 5].map((val) => (
                                        <button
                                            type="button"
                                            key={val}
                                            onClick={() => handleScoreChange(crit.id, val)}
                                            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all
                        ${scores[crit.id] === val
                                                    ? 'bg-blue-600 text-white shadow-md scale-110'
                                                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}
                      `}
                                        >
                                            {val}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}

                    <div className="mt-6">
                        <label className="block font-medium text-gray-700 mb-2">Additional Notes</label>
                        <textarea
                            className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                            rows="4"
                            placeholder="Enter performance summary..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                    </div>

                    <div className="mt-8 flex justify-end">
                        <button
                            type="submit"
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm"
                        >
                            Save Evaluation
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default EvaluationForm;
