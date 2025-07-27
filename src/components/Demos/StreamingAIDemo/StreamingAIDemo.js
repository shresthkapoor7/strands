import React from 'react';
import './StreamingAIDemo.css';

function StreamingAIDemo() {
  const streamedText = "Code splitting, lazy loading...";

  return (
    <div className="streaming-demo-container">
      <div className="streaming-chat">
        <div className="streaming-message user-message">
          <div className="streaming-avatar user-avatar">U</div>
          <div className="streaming-content">What are the best practices for React optimization?</div>
        </div>


        <div className="streaming-message ai-message">
          <div className="streaming-avatar ai-avatar">AI</div>
          <div className="streaming-content">
            <span className="streaming-text">{streamedText}</span>
            <span className="streaming-cursor">|</span>
          </div>
        </div>
      </div>

      <div className="streaming-indicator">
        <div className="streaming-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
        <span className="streaming-label">Streaming...</span>
      </div>
    </div>
  );
}

export default StreamingAIDemo;