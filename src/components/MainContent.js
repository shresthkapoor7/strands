import { useNavigate } from 'react-router-dom';
import { customAlphabet } from 'nanoid';
import { useState, useEffect } from 'react';

function MainContent() {
  const navigate = useNavigate();
  const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 10);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isMobileMenuOpen]);

  const handleStartChat = () => {
    const newChatId = nanoid();
    navigate(`/chat/${newChatId}`);
  };

  const closeMenuAndNavigate = (path) => {
    setIsMobileMenuOpen(false);
    navigate(path);
  };

  return (
    <div className="landing-root">
      <header className="landing-header">
        <div className="landing-logo">Strands</div>
        <div className="landing-nav">
          <a href="/chat" className="landing-nav-link">Chats</a>
          <a href="/settings" className="landing-nav-link">Settings</a>
          <button className="landing-get-started" onClick={handleStartChat}>
            Start a new Chat
          </button>
        </div>
        <button
          className="mobile-nav-toggle"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle navigation"
        >
          {isMobileMenuOpen ? '✕' : '☰'}
        </button>
      </header>

      {isMobileMenuOpen && (
        <div className="mobile-nav-menu">
          <a onClick={() => closeMenuAndNavigate('/threads')} className="landing-nav-link">Chats</a>
          <a onClick={() => closeMenuAndNavigate('/settings')} className="landing-nav-link">Settings</a>
          <button className="landing-get-started" onClick={() => {
            setIsMobileMenuOpen(false);
            handleStartChat();
          }}>
            Start a new Chat
          </button>
        </div>
      )}

      <main className="landing-main">
        <h1 className="landing-title">Meet Strands</h1>
        <p className="landing-description">
          Strands is a next generation AI assistant built for deep, structured conversations. Stay organized, explore ideas, and do your best work with context-aware threads.
        </p>
        <div className="landing-showcase">
            <img src="animated_branch_tree.gif" alt="Animated pixel art" className="landing-gif" />
          <div id="features" className="landing-features">
            <div className="landing-feature">
              <span className="feature-icon">🧠</span>
              <div>
                <h3 className="feature-title">Think in threads</h3>
                <p className="feature-desc">Break free from linear chats. Strands lets you create contextual branches — so you can explore ideas, backtrack, and revisit thoughts without losing the flow.</p>
              </div>
            </div>
            <div className="feature-divider" />
            <div className="landing-feature">
              <span className="feature-icon">⚡</span>
              <div>
                <h3 className="feature-title">Powered by Streaming AI</h3>
                <p className="feature-desc">Experience low-latency responses with streaming support for Gemini and other cutting-edge LLMs via OpenRouter integration.</p>
              </div>
            </div>
            <div className="feature-divider" />
            <div className="landing-feature">
              <span className="feature-icon">🤝</span>
              <div>
                <h3 className="feature-title">Switch between models</h3>
                <p className="feature-desc">Switch between different LLMs with one click. Each model remembers your context.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default MainContent;