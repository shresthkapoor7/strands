import { useNavigate } from 'react-router-dom';
import { customAlphabet } from 'nanoid';
import { useState, useEffect, useRef } from 'react';
import './MainContent.css';
import ProblemDiagram from './ProblemDiagram';
import SolutionDiagram from './SolutionDiagram';
import ThreadedThinkingDemo from './ThreadedThinkingDemo';
import StreamingAIDemo from './StreamingAIDemo';
import ModelSwitchingDemo from './ModelSwitchingDemo';
import ReduceHallucinationsDemo from './ReduceHallucinationsDemo';

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
    window.scrollTo(0, 0);
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
        <div className="landing-nav">
          <span className="landing-brand">Strands</span>
          <a href="/chat" className="landing-nav-link">Chats</a>
          <a href="/changelogs" className="landing-nav-link">Changelogs</a>
          <a href="/settings" className="landing-nav-link">Settings</a>
          <a
            href="https://github.com/shresthkapoor7/strands"
            target="_blank"
            rel="noopener noreferrer"
            className="landing-nav-link github-link"
            aria-label="View on GitHub"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            <span>Shresth</span>
          </a>
          <button className="landing-get-started" onClick={handleStartChat}>
            Get Started!
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
        <div className="hero-container">
          <div className="yc-badge">
            <span className="yc-logo">Y</span>
            <span className="yc-text">Not backed by Y Combinator</span>
          </div>
          <h1 className="landing-title">Solution to your <br /> AI assistant woes</h1>
          <p className="landing-description">
          Your AI assistant for structured, context-rich conversations.
          Think in threads. Explore freely. Stay focused.
          </p>
          <div className="landing-showcase">
            <div id="features" className="landing-features">
              <div className="landing-feature">
                <ThreadedThinkingDemo />
                <div className="feature-text-section">
                  <div>
                    <h3 className="feature-title">Threaded Thinking</h3>
                    <p className="feature-desc">Branch off ideas without breaking flow.</p>
                  </div>
                </div>
              </div>
              <div className="landing-feature">
                <StreamingAIDemo />
                <div className="feature-text-section">
                  <div>
                    <h3 className="feature-title">Streaming AI</h3>
                    <p className="feature-desc">Low-latency responses from top LLMs.</p>
                  </div>
                </div>
              </div>
              <div className="landing-feature">
                <ModelSwitchingDemo />
                <div className="feature-text-section">
                  <div>
                    <h3 className="feature-title">Model Switching</h3>
                    <p className="feature-desc">Switch between different LLMs with one click.</p>
                  </div>
                </div>
              </div>
              <div className="landing-feature">
                <ReduceHallucinationsDemo />
                <div className="feature-text-section">
                  <div>
                    <h3 className="feature-title">Reduce Hallucinations</h3>
                    <p className="feature-desc">See the context being sent to the LLM.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="scroll-features-container">
          <div className="scroll-feature problem-section">
            <div className="problem-image-container">
              <ProblemDiagram />
            </div>
            <div className="problem-text-container">
              <h2 className="scroll-feature-title">The Problem</h2>
              <div className="message-container">
                <div className="message user-message">
                  <div className="message-avatar user-avatar">😓</div>
                  <div className="message-content">
                    One wrong turn and your LLM loses the plot. Long chats bloat context. New ideas break flow. You either reset everything or lose clarity.
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="scroll-feature solution-section">
            <div className="solution-text-container">
              <h2 className="scroll-feature-title">The Solution</h2>
              <div className="message-container">
                <div className="message ai-message">
                  <div className="message-avatar ai-avatar">🚀</div>
                  <div className="message-content">
                    Strands keeps your context intact. Start new threads on any message, reduce hallucinations, and switch models without losing memory.
                  </div>
                </div>
              </div>
            </div>
            <div className="solution-image-container">
              <SolutionDiagram />
            </div>
          </div>
        </div>
      </main>

      <section className="email-signup-section">
      <h2 className="signup-title">Stay in the l∞p</h2>
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

    </div>
  );
}

export default MainContent;