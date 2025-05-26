import { useNavigate } from 'react-router-dom';
import './ThreadsPage.css';

function Threads() {
  const navigate = useNavigate();

  const dummyThreads = [
    { id: 1, title: "Brainstorm AI Startup Ideas" },
    { id: 2, title: "Plan Solo Europe Trip" },
    { id: 3, title: "Deep Dive into Neural Networks" },
    { id: 4, title: "Grocery List Chat" },
  ];

  const handleCreateNewChat = () => {
    const newChatId = Date.now();
    navigate(`/chat/${newChatId}`);
  };

  return (
    <div className="main-content">
      <h1 className="threads-title">Your Threads</h1>

      <div className="threads-grid">
        {dummyThreads.map(thread => (
          <div key={thread.id} className="thread-card">
            <div className="thread-image" />
            <div className="thread-title">{thread.title}</div>
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