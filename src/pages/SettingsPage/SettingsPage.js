import './SettingsPage.css';

function Settings({ darkMode, toggleDarkMode }) {
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