import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeftIcon } from '@radix-ui/react-icons';
import { ChevronRightIcon } from '@radix-ui/react-icons';

interface ReviewNavigationButtonsProps {
  onPrevious: () => void;
  onComplete: () => void;
  cardsReviewed: number;
  totalCards: number;
}

export function ReviewNavigationButtons({
  onPrevious,
  onComplete,
  cardsReviewed,
  totalCards,
}: ReviewNavigationButtonsProps) {
  const progress = Math.round((cardsReviewed / totalCards) * 100);

  return (
    <div className="flex flex-col space-y-4">
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className="bg-blue-600 h-2.5 rounded-full"
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      <div className="flex justify-between items-center">
        <Button variant="outline" onClick={onPrevious}>
          <ChevronLeftIcon className="mr-2 h-4 w-4" />
          Back to Text Input
        </Button>

        <div className="text-sm text-gray-500">
          {cardsReviewed} of {totalCards} cards reviewed ({progress}%)
        </div>

        <Button onClick={onComplete} disabled={cardsReviewed < totalCards}>
          Finish Review
          <ChevronRightIcon className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
