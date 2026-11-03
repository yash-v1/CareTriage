import React, { useState } from 'react';
import { Home } from './pages/Home';
import { DoctorView } from './pages/DoctorView';

export default function App() {
  const [view, setView] = useState<"worker" | "doctor">("worker");

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Global Navigation Bar */}
      <nav className="bg-gray-900 text-white p-4 shadow-md flex justify-center space-x-4">
        <button
          onClick={() => setView("worker")}
          className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
            view === "worker" ? "bg-blue-600" : "hover:bg-gray-700"
          }`}
        >
          Worker View (Triage)
        </button>
        <button
          onClick={() => setView("doctor")}
          className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
            view === "doctor" ? "bg-blue-600" : "hover:bg-gray-700"
          }`}
        >
          Doctor View (Decode)
        </button>
      </nav>

      {/* Main Content Area */}
      <main className="flex-grow">
        {view === "worker" ? <Home /> : <DoctorView />}
      </main>
    </div>
  );
}