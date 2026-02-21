import React, { useState, useEffect } from 'react';
import api from '../api';
import { Calendar, CheckCircle, Plus, Users, Target, BarChart2, Save, Loader, Printer } from 'lucide-react';

const PlanningDashboard = ({ user }) => {
    const [activeTab, setActiveTab] = useState('view'); // 'view', 'create'
    const [plans, setPlans] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(false);

    const GRANUEL_KPIS = [
        "Production Achievement",
        "Machine Availability",
        "Scrap Rate",
        "Line Balance Efficiency",
        "Planned Maintenance Completion",
        "Emergency Breakdown Ratio",
        "Safety Compliance",
        "Housekeeping (5S) Score",
        "Utility Availability",
        "Environmental Compliance"
    ];

    // Form State
    const [formData, setFormData] = useState({
        employee_id: '',
        title: GRANUEL_KPIS[0],
        type: 'Daily',
        target_value: 100,
        metric: '%',
        start_date: new Date().toISOString().split('T')[0],
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    });

    useEffect(() => {
        fetchPlans();
        if (user.role === 'manager') {
            fetchEmployees();
        }
    }, [user]);

    const fetchPlans = async () => {
        setLoading(true);
        try {
            const url = user.role === 'manager'
                ? '/api/plans'
                : `/api/plans?employee_id=${user.id}`;
            const res = await api.get(url);
            setPlans(res.data.data);
        } catch (error) {
            console.error("Error fetching plans", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchEmployees = async () => {
        try {
            const res = await api.get('/api/employees');
            setEmployees(res.data.data.filter(e => e.role === 'employee'));
        } catch (error) {
            console.error("Error fetching employees", error);
        }
    };

    const handleCreatePlan = async (e) => {
        e.preventDefault();
        if (!formData.employee_id) return alert("Select an employee");

        try {
            const payload = {
                ...formData,
                employee_id: parseInt(formData.employee_id),
                target_value: parseInt(formData.target_value)
            };
            console.log("Submitting Plan Payload:", payload);

            await api.post('/api/plans', payload);
            alert("Plan Assigned Successfully!");
            setActiveTab('view');
            fetchPlans();
        } catch (error) {
            console.error("Create Plan Error:", error);
            const msg = error.response?.data?.error || error.message || "Error creating plan";
            alert(`Error creating plan: ${msg}`);
        }
    };

    const handleUpdateProgress = async (planId, currentAchieved, target) => {
        const newAchieved = prompt("Enter new achieved value:", currentAchieved);
        if (newAchieved === null) return;

        const val = parseInt(newAchieved);
        if (isNaN(val)) return alert("Invalid number");

        let status = 'In Progress';
        if (val >= target) status = 'Completed';

        try {
            await axios.put(`/api/plans/${planId}`, {
                achieved_value: val,
                status: status
            });
            fetchPlans();
        } catch (error) {
            alert("Failed to update progress");
        }
    };

    const handlePrintReport = () => {
        window.print();
    };

    const handleAutoEvaluate = async (employeeId) => {
        if (!confirm("Generate evaluation based on plans? This will create a new evaluation record.")) return;
        try {
            const res = await axios.post('/api/auto-evaluate', { employee_id: employeeId });
            alert(`Evaluation Generated! Score: ${res.data.data.total_score.toFixed(1)}%`);
        } catch (error) {
            alert(error.response?.data?.error || "Evaluation failed. Make sure employee has plans.");
        }
    };

    return (
        <div className="p-8 bg-slate-50 min-h-screen">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-8 print:hidden">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800">Work Planning</h1>
                        <p className="text-slate-500">Manage and track operational goals</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={handlePrintReport}
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-600 font-medium hover:bg-slate-50 transition-all shadow-sm"
                        >
                            <Printer size={18} /> Export Report
                        </button>
                        {user.role === 'manager' && (
                            <>
                                <button
                                    onClick={() => setActiveTab('view')}
                                    className={`px-4 py-2 rounded-xl font-medium transition-all ${activeTab === 'view' ? 'bg-white text-blue-600 shadow-sm border border-blue-100' : 'text-slate-500 hover:text-slate-700'}`}
                                >
                                    All Plans
                                </button>
                                <button
                                    onClick={() => setActiveTab('create')}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${activeTab === 'create' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
                                >
                                    <Plus size={18} /> Assign New Plan
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* CREATE PLAN FORM (Manager Only) */}
                {user.role === 'manager' && activeTab === 'create' && (
                    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 max-w-2xl mx-auto">
                        <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                            <Target className="w-5 h-5 text-blue-500" />
                            Assign New Target
                        </h2>
                        <form onSubmit={handleCreatePlan} className="space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Employee</label>
                                    <select
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
                                        value={formData.employee_id}
                                        onChange={e => {
                                            const val = e.target.value;
                                            setFormData(prev => ({ ...prev, employee_id: val }));
                                        }}
                                        required
                                    >
                                        <option value="">Select Employee...</option>
                                        {employees.map(emp => (
                                            <option key={emp.id} value={emp.id}>{emp.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 mb-2">KPI Item (Plan Title)</label>
                                    <select
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
                                        value={formData.title}
                                        onChange={e => {
                                            const val = e.target.value;
                                            setFormData(prev => ({ ...prev, title: val }));
                                        }}
                                        required
                                    >
                                        <option value="">Select KPI...</option>
                                        {GRANUEL_KPIS.map(kpi => (
                                            <option key={kpi} value={kpi}>{kpi}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Type</label>
                                    <select
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                                        value={formData.type}
                                        onChange={e => {
                                            const val = e.target.value;
                                            setFormData(prev => ({ ...prev, type: val }));
                                        }}
                                    >
                                        <option value="Daily">Daily</option>
                                        <option value="Weekly">Weekly</option>
                                        <option value="Monthly">Monthly</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Target Value</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="number"
                                            className="w-2/3 p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                                            value={formData.target_value}
                                            onChange={e => {
                                                const val = e.target.value;
                                                setFormData(prev => ({ ...prev, target_value: val }));
                                            }}
                                            required
                                        />
                                        <input
                                            type="text"
                                            className="w-1/3 p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                                            placeholder="Metric"
                                            value={formData.metric}
                                            onChange={e => {
                                                const val = e.target.value;
                                                setFormData(prev => ({ ...prev, metric: val }));
                                            }}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Start Date</label>
                                    <input
                                        type="date"
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                                        value={formData.start_date}
                                        onChange={e => {
                                            const val = e.target.value;
                                            setFormData(prev => ({ ...prev, start_date: val }));
                                        }}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Due Date</label>
                                    <input
                                        type="date"
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                                        value={formData.due_date}
                                        onChange={e => {
                                            const val = e.target.value;
                                            setFormData(prev => ({ ...prev, due_date: val }));
                                        }}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="pt-4 flex justify-end gap-3">
                                <button type="button" onClick={() => setActiveTab('view')} className="px-6 py-3 rounded-xl font-medium text-slate-500 hover:bg-slate-50">Cancel</button>
                                <button type="submit" className="px-6 py-3 rounded-xl font-bold bg-blue-600 text-white shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all">Assign Plan</button>
                            </div>
                        </form>
                    </div>
                )}

                {/* PLANS LIST - TABLE STRUCTURE */}
                {activeTab === 'view' && (
                    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden print:shadow-none print:border-none print:rounded-none">
                        {/* Spreadsheet Header Info */}
                        <div className="p-6 bg-white border-b border-slate-100 print:border-slate-300">
                            <div className="flex flex-wrap gap-y-4">
                                <div className="w-full md:w-1/4 flex border-r border-slate-100 pr-4 print:border-slate-300">
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest w-20">Date</span>
                                    <span className="text-sm font-bold text-slate-700">{new Date().toLocaleDateString()}</span>
                                </div>
                                <div className="w-full md:w-1/4 flex px-4 border-r border-slate-100 print:border-slate-300">
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest w-20">Shift</span>
                                    <span className="text-sm font-bold text-slate-700">Day</span>
                                </div>
                                <div className="w-full md:w-1/2 px-4 flex items-center">
                                    <span className="text-sm font-black text-slate-800 uppercase tracking-tight">Granuel production, Tracking and Tiles</span>
                                </div>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse print:text-xs">
                                <thead>
                                    <tr className="bg-[#789e47] text-white print:bg-[#789e47] print:text-white">
                                        <th className="py-4 px-6 border border-white/20 text-xs font-bold uppercase tracking-wider text-center w-16 print:border-slate-300">Item</th>
                                        <th className="py-4 px-6 border border-white/20 text-xs font-bold uppercase tracking-wider print:border-slate-300">KPI</th>
                                        <th className="py-4 px-6 border border-white/20 text-xs font-bold uppercase tracking-wider text-center w-32 print:border-slate-300">Actual (%)</th>
                                        <th className="py-4 px-6 border border-white/20 text-xs font-bold uppercase tracking-wider text-center w-32 print:border-slate-300">Target (%)</th>
                                        <th className="py-4 px-6 border border-white/20 text-xs font-bold uppercase tracking-wider text-center w-32 print:border-slate-300">Performance (%)</th>
                                        <th className="py-4 px-6 border border-white/20 text-xs font-bold uppercase tracking-wider text-center w-32 print:border-slate-300">Status</th>
                                        {user.role === 'manager' && <th className="py-4 px-6 border border-white/20 text-xs font-bold uppercase tracking-wider text-center w-16 print:hidden">Action</th>}
                                    </tr>
                                </thead>
                                <tbody>
                                    {plans.length === 0 ? (
                                        <tr>
                                            <td colSpan={user.role === 'manager' ? 7 : 6} className="py-12 text-center text-slate-400 italic">
                                                No plans tracked for this period.
                                            </td>
                                        </tr>
                                    ) : (
                                        plans.map((plan, index) => {
                                            const performance = ((plan.achieved_value / plan.target_value) * 100).toFixed(1);
                                            const status = parseFloat(performance) >= 100 ? 'GOOD' : 'ALERT';
                                            const isAlert = status === 'ALERT';

                                            return (
                                                <tr key={plan.id} className="hover:bg-slate-50 transition-colors group print:hover:bg-transparent">
                                                    <td className="py-4 px-6 border border-slate-100 text-center font-bold text-slate-700 print:border-slate-300">{index + 1}</td>
                                                    <td className="py-4 px-6 border border-slate-100 font-bold text-slate-800 print:border-slate-300">{plan.title}</td>
                                                    <td className="py-4 px-6 border border-slate-100 text-center print:border-slate-300">
                                                        <button
                                                            onClick={() => handleUpdateProgress(plan.id, plan.achieved_value, plan.target_value)}
                                                            className="font-bold text-blue-600 hover:text-blue-800 transition-colors print:text-slate-800 print:pointer-events-none"
                                                        >
                                                            {plan.achieved_value}
                                                        </button>
                                                    </td>
                                                    <td className="py-4 px-6 border border-slate-100 text-center font-bold text-slate-600 print:border-slate-300">{plan.target_value}</td>
                                                    <td className="py-4 px-6 border border-slate-100 text-center font-bold text-slate-700 bg-slate-50/50 print:border-slate-300 print:bg-slate-50/50">{performance}</td>
                                                    <td className={`py-4 px-6 border border-slate-100 text-center font-black print:border-slate-300 ${isAlert ? 'bg-[#ffc000] text-slate-900 print:bg-[#ffc000]' : 'bg-white text-slate-900 print:bg-white'}`}>
                                                        {status}
                                                    </td>
                                                    {user.role === 'manager' && (
                                                        <td className="py-4 px-6 border border-slate-100 text-center print:hidden">
                                                            <button
                                                                onClick={() => handleAutoEvaluate(plan.employee_id)}
                                                                className="p-2 bg-slate-50 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                                                                title="Auto-Evaluate"
                                                            >
                                                                <BarChart2 size={16} />
                                                            </button>
                                                        </td>
                                                    )}
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PlanningDashboard;
