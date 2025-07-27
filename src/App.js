import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { customAlphabet } from 'nanoid';
import './App.css';
import { useEffect } from 'react';
import ThreadsPage from './pages/ThreadsPage/ThreadsPage';
import SettingsPage from './pages/SettingsPage/SettingsPage';
import MainContent from './components/MainContent';
import ChatPage from './pages/ChatPage/ChatPage';
import LoginPage from './pages/LoginPage/LoginPage';
import ChangeLogs from './pages/ChangeLogs/ChangeLogs.tsx';

const NoChatSelected = () => (
  <div className="no-chat-selected">
    <h2>Select a chat or start a new one</h2>
    <p>Your conversations will appear here.</p>
  </div>
);

function App() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    let deviceId = localStorage.getItem("deviceId");
    if (!deviceId) {
      deviceId = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 20)();
      localStorage.setItem("deviceId", deviceId);
    }
  }, []);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <Router>
      <div className={`app-container ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <Routes>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/home" element={<MainContent />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/chat" element={<ThreadsPage toggleSidebar={toggleSidebar} isSidebarCollapsed={isSidebarCollapsed} />}>
            <Route index element={<NoChatSelected show={isSidebarCollapsed} />} />
            <Route path=":chatId" element={<ChatPage />} />
          </Route>
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/changelogs" element={<ChangeLogs />} />
          <Route path="/changelogs/:id" element={<ChangeLogs />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;