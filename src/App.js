import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';
import './App.css';
import { useEffect, useState } from 'react';
import Threads from './pages/ThreadsPage/ThreadsPage';
import ChatPage from './pages/ChatPage/ChatPage';
import Settings from './pages/SettingsPage/SettingsPage';

function App() {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // Apply dark mode from localStorage on load
  useEffect(() => {
    const storedTheme = localStorage.getItem('theme');
    const isDark = storedTheme === 'dark';
    setDarkMode(isDark);
    document.body.classList.toggle('dark', isDark);
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  // Function to pass to Settings
  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    document.body.classList.toggle('dark', newMode);
    localStorage.setItem('theme', newMode ? 'dark' : 'light');
  };

  return (
    <Router>
      <div className="app">
        <div className="mobile-topbar">
          <button className="hamburger" onClick={toggleSidebar}>
            ☰
          </button>
          <div className="mobile-title">Strands</div>
        </div>

        <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

        <Routes>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/home" element={<MainContent />} />
          <Route path="/threads" element={<Threads />} />
          <Route path="/settings" element={
            <Settings
              darkMode={darkMode}
              toggleDarkMode={toggleDarkMode}
            />
          } />
          <Route path="/chat/:chatId" element={<ChatPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;