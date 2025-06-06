import { useEffect, useState } from 'react';
import './SettingsPage.css';

function Settings({ darkMode, toggleDarkMode }) {
  const [mainChatQueue, setMainChatQueue] = useState(10);
  const [threadChatQueue, setThreadChatQueue] = useState(5);

  useEffect(() => {
    const savedMain = parseInt(localStorage.getItem('mainChatQueueSize')) || 10;
    const savedThread = parseInt(localStorage.getItem('threadChatQueueSize')) || 5;
    setMainChatQueue(savedMain);
    setThreadChatQueue(savedThread);
  }, []);

  const handleMainQueueChange = (e) => {
    const val = parseInt(e.target.value);
    setMainChatQueue(val);
    localStorage.setItem('mainChatQueueSize', val);
  };

  const handleThreadQueueChange = (e) => {
    const val = parseInt(e.target.value);
    setThreadChatQueue(val);
    localStorage.setItem('threadChatQueueSize', val);
  };

  return (
    <div className="main-content-settings">
      <h1>Settings</h1>

      <button
        id="darkModeToggle"
        className="fancy-button"
        onClick={toggleDarkMode}
      >
        {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
      </button>

      <div className="queue-settings">
        <div className="queue-block">
          <label>🧠 Main Chat Context Queue Size</label>
          <input
            type="number"
            min="1"
            max="50"
            value={mainChatQueue}
            onChange={handleMainQueueChange}
            className="styled-input"
          />
          <p className="queue-description">
            Determines how many recent messages are sent with each request in the main chat. Higher values give better context, but may slow responses slightly.
          </p>
        </div>

        <div className="queue-block">
          <label>🧵 Thread Chat Context Queue Size</label>
          <input
            type="number"
            min="1"
            max="20"
            value={threadChatQueue}
            onChange={handleThreadQueueChange}
            className="styled-input"
          />
          <p className="queue-description">
            Sets how much of the thread's history is passed to the AI. Useful for long sub-conversations without overwhelming the model.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Settings;