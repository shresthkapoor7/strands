import { useNavigate } from 'react-router-dom';
import { customAlphabet } from 'nanoid';
import { useState, useEffect, useRef } from 'react';
import './MainContent.css';
import ProblemDiagram from './ProblemDiagram';
import SolutionDiagram from './SolutionDiagram';

function MainContent() {
  const navigate = useNavigate();
  const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 10);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isContentLoaded, setIsContentLoaded] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  const emailRef = useRef();

  const handleSubmit = (e) => {
    e.preventDefault();
    const userEmail = emailRef.current.value;
    if (!userEmail) return;
    window.location.href = `https://shresthkapoor7.substack.com/subscribe?email=${encodeURIComponent(userEmail)}`;
  };

  useEffect(() => {
    window.scrollTo(-1000, -1000);
  }, []);

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

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsContentLoaded(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isContentLoaded) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
      }
    );

    const elements = document.querySelectorAll('.scroll-feature, .email-signup-section');
    elements.forEach((el) => observer.observe(el));

    return () => {
      elements.forEach((el) => {
        if (el) {
          observer.unobserve(el);
        }
      });
    };
  }, [isContentLoaded]);

  const handleGetStarted = () => {
    navigate('/chat');
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 30) {
        setHasScrolled(true);
        window.removeEventListener('scroll', handleScroll);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleStartChat = () => {
    const newChatId = nanoid();
    navigate(`/chat/${newChatId}`);
  };

  const closeMenuAndNavigate = (path) => {
    setIsMobileMenuOpen(false);
    navigate(path);
  };

  return (
    <div className={`landing-root ${isContentLoaded ? 'loaded' : ''}`}>
      <header className="landing-header">
        <div className="landing-logo">Strands</div>
        <div className="landing-nav">
          <a href="/chat" className="landing-nav-link">Chats</a>
          <a href="/changelogs" className="landing-nav-link">Changelogs</a>
          <a href="/settings" className="landing-nav-link">Settings</a>
          <button className="landing-get-started" onClick={handleStartChat}>
            Start a New Chat
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
          <a onClick={() => closeMenuAndNavigate('/chat')} className="landing-nav-link">Chats</a>
          <a onClick={() => closeMenuAndNavigate('/changelogs')} className="landing-nav-link">Changelogs</a>
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
        <div className={`scroll-down-container ${hasScrolled ? 'hidden' : ''}`}>
          <span className="scroll-down-arrow" aria-label="Scroll down">
            ↓
          </span>
        </div>
        <footer className={`landing-footer initial-footer ${hasScrolled ? 'hidden' : ''}`}>
        <p style={{ color: 'grey', fontSize: '10px', marginTop: '0px' }}>
          Made by Shresth Kapoor. View codebase on <a href="https://github.com/shresthkapoor7/strands" target="_blank" rel="noopener noreferrer">GitHub</a>.
        </p>
      </footer>
        <div className="scroll-features-container">
          <div className="scroll-feature problem-section">
            <div className="problem-image-container">
              <ProblemDiagram />
            </div>
            <div className="problem-text-container">
              <h2 className="scroll-feature-title">The Problem</h2>
              <p className="scroll-feature-description">
              LLMs can go off-track with just one bad response.
That single confusing prompt? It can send the whole conversation spiraling into hallucinations. And if you're trying to explore a new idea midway through a chat, you're stuck between two frustrating options:
Start a new conversation - and lose all the valuable context you've built - or keep going in the same thread and risk bloating the context window, gradually pushing earlier insights into irrelevance. As the conversation gets longer, the model remembers less of what actually mattered.
              </p>
            </div>
          </div>

          <div className="scroll-feature solution-section">
            <div className="solution-text-container">
              <h2 className="scroll-feature-title">The Solution</h2>
              <p className="scroll-feature-description">
                Strands lets you branch off from any message in a conversation, keeping the original context intact. You can explore side ideas freely without polluting the main thread - and close them off when you're done. You also get full visibility into the context being sent to the LLM, helping you catch and reduce hallucinations. Plus, with support for multiple models, you can switch between them without losing the shared knowledge of your ongoing conversation.
              </p>
            </div>
            <div className="solution-image-container">
              <SolutionDiagram />
            </div>
          </div>
        </div>
      </main>

      <section className="email-signup-section">
      <h2 className="signup-title">Stay in the loop</h2>
      <p className="signup-description">Sign up for updates on new features and models.</p>
      <form className="email-signup-form" onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="your@email.com"
          className="email-input"
          ref={emailRef}
          required
        />
        <button type="submit" className="signup-button">Sign Up</button>
      </form>
    </section>

      {/* Start a new chat button */}
      <div className="start-chat-button-container">
        <button className="landing-get-started" onClick={handleGetStarted}>
          Get Started!
        </button>
      </div>

      <footer className="landing-footer">
        <p style={{ color: 'grey', fontSize: '10px', marginTop: '0px' }}>
          Made by Shresth Kapoor. View codebase on <a href="https://github.com/shresthkapoor7/strands" target="_blank" rel="noopener noreferrer">GitHub</a>.
        </p>
      </footer>

    </div>
  );
}

export default MainContent;