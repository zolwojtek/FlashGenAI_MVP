import React from 'react';
import { cn } from '@/lib/utils';

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export function ProgressIndicator({
  currentStep,
  totalSteps,
}: ProgressIndicatorProps) {
  const steps = [
    { number: 1, label: 'Enter Text' },
    { number: 2, label: 'Review Flashcards' },
    { number: 3, label: 'Save Set' },
  ];

  return (
    <div className="flex justify-between">
      {steps.map((step) => (
        <div
          key={step.number}
          className="flex flex-col items-center space-y-2 relative"
        >
          <div
            className={cn(
              'h-10 w-10 rounded-full flex items-center justify-center text-sm font-medium',
              currentStep === step.number
                ? 'bg-blue-600 text-white'
                : currentStep > step.number
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 text-gray-500'
            )}
          >
            {currentStep > step.number ? (
              <CheckIcon className="h-5 w-5" />
            ) : (
              step.number
            )}
          </div>
          <span
            className={cn(
              'text-sm font-medium',
              currentStep === step.number
                ? 'text-blue-600'
                : currentStep > step.number
                  ? 'text-green-500'
                  : 'text-gray-500'
            )}
          >
            {step.label}
          </span>
          {step.number < totalSteps && (
            <div
              className={cn(
                'absolute top-5 left-10 h-0.5 w-[calc(100%-2.5rem)]',
                currentStep > step.number ? 'bg-green-500' : 'bg-gray-200'
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
}
