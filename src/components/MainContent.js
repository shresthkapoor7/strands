import { useNavigate } from 'react-router-dom';
import { customAlphabet } from 'nanoid';

function MainContent() {
  const navigate = useNavigate();
  const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 10);

  const handleStartChat = () => {
    const newChatId = nanoid();
    navigate(`/chat/${newChatId}`);
  };

  return (
    <div className="main-content">
      <h1 className="main-title">Welcome to Strands 👋</h1>

      <p className="main-description">
        <strong>Strands</strong> is your personal conversational space — powered by <strong>Gemini</strong> and built for deep, threaded conversations.
      </p>

      <p className="main-description">
        Instead of a flat, endless chat history, Strands uses a smart context queue to carry forward the most relevant parts of your conversation — helping you explore branches without losing focus.
      </p>

      <p className="main-description">
        ✨ Think of it like Slack threads meets ChatGPT — but purpose-built for structured, thoughtful AI conversations.
      </p>

      <p className="main-description">
        Whether you're brainstorming, researching, or learning something new, Strands helps you stay organized and think clearly.
      </p>

      <p className="main-description" style={{ fontStyle: "italic", color: "#aaa" }}>
  Later iterations of the app will incorporate support for more AI models and give users direct control over which context gets passed into each message.
  <span className="coming-soon-badge">Coming Soon</span>
</p>

      <div className="main-links">
        <a
          href="https://github.com/shresthkapoor7/strands"
          target="_blank"
          rel="noopener noreferrer"
          className="github-link"
        >
          View Project on GitHub 🚀
        </a>

        <button className="start-chat-btn" onClick={handleStartChat}>
          Start a New Chat 💬
        </button>
      </div>
    </div>
  );
}

export default MainContent;