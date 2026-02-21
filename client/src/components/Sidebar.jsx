import React, { useState, useEffect } from 'react';
import api from '../api';
import { Users, Search, ChevronRight, LogOut, LayoutDashboard, Target, BarChart3, TrendingUp } from 'lucide-react';

const Sidebar = ({ onSelectEmployee, onLogout, setSelectionMode, selectionMode }) => {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedId, setSelectedId] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [empRes, evalRes] = await Promise.all([
                api.get('/api/employees'),
                api.get('/api/evaluations')
            ]);
            setEmployees(empRes.data.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching employees:', error);
            setLoading(false);
        }
    };

    const handleSelect = (emp) => {
        setSelectedId(emp ? emp.id : 'overview');
        onSelectEmployee(emp);
    };

    const isDueSoon = (lastEvalDate) => {
        if (!lastEvalDate) return true;
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
        const evalDate = new Date(lastEvalDate);
        return evalDate <= oneYearAgo;
    };

    return (
        <div className="w-72 bg-white h-screen shadow-xl flex flex-col border-r border-slate-100 z-20 font-sans relative">
            {/* Header */}
            <div className="p-6 border-b border-slate-50 bg-gradient-to-br from-blue-600 to-indigo-700 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -mr-16 -mt-16 pointer-events-none"></div>
                <div className="flex items-center gap-3 relative z-10">
                    <div className="p-2.5 bg-white/20 backdrop-blur-md rounded-xl shadow-inner border border-white/10">
                        <BarChart3 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold tracking-tight leading-tight">Evaluator</h1>
                        <p className="text-blue-100 text-xs font-medium opacity-90 tracking-wide">Admin Console</p>
                    </div>
                </div>
            </div>

            {/* Main Navigation */}
            <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
                {/* Company Overview Link */}
                <button
                    onClick={() => {
                        onSelectEmployee(null);
                        setSelectedId(null);
                        setSelectionMode('overview');
                    }}
                    className={`w - full flex items - center gap - 3 px - 4 py - 3.5 rounded - 2xl transition - all duration - 200 group ${selectionMode === 'overview'
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                            : 'text-slate-500 hover:bg-white hover:text-blue-600 hover:shadow-md hover:shadow-slate-200/50'
                        } `}
                >
                    <div className={`p - 2 rounded - xl transition - all ${selectionMode === 'overview' ? 'bg-white/20' : 'bg-slate-100 group-hover:bg-blue-50'
                        } `}>
                        <LayoutDashboard size={20} className={selectionMode === 'overview' ? 'text-white' : 'text-slate-500 group-hover:text-blue-600'} />
                    </div>
                    <span className="font-semibold tracking-wide">Company Overview</span>
                </button>

                {/* Work Plans Link */}
                <button
                    onClick={() => {
                        onSelectEmployee(null);
                        setSelectedId(null);
                        setSelectionMode('planning');
                    }}
                    className={`w - full flex items - center gap - 3 px - 4 py - 3.5 rounded - 2xl transition - all duration - 200 group ${selectionMode === 'planning'
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                            : 'text-slate-500 hover:bg-white hover:text-blue-600 hover:shadow-md hover:shadow-slate-200/50'
                        } `}
                >
                    <div className={`p - 2 rounded - xl transition - all ${selectionMode === 'planning' ? 'bg-white/20' : 'bg-slate-100 group-hover:bg-blue-50'
                        } `}>
                        <Target size={20} className={selectionMode === 'planning' ? 'text-white' : 'text-slate-500 group-hover:text-blue-600'} />
                    </div>
                    <span className="font-semibold tracking-wide">Work Plans</span>
                </button>

                <div className="px-4 py-2 mt-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Employees
                </div>

                {/* Employee List */}
                <div className="space-y-2 mt-2">
                    {loading ? (
                        <div className="space-y-3">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="flex items-center gap-3 p-2">
                                    <div className="w-10 h-10 bg-slate-100 rounded-full animate-pulse" />
                                    <div className="space-y-2 flex-1">
                                        <div className="h-3 bg-slate-100 rounded w-2/3 animate-pulse" />
                                        <div className="h-2 bg-slate-100 rounded w-1/2 animate-pulse" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        employees?.map((emp) => (
                            <button
                                key={emp.id}
                                onClick={() => handleSelect(emp)}
                                className={`w - full flex items - center gap - 3 p - 3 rounded - 2xl transition - all duration - 200 group text - left relative overflow - hidden ${selectedId === emp.id
                                        ? 'bg-white ring-1 ring-slate-200 shadow-lg shadow-slate-100/50 z-10'
                                        : 'hover:bg-slate-50 border border-transparent hover:border-slate-100'
                                    } `}
                            >
                                <div className="relative shrink-0">
                                    <img
                                        src={emp.avatar_url}
                                        alt={emp.name}
                                        className={`w - 10 h - 10 rounded - xl object - cover transition - all duration - 300 ${selectedId === emp.id ? 'ring-2 ring-blue-500 ring-offset-2 scale-105' : 'grayscale-[0.3] group-hover:grayscale-0'
                                            } `}
                                    />
                                    {isDueSoon(emp.join_date) && (
                                        <div className="absolute -top-1 -right-1 flex h-3 w-3">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500 border-2 border-white"></span>
                                        </div>
                                    )}
                                </div>

                                <div className="min-w-0 flex-1">
                                    <p className={`text - sm truncate leading - tight mb - 0.5 ${selectedId === emp.id ? 'font-bold text-slate-900' : 'font-medium text-slate-700 group-hover:text-slate-900'} `}>
                                        {emp.name}
                                    </p>
                                    <p className="text-[10px] text-slate-400 font-semibold truncate uppercase tracking-wide group-hover:text-blue-500 transition-colors">
                                        {emp.department}
                                    </p>
                                </div>

                                {selectedId === emp.id && (
                                    <div className="absolute right-0 top-1/2 -translate-y-1/2 h-8 w-1 bg-blue-500 rounded-l-full"></div>
                                )}
                            </button>
                        ))
                    )}
                </div>
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/50 backdrop-blur-sm">
                <button
                    onClick={onLogout}
                    className="w-full flex items-center justify-center gap-2 p-3.5 rounded-xl text-slate-500 hover:bg-white hover:text-red-600 transition-all group font-semibold text-sm border border-transparent hover:border-slate-200 hover:shadow-md active:scale-95 duration-200"
                >
                    <LogOut className="w-4 h-4 group-hover:text-red-500 transition-colors" />
                    Sign Out
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
