import React, { useState, useEffect } from 'react';
import api from '../api';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';
import { Users, TrendingUp, CheckCircle, AlertCircle, Award, Trophy, ArrowUpRight, ArrowDownRight, BarChart3 } from 'lucide-react';

const OverviewDashboard = () => {
    const [stats, setStats] = useState({
        totalEmployees: 0,
        averageScore: 0,
        totalEvaluations: 0,
        needsEvaluation: 0
    });
    const [deptData, setDeptData] = useState([]);
    const [distributionData, setDistributionData] = useState([]);
    const [individualData, setIndividualData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchGlobalData();
    }, []);

    const fetchGlobalData = async () => {
        try {
            const [empRes, evalRes, plansRes] = await Promise.all([
                api.get('/api/employees'),
                api.get('/api/evaluations'),
                api.get('/api/plans')
            ]);

            const employees = empRes.data.data;
            const evaluations = evalRes.data.data;
            const allPlans = plansRes.data.data;

            // 1. Calculate Stats from Plans
            const totalEmployees = employees.length;
            const totalEvaluations = evaluations.length;

            // Average Performance of all active plans
            const totalEfficiency = allPlans.reduce((acc, plan) => {
                let efficiency = (plan.achieved_value / plan.target_value) * 100;
                return acc + (efficiency > 120 ? 120 : efficiency);
            }, 0);
            const averageScore = allPlans.length > 0 ? totalEfficiency / allPlans.length : 0;

            const oneYearAgo = new Date();
            oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
            const needsEvalList = employees.filter(emp => {
                const joinDate = new Date(emp.join_date);
                const lastEval = evaluations.find(e => e.employee_id === emp.id);
                return joinDate < oneYearAgo && !lastEval;
            });

            setStats({
                totalEmployees,
                totalEvaluations,
                averageScore,
                needsEvaluation: needsEvalList.length
            });

            // 2. Departmental Data
            const depts = [...new Set(employees.map(e => e.department))];
            const deptAverages = depts.map(dept => {
                const deptEmps = employees.filter(e => e.department === dept);
                const deptEvals = evaluations.filter(ev => deptEmps.some(e => e.id === ev.employee_id));
                const dSum = deptEvals.reduce((acc, curr) => acc + parseFloat(curr.total_score), 0);
                return {
                    name: dept,
                    average: deptEvals.length > 0 ? Math.round(dSum / deptEvals.length) : 0
                };
            }).sort((a, b) => b.average - a.average);
            setDeptData(deptAverages);

            // 3. Performance Distribution
            const dist = [
                { name: 'Excellent (90-100)', value: evaluations.filter(e => e.total_score >= 90).length, color: '#10B981' },
                { name: 'Good (70-89)', value: evaluations.filter(e => e.total_score >= 70 && e.total_score < 90).length, color: '#3B82F6' },
                { name: 'Average (50-69)', value: evaluations.filter(e => e.total_score >= 50 && e.total_score < 70).length, color: '#F59E0B' },
                { name: 'Poor (<50)', value: evaluations.filter(e => e.total_score < 50).length, color: '#EF4444' }
            ].filter(d => d.value > 0);
            setDistributionData(dist);

            // 4. Individual Performance Data grouped by plans
            const individualPerformance = employees.map(emp => {
                const empPlans = allPlans.filter(p => p.employee_id === emp.id);
                let score = 0;
                if (empPlans.length > 0) {
                    const totalEff = empPlans.reduce((acc, p) => {
                        let eff = (p.achieved_value / p.target_value) * 100;
                        return acc + (eff > 120 ? 120 : eff);
                    }, 0);
                    score = Math.round(totalEff / empPlans.length);
                }

                return {
                    id: emp.id,
                    name: emp.name,
                    department: emp.department,
                    score: score,
                    status: empPlans.length > 0 ? 'Active' : 'No Plans',
                    avatar_url: emp.avatar_url
                };
            }).sort((a, b) => b.score - a.score);

            setIndividualData(individualPerformance);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching global dashboard data:', error);
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="flex-1 flex items-center justify-center bg-slate-50 h-screen font-sans text-slate-400 font-medium">Loading Analytics...</div>;
    }

    return (
        <div className="flex-1 bg-slate-50 h-screen overflow-y-auto p-8 font-sans" dir="ltr">
            {/* Header */}
            <div className="mb-10 relative">
                <div className="flex justify-between items-end relative z-10">
                    <div>
                        <h1 className="text-4xl font-bold text-slate-900 tracking-tight mb-2">Company Overview</h1>
                        <p className="text-slate-500 font-medium text-lg">Real-time performance metrics</p>
                    </div>
                    <div className="hidden md:flex gap-2">
                        <div className="px-4 py-2 bg-white rounded-xl border border-slate-200 shadow-sm text-sm font-semibold text-slate-600">
                            {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <StatCard
                    icon={<Users className="w-6 h-6 text-blue-600" />}
                    label="Total Employees"
                    value={stats.totalEmployees}
                    trend="+2 new"
                    trendUp={true}
                    color="blue"
                />
                <StatCard
                    icon={<TrendingUp className="w-6 h-6 text-emerald-600" />}
                    label="Avg. Performance"
                    value={`${Math.round(stats.averageScore)}%`}
                    trend="+5%"
                    trendUp={true}
                    color="emerald"
                />
                <StatCard
                    icon={<CheckCircle className="w-6 h-6 text-violet-600" />}
                    label="Evaluations Done"
                    value={stats.totalEvaluations}
                    trend="On track"
                    trendUp={true}
                    color="violet"
                />
                <StatCard
                    icon={<AlertCircle className="w-6 h-6 text-amber-600" />}
                    label="Evaluations Due"
                    value={stats.needsEvaluation}
                    trend="Action needed"
                    trendUp={false}
                    color="amber"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
                {/* Department Performance */}
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-xl font-bold text-slate-800">Department Metrics</h3>
                            <p className="text-sm text-slate-400 font-medium">Average score per department</p>
                        </div>
                        <div className="p-2 bg-blue-50 rounded-lg">
                            <BarChart3 className="w-5 h-5 text-blue-500" />
                        </div>
                    </div>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={deptData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12, fontWeight: 500 }} dy={10} />
                                <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} />
                                <Tooltip
                                    cursor={{ fill: '#F8FAFC' }}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', padding: '12px' }}
                                />
                                <Bar dataKey="average" radius={[6, 6, 0, 0]} barSize={40}>
                                    {deptData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={index === 0 ? '#3B82F6' : '#93C5FD'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Performance Distribution */}
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-xl font-bold text-slate-800">Score Distribution</h3>
                            <p className="text-sm text-slate-400 font-medium">Evaluations breakdown</p>
                        </div>
                        <div className="p-2 bg-emerald-50 rounded-lg">
                            <PieChart className="w-5 h-5 text-emerald-500" />
                        </div>
                    </div>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={distributionData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={80}
                                    outerRadius={110}
                                    paddingAngle={5}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {distributionData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }} />
                                <Legend verticalAlign="bottom" height={36} iconType="circle" />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Leaderboard Table */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden mb-10">
                <div className="p-8 border-b border-slate-50 flex items-center gap-3">
                    <div className="p-2 bg-yellow-50 rounded-lg">
                        <Trophy className="w-6 h-6 text-yellow-500" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-slate-800">Performance Leaderboard</h3>
                        <p className="text-sm text-slate-400 font-medium">Top performing employees this period</p>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
                                <th className="py-5 px-8">Rank</th>
                                <th className="py-5 px-8">Employee</th>
                                <th className="py-5 px-8">Department</th>
                                <th className="py-5 px-8 w-1/3">Performance Score</th>
                                <th className="py-5 px-8">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {individualData.map((emp, index) => (
                                <tr key={emp.id} className="hover:bg-slate-50/80 transition-colors group">
                                    <td className="py-5 px-8">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-sm ${index === 0 ? 'bg-yellow-100 text-yellow-700 ring-4 ring-yellow-50' :
                                            index === 1 ? 'bg-slate-100 text-slate-700 ring-4 ring-slate-50' :
                                                index === 2 ? 'bg-orange-100 text-orange-700 ring-4 ring-orange-50' :
                                                    'text-slate-400 bg-transparent'
                                            }`}>
                                            {index + 1}
                                        </div>
                                    </td>
                                    <td className="py-5 px-8">
                                        <div className="flex items-center gap-4">
                                            <img src={emp.avatar_url} alt="" className="w-10 h-10 rounded-xl object-cover shadow-sm group-hover:scale-105 transition-transform" />
                                            <span className="font-bold text-slate-800">{emp.name}</span>
                                        </div>
                                    </td>
                                    <td className="py-5 px-8">
                                        <span className="px-3 py-1 rounded-lg bg-slate-100 text-slate-600 text-xs font-bold uppercase tracking-wide">
                                            {emp.department}
                                        </span>
                                    </td>
                                    <td className="py-5 px-8">
                                        <div className="flex items-center gap-3">
                                            <span className="font-bold text-slate-700 w-12 text-right">{emp.score}%</span>
                                            <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full transition-all duration-1000 ${emp.score >= 90 ? 'bg-emerald-500' :
                                                        emp.score >= 70 ? 'bg-blue-500' :
                                                            emp.score >= 50 ? 'bg-amber-500' : 'bg-red-500'
                                                        }`}
                                                    style={{ width: `${emp.score}%` }}
                                                />
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-5 px-8">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${emp.status === 'Updated'
                                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                            : 'bg-slate-50 text-slate-500 border border-slate-100'
                                            }`}>
                                            {emp.status === 'Updated' && <CheckCircle className="w-3 h-3" />}
                                            {emp.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ icon, label, value, trend, trendUp, color }) => {
    const colorClasses = {
        blue: 'bg-blue-50 text-blue-600 ring-blue-100',
        emerald: 'bg-emerald-50 text-emerald-600 ring-emerald-100',
        violet: 'bg-violet-50 text-violet-600 ring-violet-100',
        amber: 'bg-amber-50 text-amber-600 ring-amber-100',
    };

    return (
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300 group">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-2xl ring-1 ${colorClasses[color]} transition-colors`}>
                    {icon}
                </div>
                {trend && (
                    <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${trendUp ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                        {trendUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        {trend}
                    </div>
                )}
            </div>
            <div>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-wide mb-1">{label}</p>
                <h3 className="text-3xl font-bold text-slate-900 group-hover:scale-105 transition-transform origin-left">{value}</h3>
            </div>
        </div>
    );
};

export default OverviewDashboard;
