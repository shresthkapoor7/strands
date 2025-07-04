import React from 'react';
import './Diagrams.css';

const SolutionDiagram = () => {
  return (
    <svg viewBox="0 0 400 200" className="diagram-svg">
       <defs>
        <marker id="arrow-main-sol" viewBox="0 0 10 10" refX="5" refY="5"
            markerWidth="6" markerHeight="6"
            orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#A0AEC0" />
        </marker>
        <marker id="arrow-branch-sol" viewBox="0 0 10 10" refX="5" refY="5"
            markerWidth="4" markerHeight="4"
            orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#60a5fa" />
        </marker>
      </defs>
      {/* Main line */}
      <line x1="50" y1="100" x2="150" y2="100" className="diagram-line main-line-1"/>
      <line x1="150" y1="100" x2="250" y2="100" className="diagram-line main-line-2"/>
      <line x1="250" y1="100" x2="350" y2="100" className="diagram-line main-line-3" markerEnd="url(#arrow-main-sol)"/>

      {/* Main dots */}
      <circle cx="50" cy="100" r="8" className="diagram-dot dot-1" />
      <circle cx="150" cy="100" r="8" className="diagram-dot dot-2" />
      <circle cx="250" cy="100" r="8" className="diagram-dot dot-3" />
      <circle cx="350" cy="100" r="8" className="diagram-dot dot-4" />

      {/* Branch 1 */}
      <line x1="150" y1="100" x2="200" y2="50" className="diagram-branch-line branch-line-1" markerEnd="url(#arrow-branch-sol)"/>
      <circle cx="200" cy="50" r="6" className="diagram-branch-dot branch-1-dot-1" />
      <line x1="200" y1="50" x2="250" y2="20" className="diagram-branch-line branch-line-2" markerEnd="url(#arrow-branch-sol)"/>
      <circle cx="250" cy="20" r="6" className="diagram-branch-dot branch-1-dot-2" />


      {/* Branch 2 */}
      <line x1="250" y1="100" x2="300" y2="150" className="diagram-branch-line branch-line-3" markerEnd="url(#arrow-branch-sol)" />
      <circle cx="300" cy="150" r="6" className="diagram-branch-dot branch-2-dot-1" />

    </svg>
  );
};

export default SolutionDiagram;