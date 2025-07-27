import React, { useState } from 'react';
import './ModelSwitchingDemo.css';

function ModelSwitchingDemo() {
  const [selectedModel, setSelectedModel] = useState('gpt-4');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const models = [
    { id: 'gpt-4', name: 'GPT-4', provider: 'OpenAI' },
    { id: 'claude-3', name: 'Claude 3', provider: 'Anthropic' },
    { id: 'gemini-pro', name: 'Gemini Pro', provider: 'Google' },
    { id: 'llama-2', name: 'Llama 2', provider: 'Meta' }
  ];

  const handleModelSelect = (modelId) => {
    setSelectedModel(modelId);
    setIsDropdownOpen(false);
  };

  const selectedModelData = models.find(m => m.id === selectedModel);

  return (
    <div className="model-switching-demo-container">
      <div className="demo-header">
        <span className="demo-label">Current Model:</span>
      </div>

      <div className="model-selector">
        <button
          className="model-dropdown-trigger"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        >
          <div className="model-info">
            <span className="model-name">{selectedModelData.name}</span>
            <span className="model-provider">by {selectedModelData.provider}</span>
          </div>
          <span className={`dropdown-arrow ${isDropdownOpen ? 'open' : ''}`}>▼</span>
        </button>

        {isDropdownOpen && (
          <div className="model-dropdown">
            {models.map((model) => (
              <div
                key={model.id}
                className={`model-option ${model.id === selectedModel ? 'selected' : ''}`}
                onClick={() => handleModelSelect(model.id)}
              >
                <div className="model-option-info">
                  <span className="option-name">{model.name}</span>
                  <span className="option-provider">by {model.provider}</span>
                </div>
                {model.id === selectedModel && (
                  <span className="check-mark">✓</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="switching-status">
        <div className="status-indicator"></div>
        <span className="status-text">Ready to switch models instantly</span>
      </div>
    </div>
  );
}

export default ModelSwitchingDemo;