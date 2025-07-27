import React, { useState } from 'react';
import './ReduceHallucinationsDemo.css';

function ReduceHallucinationsDemo() {
  const [isHallucinationVisible, setIsHallucinationVisible] = useState(true);
  const [isRemoving, setIsRemoving] = useState(false);

  const handleRemoveHallucination = () => {
    setIsRemoving(true);
    setTimeout(() => {
      setIsHallucinationVisible(false);
      // Reset after a delay to show the demo again
      setTimeout(() => {
        setIsHallucinationVisible(true);
        setIsRemoving(false);
      }, 2000);
    }, 500);
  };

  return (
    <div className="hallucination-demo-container">
      <div className="hallucination-chat">
        <div className="hallucination-message user-message">
          <div className="hallucination-avatar user-avatar">U</div>
          <div className="hallucination-content">
            What's the capital of Australia?
          </div>
        </div>

        {isHallucinationVisible && (
          <div className={`hallucination-message ai-message ${isRemoving ? 'removing' : ''}`}>
            <div className="hallucination-avatar ai-avatar">AI</div>
            <div className="hallucination-content">
              The capital of Australia is Sydney, which is also the largest city...
              <button
                className="remove-hallucination-btn"
                onClick={handleRemoveHallucination}
                title="Remove hallucination"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {!isHallucinationVisible && (
          <div className="corrected-message">
            <div className="correction-icon">✓</div>
            <span className="correction-text">Hallucination removed! Context cleaned.</span>
          </div>
        )}
      </div>

      <div className="hallucination-warning">
        <div className="warning-indicator"></div>
        <span className="warning-text">
          {isHallucinationVisible ? "Potential hallucination detected" : "Context verified"}
        </span>
      </div>
    </div>
  );
}

export default ReduceHallucinationsDemo;