import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';

function App() {
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const handleSelectEmployee = (employee) => {
    setSelectedEmployee(employee);
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-gray-900">
      <Sidebar onSelectEmployee={handleSelectEmployee} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Dashboard employee={selectedEmployee} />
      </div>
    </div>
  );
}

export default App;
