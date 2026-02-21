import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import OverviewDashboard from './components/OverviewDashboard';
import Login from './components/Login';

import PlanningDashboard from './components/PlanningDashboard';

function App() {
  const [user, setUser] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [viewMode, setViewMode] = useState('dashboard'); // 'dashboard', 'overview', 'planning'

  // Check for saved user in localStorage
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('eval_system_user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } catch (e) {
      console.error("Error reading from local storage", e);
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('eval_system_user', JSON.stringify(userData));

    // If employee, auto-select them
    if (userData.role === 'employee') {
      setSelectedEmployee(userData);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setSelectedEmployee(null);
    localStorage.removeItem('eval_system_user');
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  // Helper to determine what to render
  const renderContent = () => {
    if (user.role === 'employee') {
      // Employee View: Dashboard or Planning?
      // Let's add a toggle for employees too eventually, but for now Dashboard is default.
      // Actually, let's give employees a simple tab switcher in their dashboard or a mini-sidebar?
      // For now, let's stick to the request: "Insert plan... auto evaluate".
      // If employee, creating a simple toggle in the top right might be better.
      // But wait, the Sidebar is only for managers.
      // Let's modify the Employee View to check `viewMode`.

      if (viewMode === 'planning') return <PlanningDashboard user={user} />;
      return <Dashboard employee={user} onViewPlans={() => setViewMode('planning')} />;
    }

    // Manager View
    if (viewMode === 'planning') return <PlanningDashboard user={user} />;
    if (selectedEmployee) return <Dashboard employee={selectedEmployee} />;
    return <OverviewDashboard />;
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-gray-900">
      {user.role === 'manager' && (
        <div className="print:hidden h-full">
          <Sidebar
            onSelectEmployee={(emp) => {
              setSelectedEmployee(emp);
              setViewMode('dashboard');
            }}
            onLogout={handleLogout}
            selectionMode={viewMode === 'planning' ? 'planning' : (selectedEmployee ? 'employee' : 'overview')}
            setSelectionMode={(mode) => {
              if (mode === 'planning') {
                setSelectedEmployee(null);
                setViewMode('planning');
              } else if (mode === 'overview') {
                setSelectedEmployee(null);
                setViewMode('overview');
              }
            }}
          />
        </div>
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        {renderContent()}

        {user.role === 'employee' && (
          <div className="fixed bottom-6 right-6 flex flex-col gap-3 print:hidden">
            <button
              onClick={() => setViewMode(viewMode === 'planning' ? 'dashboard' : 'planning')}
              className="bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-all z-50"
              title="Switch View"
            >
              {viewMode === 'planning' ? '📊 Dashboard' : '📅 My Plans'}
            </button>
            <button
              onClick={handleLogout}
              className="bg-white p-4 rounded-full shadow-lg border border-gray-100 text-gray-400 hover:text-red-500 transition-colors"
              title="Logout"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
