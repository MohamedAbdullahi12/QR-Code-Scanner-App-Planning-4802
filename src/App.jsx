import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { HistoryProvider } from './contexts/HistoryContext';
import Home from './pages/Home';
import Scanner from './pages/Scanner';
import Generator from './pages/Generator';
import History from './pages/History';
import Settings from './pages/Settings';
import './App.css';

function App() {
  return (
    <ThemeProvider>
      <HistoryProvider>
        <Router>
          <div className="min-h-screen bg-gray-50 dark:bg-dark-900 transition-colors duration-300">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/scan" element={<Scanner />} />
              <Route path="/generate" element={<Generator />} />
              <Route path="/history" element={<History />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </div>
        </Router>
      </HistoryProvider>
    </ThemeProvider>
  );
}

export default App;