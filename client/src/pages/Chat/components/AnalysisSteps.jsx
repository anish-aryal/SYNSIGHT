import React from 'react';
import { Check } from 'lucide-react';

// Analysis Steps UI block for Chat page.

export default function AnalysisSteps({ steps, currentStep }) {
  // Layout and appearance
  return (
    <div className="mb-3">
      {steps.map((step, index) => {
        const isComplete = index < currentStep;
        const isCurrent = index === currentStep;

        return (
          <div key={index} className="analysis-step">
            <div
              className={`step-indicator ${
                isComplete ? 'completed' : isCurrent ? 'current' : 'pending'
              }`}
            >
              {isComplete ? <Check size={12} /> : index + 1}
            </div>
            <span
              className={`step-text ${
                isComplete ? 'completed' : isCurrent ? '' : 'pending'
              }`}
            >
              {step}
            </span>
          </div>
        );
      })}
    </div>
  );
}