import React from 'react';
import './Diagrams.css';

const ProblemDiagram = () => {
  return (
    <svg viewBox="0 0 400 100" className="diagram-svg">
      <defs>
        <marker id="arrow-prob" viewBox="0 0 10 10" refX="5" refY="5"
            markerWidth="6" markerHeight="6"
            orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#A0AEC0" />
        </marker>
      </defs>
      <line x1="50" y1="50" x2="150" y2="50" className="diagram-line line-seg-1" />
      <line x1="150" y1="50" x2="250" y2="50" className="diagram-line line-seg-2" />
      <line x1="250" y1="50" x2="350" y2="50" className="diagram-line line-seg-3" markerEnd="url(#arrow-prob)" />
      <circle cx="50" cy="50" r="8" className="diagram-dot dot-1" />
      <circle cx="150" cy="50" r="8" className="diagram-dot dot-2" />
      <circle cx="250" cy="50" r="8" className="diagram-dot dot-3" />
      <circle cx="350" cy="50" r="8" className="diagram-dot dot-4" />
    </svg>
  );
};

export default ProblemDiagram;