import React from 'react';
import { ProgressIndicator } from './ProgressIndicator';

interface GenerateLayoutProps {
  currentStep: 1 | 2 | 3;
  children: React.ReactNode;
}

export function GenerateLayout({ currentStep, children }: GenerateLayoutProps) {
  return (
    <div className="max-w-4xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Generate Flashcards</h1>
        <ProgressIndicator currentStep={currentStep} totalSteps={3} />
      </header>
      <main>{children}</main>
    </div>
  );
}
