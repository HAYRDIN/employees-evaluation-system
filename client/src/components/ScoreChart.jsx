import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Label } from 'recharts';

const ScoreChart = ({ score }) => {
    const data = [
        { name: 'Score', value: score },
        { name: 'Remaining', value: 100 - score },
    ];

    const COLORS = ['#2563EB', '#E5E7EB']; // Blue and Gray

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Total Score</h3>
            <div className="h-64 w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={80}
                            outerRadius={100}
                            startAngle={90}
                            endAngle={-270}
                            dataKey="value"
                            stroke="none"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                            <Label
                                value={`${Math.round(score)}%`}
                                position="center"
                                className="text-4xl font-bold fill-gray-800"
                                style={{ fontSize: '36px', fontWeight: 'bold' }}
                            />
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>
                {/* Fallback for label if it doesn't render perfectly with Label component in some versions */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className="text-4xl font-bold text-blue-600">{Math.round(score)}%</span>
                </div>
            </div>
        </div>
    );
};

export default ScoreChart;
