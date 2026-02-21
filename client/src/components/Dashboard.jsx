import React, { useState, useEffect } from 'react';
import ScoreChart from './ScoreChart';
import HistoryChart from './HistoryChart';
import api from '../api';
import { Printer, Calendar, User, Award, LayoutDashboard, TrendingUp, BarChart2, CheckCircle, AlertCircle } from 'lucide-react';

const Dashboard = ({ employee }) => {
    const [currentScore, setCurrentScore] = useState(0);
    const [history, setHistory] = useState([]);
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (employee) {
            fetchHistory();
            fetchPlans();
        }
    }, [employee]);

    // Recalculate score whenever plans change
    useEffect(() => {
        if (plans.length > 0) {
            let totalEfficiency = 0;
            plans.forEach(plan => {
                let efficiency = (plan.achieved_value / plan.target_value) * 100;
                // For scoring logic, we cap at 120% to avoid extreme outliers but allow overperformance credit
                let scoringEfficiency = efficiency > 120 ? 120 : efficiency;
                totalEfficiency += scoringEfficiency;
            });
            const avgScore = totalEfficiency / plans.length;
            setCurrentScore(avgScore);
        } else {
            setCurrentScore(0);
        }
    }, [plans]);

    const fetchHistory = async () => {
        try {
            const res = await api.get(`/api/evaluations/${employee.id}`);
            setHistory(res.data.data);
        } catch (error) {
            console.error('Error fetching history:', error);
        }
    };

    const fetchPlans = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/api/plans?employee_id=${employee.id}`);
            setPlans(res.data.data);
        } catch (error) {
            console.error('Error fetching plans:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateProgress = async (planId, current, target) => {
        const newValue = prompt(`Update achieved value for this KPI (Current: ${current}%):`, current);
        if (newValue === null || newValue === "") return;

        try {
            await api.put(`/api/plans/${planId}`, { achieved_value: parseFloat(newValue) });
            fetchPlans();
        } catch (error) {
            console.error('Error updating plan:', error);
            alert('Failed to update progress');
        }
    };

    const handleSaveEvaluation = async () => {
        if (!confirm(`Save this evaluation with a score of ${currentScore.toFixed(1)}%?`)) return;
        try {
            await api.post('/api/evaluations', {
                employee_id: employee.id,
                total_score: currentScore,
                notes: `Auto-generated from ${plans.length} work plan KPIs.`,
                date: new Date().toISOString()
            });
            alert('Evaluation saved successfully!');
            fetchHistory();
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
            <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 h-screen text-slate-400 gap-4">
                <div className="p-6 bg-white rounded-full shadow-lg shadow-slate-200">
                    <User className="w-12 h-12 text-blue-200" />
                </div>
                <p className="font-medium text-lg">Select an employee to start evaluation</p>
            </div>
        );
    }

    return (
        <div className="flex-1 bg-slate-50 h-screen overflow-y-auto p-8 font-sans scroll-smooth" dir="ltr">
            {/* Premium Header Card */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 mb-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-bl-full opacity-50 -mr-16 -mt-16 pointer-events-none"></div>

                <div className="flex justify-between items-start relative z-10">
                    <div className="flex items-center gap-6">
                        <div className="p-1 bg-white border-2 border-slate-100 rounded-2xl shadow-sm">
                            <img
                                src={employee.avatar_url}
                                alt={employee.name}
                                className="w-20 h-20 rounded-xl object-cover"
                            />
                        </div>
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{employee.name}</h1>
                                <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider rounded-lg border border-blue-100">
                                    {employee.department}
                                </span>
                            </div>
                            <div className="flex items-center gap-4 text-slate-500 text-sm font-medium">
                                <span className="flex items-center gap-1.5">
                                    <User className="w-4 h-4 text-slate-400" />
                                    {employee.position || 'Employee'}
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <Calendar className="w-4 h-4 text-slate-400" />
                                    Joined {new Date(employee.join_date).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={handlePrint}
                            className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm hover:shadow-md"
                        >
                            <Printer size={18} className="text-slate-500" />
                            Print Report
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column: Evaluation Form (8 cols) */}
                <div className="lg:col-span-8 space-y-8">
                    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-1 overflow-hidden">
                        <div className="bg-slate-50/50 p-4 border-b border-slate-100 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                                    <BarChart2 className="w-5 h-5" />
                                </div>
                                <h2 className="font-bold text-slate-800 text-lg">Granuel Production KPIs</h2>
                            </div>
                            <button
                                onClick={handleSaveEvaluation}
                                className="px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition shadow-sm"
                            >
                                Submit Official Evaluation
                            </button>
                        </div>
                        <div className="p-1">
                            {loading ? (
                                <div className="py-20 text-center text-slate-400">Loading KPI data...</div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-[#789e47] text-white">
                                                <th className="py-4 px-6 border border-white/20 text-xs font-bold uppercase tracking-wider text-center w-16">Item</th>
                                                <th className="py-4 px-6 border border-white/20 text-xs font-bold uppercase tracking-wider">KPI</th>
                                                <th className="py-4 px-6 border border-white/20 text-xs font-bold uppercase tracking-wider text-center w-32">Actual (%)</th>
                                                <th className="py-4 px-6 border border-white/20 text-xs font-bold uppercase tracking-wider text-center w-32">Target (%)</th>
                                                <th className="py-4 px-6 border border-white/20 text-xs font-bold uppercase tracking-wider text-center w-32 font-black">Performance (%)</th>
                                                <th className="py-4 px-6 border border-white/20 text-xs font-bold uppercase tracking-wider text-center w-32">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {plans.length === 0 ? (
                                                <tr>
                                                    <td colSpan={6} className="py-12 text-center text-slate-400 italic">
                                                        No KPIs assigned to this employee.
                                                    </td>
                                                </tr>
                                            ) : (
                                                plans.map((plan, index) => {
                                                    const performance = ((plan.achieved_value / plan.target_value) * 100).toFixed(1);
                                                    const status = parseFloat(performance) >= 100 ? 'GOOD' : 'ALERT';
                                                    const isAlert = status === 'ALERT';

                                                    return (
                                                        <tr key={plan.id} className="hover:bg-slate-50 transition-colors group">
                                                            <td className="py-4 px-6 border border-slate-100 text-center font-bold text-slate-700">{index + 1}</td>
                                                            <td className="py-4 px-6 border border-slate-100 font-bold text-slate-800">{plan.title}</td>
                                                            <td className="py-4 px-6 border border-slate-100 text-center">
                                                                <button
                                                                    onClick={() => handleUpdateProgress(plan.id, plan.achieved_value, plan.target_value)}
                                                                    className="font-bold text-blue-600 hover:text-blue-800 transition-colors"
                                                                >
                                                                    {plan.achieved_value}
                                                                </button>
                                                            </td>
                                                            <td className="py-4 px-6 border border-slate-100 text-center font-bold text-slate-600">{plan.target_value}</td>
                                                            <td className="py-4 px-6 border border-slate-100 text-center font-black text-slate-900 bg-slate-50/80">{performance}</td>
                                                            <td className={`py-4 px-6 border border-slate-100 text-center font-black ${isAlert ? 'bg-[#ffc000] text-slate-900' : 'bg-white text-slate-900'}`}>
                                                                {status}
                                                            </td>
                                                        </tr>
                                                    );
                                                })
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Stats & History (4 cols) */}
                <div className="lg:col-span-4 space-y-8">
                    {/* Live Score Card */}
                    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-white via-white to-blue-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                    <Award className="w-5 h-5 text-amber-500" />
                                    Live Score
                                </h3>
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Real-time</span>
                            </div>
                            <div className="flex justify-center py-4">
                                <ScoreChart score={currentScore} />
                            </div>
                            <div className="text-center mt-4">
                                <p className="text-slate-500 text-sm font-medium">Current Evaluation Period</p>
                            </div>
                        </div>
                    </div>

                    {/* Historical Data */}
                    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
                        <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-emerald-500" />
                            Performance History
                        </h3>
                        <HistoryChart data={history} />
                    </div>

                    {/* Summary Card for Print - Hidden usually */}
                    <div className="hidden print:block mt-8 p-6 border border-slate-200 rounded-xl">
                        <h3 className="text-lg font-bold mb-4">Evaluation Summary</h3>
                        <div className="space-y-2 text-sm">
                            <p><span className="font-semibold">Employee:</span> {employee.name}</p>
                            <p><span className="font-semibold">Date:</span> {new Date().toLocaleDateString()}</p>
                            <p><span className="font-semibold">Total Score:</span> {currentScore.toFixed(1)}%</p>
                            <p><span className="font-semibold">Evaluator:</span> YIBELTAL (Manager)</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
