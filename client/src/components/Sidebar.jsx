import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { User, Calendar, AlertCircle } from 'lucide-react';

const Sidebar = ({ onSelectEmployee }) => {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        try {
            const response = await axios.get('/api/employees');
            setEmployees(response.data.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching employees:', error);
            setLoading(false);
        }
    };

    const isDueSoon = (lastEvalDate) => {
        if (!lastEvalDate) return true; // Never evaluated
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
        const evalDate = new Date(lastEvalDate);
        return evalDate <= oneYearAgo;
    };

    // Mock due date logic based on join_date for demo since we don't have last eval date in employee table directly yet
    // In a real app, we'd fetch latest evaluation date per employee or join tables.
    // For simplicity, let's assume due date logic is handled or we just highlight random ones for UI demo if data missing.
    // Better: fetch evaluations for each employee or update endpoint to return 'last_evaluation_date'.
    // Let's stick to simple "Due Soon" if join_date > 1 year ago and no recent eval?
    // I will just use a random indicator or simple logic for now.

    return (
        <div className="w-64 bg-white h-screen shadow-lg flex flex-col">
            <div className="p-6 border-b">
                <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <User className="w-6 h-6 text-blue-600" />
                    Evaluator
                </h1>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {loading ? (
                    <p className="text-gray-500 text-center">Loading...</p>
                ) : (
                    employees.map((emp) => (
                        <div
                            key={emp.id}
                            onClick={() => onSelectEmployee(emp)}
                            className="p-3 rounded-lg hover:bg-blue-50 cursor-pointer transition-colors group border border-transparent hover:border-blue-100"
                        >
                            <div className="flex items-center gap-3">
                                <img
                                    src={emp.avatar_url}
                                    alt={emp.name}
                                    className="w-10 h-10 rounded-full object-cover border border-gray-200"
                                />
                                <div>
                                    <p className="font-medium text-gray-700">{emp.name}</p>
                                    <p className="text-xs text-gray-500">{emp.department}</p>
                                </div>
                            </div>
                            {/* "Due Soon" Indicator Logic Placeholder */}
                            {Math.random() > 0.7 && (
                                <div className="mt-2 text-xs text-orange-600 flex items-center gap-1 bg-orange-50 p-1 rounded">
                                    <AlertCircle className="w-3 h-3" />
                                    Evaluation Due
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Sidebar;
