import React, { useState } from 'react';
import api from '../api';
import { User, Lock, Loader2, BarChart2 } from 'lucide-react';

const Login = ({ onLogin }) => {
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await api.post('/api/login', { name });

            if (response.data.message === 'success') {
                onLogin(response.data.data);
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Login failed. Please check the name.');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-white font-sans">
            {/* Left Side - Brand / Visuals */}
            <div className="hidden lg:flex lg:w-1/2 bg-blue-600 relative overflow-hidden items-center justify-center text-white p-12">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-10 mix-blend-overlay"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-blue-900 opacity-90"></div>

                <div className="relative z-10 max-w-lg">
                    <div className="mb-8 p-4 bg-white/10 backdrop-blur-md rounded-2xl w-16 h-16 flex items-center justify-center border border-white/20 shadow-xl">
                        <Award className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-5xl font-bold mb-6 tracking-tight leading-tight">Excellence in Performance</h1>
                    <p className="text-blue-100 text-lg mb-8 leading-relaxed font-light">
                        Track, evaluate, and improve employee performance with our precision statistics and comprehensive reporting system.
                    </p>

                    <div className="space-y-4">
                        <div className="flex items-center gap-4 p-4 rounded-xl bg-blue-800/30 border border-blue-500/30 backdrop-blur-sm">
                            <TrendingUp className="w-6 h-6 text-blue-300" />
                            <div>
                                <h3 className="font-semibold text-white">Real-time Analytics</h3>
                                <p className="text-sm text-blue-200">Instant visualization of company-wide metrics</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 p-4 rounded-xl bg-blue-800/30 border border-blue-500/30 backdrop-blur-sm">
                            <ShieldCheck className="w-6 h-6 text-blue-300" />
                            <div>
                                <h3 className="font-semibold text-white">Secure Access</h3>
                                <p className="text-sm text-blue-200">Role-based environments for managers and staff</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-slate-50 relative">
                <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:20px_20px] opacity-50 pointer-events-none"></div>

                <div className="max-w-md w-full bg-white p-10 rounded-3xl shadow-[0_20px_50px_rgba(8,_112,_184,_0.07)] border border-slate-100 relative z-10">
                    <div className="text-center mb-10">
                        <div className="mx-auto h-16 w-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 transform rotate-3 hover:rotate-6 transition-transform duration-300 shadow-sm border border-blue-100">
                            <User className="h-8 w-8 text-blue-600" />
                        </div>
                        <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Welcome Back</h2>
                        <p className="mt-2 text-slate-500 font-medium">Please enter your name to continue</p>
                    </div>

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Full Name (ALL CAPS)</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                                </div>
                                <input
                                    type="text"
                                    required
                                    className="block w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium"
                                    placeholder="e.g. YIBELTAL"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium flex items-center gap-2 animate-pulse">
                                <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full flex justify-center py-4 px-4 border border-transparent text-base font-bold rounded-xl text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 transform hover:-translate-y-0.5 ${loading ? 'opacity-80 cursor-wait' : ''}`}
                        >
                            <span className="flex items-center gap-2">
                                {loading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        <span>Accessing System...</span>
                                    </>
                                ) : (
                                    <>
                                        <LogIn className="h-5 w-5" />
                                        <span>Sign In</span>
                                    </>
                                )}
                            </span>
                        </button>
                    </form>

                    <div className="mt-8 pt-8 border-t border-slate-100">
                        <p className="text-center text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Demo Access</p>
                        <div className="grid grid-cols-2 gap-3">
                            <div
                                onClick={() => setName('YIBELTAL')}
                                className="p-3 bg-slate-50 hover:bg-blue-50 border border-slate-100 hover:border-blue-100 rounded-xl cursor-pointer transition-all text-center group"
                            >
                                <p className="text-xs text-slate-500 group-hover:text-blue-600 font-semibold mb-1">Manager</p>
                                <p className="text-xs font-mono font-bold text-slate-700 group-hover:text-blue-700">YIBELTAL</p>
                            </div>
                            <div
                                onClick={() => setName('ABEEB KEBEDE')}
                                className="p-3 bg-slate-50 hover:bg-blue-50 border border-slate-100 hover:border-blue-100 rounded-xl cursor-pointer transition-all text-center group"
                            >
                                <p className="text-xs text-slate-500 group-hover:text-blue-600 font-semibold mb-1">Employee</p>
                                <p className="text-xs font-mono font-bold text-slate-700 group-hover:text-blue-700">ABEEB KEBEDE</p>
                            </div>
                        </div>
                    </div>
                </div>

                <p className="absolute bottom-6 text-slate-400 text-xs font-medium">
                    &copy; 2026 Employee Evaluation System
                </p>
            </div>
        </div>
    );
};

export default Login;
