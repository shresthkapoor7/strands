import React from 'react';
import './ThreadedThinkingDemo.css';

function ThreadedThinkingDemo() {
  return (
    <div className="threaded-demo-container">
      {/* Main conversation */}
      <div className="demo-chat main-chat">
        <div className="demo-message user-message">
          <div className="demo-avatar user-avatar">U</div>
          <div className="demo-content">How do I optimize my React app?</div>
        </div>
        <div className="demo-message ai-message">
          <div className="demo-avatar ai-avatar">AI</div>
          <div className="demo-content">
            Here are several ways to optimize your React app...
            <button className="start-strand-btn">Start a Strand</button>
          </div>
        </div>
      </div>

      {/* Branched strand */}
      <div className="demo-chat strand-chat">
        <div className="strand-indicator">New Strand</div>
        <div className="demo-message user-message">
          <div className="demo-avatar user-avatar">U</div>
          <div className="demo-content">What about Redux vs Context?</div>
        </div>
        <div className="demo-message ai-message">
          <div className="demo-avatar ai-avatar">AI</div>
          <div className="demo-content">Great question! Redux and Context serve different purposes...</div>
        </div>
      </div>

      {/* Connection line */}
      <div className="strand-connection"></div>
    </div>
  );
}

export default ThreadedThinkingDemo;