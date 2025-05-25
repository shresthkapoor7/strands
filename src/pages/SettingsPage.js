import './SettingsPage.css';
import { useEffect, useState } from 'react';

function Settings() {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const storedTheme = localStorage.getItem('theme');
    const isDark = storedTheme === 'dark';

    setDarkMode(isDark);
    document.body.classList.toggle('dark', isDark);
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);

    document.body.classList.toggle('dark', newDarkMode);
    localStorage.setItem('theme', newDarkMode ? 'dark' : 'light');
  };

  return (
    <div className="main-content">
      <h1>Settings Page</h1>
      <button
        id="darkModeToggle"
        className="fancy-button"
        onClick={toggleDarkMode}
      >
        {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
      </button>
    </div>
  );
}

export default Settings;