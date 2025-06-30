import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { customAlphabet } from 'nanoid';
import './App.css';
import { useEffect } from 'react';
import ThreadsPage from './pages/ThreadsPage/ThreadsPage';
import SettingsPage from './pages/SettingsPage/SettingsPage';
import MainContent from './components/MainContent';
import ChatPage from './pages/ChatPage/ChatPage';

const NoChatSelected = () => (
  <div className="no-chat-selected">
    <h2>Select a chat or start a new one</h2>
    <p>Your conversations will appear here.</p>
  </div>
);

function App() {
  useEffect(() => {
    let deviceId = localStorage.getItem("deviceId");
    if (!deviceId) {
      deviceId = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 20)();
      localStorage.setItem("deviceId", deviceId);
    }
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<MainContent />} />
        <Route path="/chat" element={<ThreadsPage />}>
          <Route index element={<NoChatSelected />} />
          <Route path=":chatId" element={<ChatPage />} />
        </Route>
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </Router>
  );
}

export default App;