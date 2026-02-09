import React, { useState, useEffect } from 'react';
import EvaluationForm from './EvaluationForm';
import ScoreChart from './ScoreChart';
import HistoryChart from './HistoryChart';
import axios from 'axios';
import { Printer, Save } from 'lucide-react';

const Dashboard = ({ employee }) => {
    const [currentScore, setCurrentScore] = useState(0);
    const [history, setHistory] = useState([]);

    useEffect(() => {
        if (employee) {
            fetchHistory();
        }
    }, [employee]);

    const fetchHistory = async () => {
        try {
            const res = await axios.get(`/api/evaluations/${employee.id}`);
            setHistory(res.data.data);
        } catch (error) {
            console.error('Error fetching history:', error);
        }
    };

    const handleScoreUpdate = (score) => {
        setCurrentScore(score);
    };

    const handleSaveEvaluation = async (evaluationData) => {
        try {
            await axios.post('/api/evaluations', {
                employee_id: employee.id,
                total_score: currentScore,
                ...evaluationData
            });
            alert('Evaluation saved successfully!');
            fetchHistory(); // Refresh history
        } catch (error) {
            console.error('Error saving evaluation:', error);
            alert('Failed to save evaluation.');
        }
    };

    const handlePrint = () => {
        window.print();
    };

    if (!employee) {
        return (
            <div className="flex-1 flex items-center justify-center bg-gray-50 h-screen text-gray-400">
                Select an employee to view details
            </div>
        );
    }

    return (
        <div className="flex-1 bg-gray-50 h-screen overflow-y-auto p-8" dir="ltr">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{employee.name}</h1>
                    <p className="text-gray-500">{employee.position || employee.department} • {employee.department}</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={handlePrint}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
                    >
                        <Printer size={18} />
                        Print Report
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Evaluation Form */}
                <div className="lg:col-span-2 space-y-8">
                    <EvaluationForm
                        employee={employee}
                        onSave={handleSaveEvaluation}
                        onScoreUpdate={handleScoreUpdate}
                    />
                </div>

                {/* Right Column: Stats & History */}
                <div className="space-y-8">
                    <ScoreChart score={currentScore} />
                    <HistoryChart data={history} />

                    {/* Summary Card for Print - Hidden usually, shown in print if needed, or just rely on layout */}
                    <div className="hidden print:block mt-8">
                        <h3 className="text-lg font-bold">Evaluation Summary</h3>
                        <p>Employee: {employee.name}</p>
                        <p>Date: {new Date().toLocaleDateString()}</p>
                        <p>Total Score: {currentScore.toFixed(1)}%</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
