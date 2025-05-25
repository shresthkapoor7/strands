import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';
import './App.css';
import { useState } from 'react';
import Threads from './pages/Threads';
import ChatPage from './pages/ChatPage';

function Settings() {
  return <div className="main-content"><h1>Settings Page</h1></div>;
}

function App() {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
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
          <Route path="/settings" element={<Settings />} />
          <Route path="/chat/:chatId" element={<ChatPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;