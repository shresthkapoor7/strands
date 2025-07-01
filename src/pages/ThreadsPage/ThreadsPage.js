import { useEffect, useState } from 'react';
import { useNavigate, Outlet, useParams } from 'react-router-dom';
import './ThreadsPage.css';
import { customAlphabet } from 'nanoid';

function ThreadsPage({ isSidebarCollapsed, toggleSidebar }) {
  const navigate = useNavigate();
  const { chatId } = useParams();
  const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 10);

  const [threads, setThreads] = useState([]);

  useEffect(() => {
    const fetchThreads = async () => {
      try {
        const deviceId = localStorage.getItem("deviceId");
        if (!deviceId) return;

        const res = await fetch('https://api.strandschat.com/api/get-threads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: deviceId })
        });

        const data = await res.json();
        setThreads(data.threads || []);
      } catch (error) {
        console.error('Failed to fetch threads:', error);
      }
    };
    fetchThreads();
  }, []);

  const handleCreateNewChat = () => {
    const newChatId = nanoid();
    navigate(`/chat/${newChatId}`);
  };

  return (
    <div className={`threads-page-container ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <div className="threads-sidebar">
        <button className="sidebar-toggle-btn" onClick={toggleSidebar}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="9" y1="3" x2="9" y2="21"></line>
          </svg>
        </button>
        <div className="sidebar-content">
          <button className="new-chat-btn" onClick={handleCreateNewChat}>
            <span className="plus-icon">+</span> New chat
          </button>
          <h2 className="recents-title">Recents</h2>
          <ul className="threads-list">
            {threads.map((thread) => (
              <li
                key={thread.chatId}
                className={`thread-item ${thread.chatId === chatId ? 'active' : ''}`}
                onClick={() => navigate(`/chat/${thread.chatId}`)}
              >
                {thread.chatTitle || 'Untitled Chat'}
              </li>
            ))}
          </ul>
        </div>
        <div className={`sidebar-footer ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
            <button className="sidebar-nav-btn" onClick={() => navigate('/home')}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                <span className="sidebar-nav-text">Home</span>
            </button>
            <button className="sidebar-nav-btn" onClick={() => navigate('/settings')}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                <span className="sidebar-nav-text">Settings</span>
            </button>
        </div>
      </div>

      <div className="chat-view">
        <Outlet />
      </div>
    </div>
  );
}

export default ThreadsPage;