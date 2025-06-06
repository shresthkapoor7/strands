import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ThreadsPage.css';
import { customAlphabet } from 'nanoid';

function Threads() {
  const navigate = useNavigate();
  const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 10);

  const [threads, setThreads] = useState([]);

  useEffect(() => {
    const fetchThreads = async () => {
      try {
        const deviceId = localStorage.getItem("deviceId");

        const res = await fetch('https://api.strandschat.com/api/get-threads', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
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

  const handleThreadClick = (chatId) => {
    navigate(`/chat/${chatId}`);
  };

  return (
    <div className="main-content">
      <h1 className="threads-title">Your Chats</h1>

      <div className="threads-grid">
        {threads.map((thread) => (
          <div key={thread.chatId} className="thread-card" onClick={() => handleThreadClick(thread.chatId)}>
            <div className="thread-image" />
            <div className="thread-title">{thread.chatTitle || 'Untitled Chat'}</div>
          </div>
        ))}

        <div className="thread-card add-thread" onClick={handleCreateNewChat}>
          <div className="plus-icon">+</div>
        </div>
      </div>
    </div>
  );
}

export default Threads;