import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './SettingsPage.css';

function SettingsPage() {
  const [mainChatQueueSize, setMainChatQueueSize] = useState(() => {
    const savedMain = parseInt(localStorage.getItem('mainChatQueueSize')) || 10;
    return savedMain;
  }, []);

  const [threadChatQueueSize, setThreadChatQueueSize] = useState(() => {
    const savedThread = parseInt(localStorage.getItem('threadChatQueueSize')) || 5;
    return savedThread;
  }, []);

  const handleSaveSettings = () => {
    localStorage.setItem('mainChatQueueSize', mainChatQueueSize);
    localStorage.setItem('threadChatQueueSize', threadChatQueueSize);
    alert('Settings saved!');
  };

  return (
    <div className="settings-container">
      <div className="settings-content">
        <Link to="/home" className="back-to-home-link">&larr; Back to Home</Link>
        <h1 className="settings-title">Settings</h1>

        <div className="setting-card">
          <h2 className="setting-title">
            <span role="img" aria-label="brain">🧠</span> Main Chat Context Queue Size
          </h2>
          <p className="setting-description">
            Determines how many recent messages are sent with each request in the main chat. Higher values give better context, but may slow responses slightly.
          </p>
          <div className="slider-container">
            <input
              type="range"
              min="1"
              max="50"
              className="slider"
              value={mainChatQueueSize}
              onChange={(e) => setMainChatQueueSize(e.target.value)}
            />
            <span className="slider-value">{mainChatQueueSize}</span>
          </div>
        </div>

        <div className="setting-card">
          <h2 className="setting-title">
            <span role="img" aria-label="thread">🧵</span> Thread Chat Context Queue Size
          </h2>
          <p className="setting-description">
            Sets how much of the thread's history is passed to the AI. Useful for long sub-conversations without overwhelming the model.
          </p>
          <div className="slider-container">
            <input
              type="range"
              min="1"
              max="20"
              className="slider"
              value={threadChatQueueSize}
              onChange={(e) => setThreadChatQueueSize(e.target.value)}
            />
            <span className="slider-value">{threadChatQueueSize}</span>
          </div>
        </div>

        <button className="save-settings-btn" onClick={handleSaveSettings}>Save Settings</button>
      </div>
    </div>
  );
}

export default SettingsPage;