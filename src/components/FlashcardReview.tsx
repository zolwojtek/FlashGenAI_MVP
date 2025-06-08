import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Flashcard } from './Flashcard';
import { CreationMode, type FlashcardGeneratedDTO } from '../types';

interface FlashcardReviewProps {
  flashcards: FlashcardGeneratedDTO[];
  title: string;
  isLoading?: boolean;
  onAccept?: (id: string) => void;
  onReject?: (id: string) => void;
  onEdit?: (id: string, content: string, side: 'front' | 'back') => void;
  onComplete?: (acceptedIds: string[], rejectedIds: string[]) => void;
  className?: string;
}

export function FlashcardReview({
  flashcards,
  title,
  isLoading = false,
  onAccept,
  onReject,
  onEdit,
  onComplete,
  className,
}: FlashcardReviewProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [accepted, setAccepted] = useState<string[]>([]);
  const [rejected, setRejected] = useState<string[]>([]);
  const [edited, setEdited] = useState<Record<string, FlashcardGeneratedDTO>>(
    {}
  );

  const currentFlashcard = flashcards[currentIndex];
  const isReviewed = (id: string) =>
    accepted.includes(id) || rejected.includes(id);
  const remainingCount = flashcards.length - accepted.length - rejected.length;

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else if (remainingCount === 0) {
      // All flashcards have been reviewed
      onComplete?.(accepted, rejected);
    }
  };

  const handleAccept = (id: string) => {
    if (!isReviewed(id)) {
      setAccepted([...accepted, id]);
      onAccept?.(id);
      handleNext();
    }
  };

  const handleReject = (id: string) => {
    if (!isReviewed(id)) {
      setRejected([...rejected, id]);
      onReject?.(id);
      handleNext();
    }
  };

  const handleEdit = (id: string, content: string, side: 'front' | 'back') => {
    const flashcard = flashcards.find((f) => f.id === id);
    if (!flashcard) return;

    const updatedFlashcard: FlashcardGeneratedDTO = {
      ...flashcard,
      [side === 'front' ? 'front_content' : 'back_content']: content,
      creation_mode:
        flashcard.creation_mode === CreationMode.AI
          ? CreationMode.AI_EDITED
          : flashcard.creation_mode,
    };

    setEdited({
      ...edited,
      [id]: updatedFlashcard,
    });

    onEdit?.(id, content, side);
  };

  if (isLoading) {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center p-8',
          className
        )}
      >
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <p className="mt-4 text-lg">Generating flashcards...</p>
      </div>
    );
  }

  if (flashcards.length === 0) {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center p-8',
          className
        )}
      >
        <p className="text-lg text-gray-600">
          No flashcards available for review.
        </p>
      </div>
    );
  }

  // Use the edited version of the flashcard if it exists
  const displayFlashcard = edited[currentFlashcard.id] || currentFlashcard;

  return (
    <div className={cn('flex flex-col items-center', className)}>
      <div className="w-full max-w-4xl">
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold">{title}</h2>
          <p className="text-gray-600">
            Reviewing flashcard {currentIndex + 1} of {flashcards.length}
          </p>
          <div className="flex justify-center space-x-4 mt-2">
            <span className="text-green-600 flex items-center">
              <CheckIcon className="h-5 w-5 mr-1" />
              {accepted.length} accepted
            </span>
            <span className="text-red-600 flex items-center">
              <XIcon className="h-5 w-5 mr-1" />
              {rejected.length} rejected
            </span>
            <span className="text-gray-600 flex items-center">
              <ClockIcon className="h-5 w-5 mr-1" />
              {remainingCount} remaining
            </span>
          </div>
        </div>

        <div className="relative mb-8">
          <Flashcard
            flashcard={displayFlashcard}
            isEditable={true}
            onEdit={(content, side) =>
              handleEdit(currentFlashcard.id, content, side)
            }
          />
        </div>

        <div className="flex justify-center space-x-4">
          <button
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className="p-2 rounded-full bg-gray-200 text-gray-600 disabled:opacity-50"
          >
            <ChevronLeftIcon className="h-6 w-6" />
          </button>

          <button
            onClick={() => handleReject(currentFlashcard.id)}
            className={cn(
              'px-6 py-2 rounded-lg flex items-center',
              rejected.includes(currentFlashcard.id)
                ? 'bg-red-200 text-red-800'
                : 'bg-red-600 text-white hover:bg-red-700'
            )}
          >
            <XIcon className="h-5 w-5 mr-2" />
            Reject
          </button>

          <button
            onClick={() => handleAccept(currentFlashcard.id)}
            className={cn(
              'px-6 py-2 rounded-lg flex items-center',
              accepted.includes(currentFlashcard.id)
                ? 'bg-green-200 text-green-800'
                : 'bg-green-600 text-white hover:bg-green-700'
            )}
          >
            <CheckIcon className="h-5 w-5 mr-2" />
            Accept
          </button>

          <button
            onClick={handleNext}
            disabled={
              currentIndex === flashcards.length - 1 && remainingCount > 0
            }
            className="p-2 rounded-full bg-gray-200 text-gray-600 disabled:opacity-50"
          >
            <ChevronRightIcon className="h-6 w-6" />
          </button>
        </div>

        {remainingCount === 0 && (
          <div className="mt-8 text-center">
            <button
              onClick={() => onComplete?.(accepted, rejected)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Complete Review
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Icon components
function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4.5 12.75l6 6 9-13.5"
      />
    </svg>
  );
}

function XIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  );
}

function ClockIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

function ChevronLeftIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.75 19.5L8.25 12l7.5-7.5"
      />
    </svg>
  );
}

function ChevronRightIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8.25 4.5l7.5 7.5-7.5 7.5"
      />
    </svg>
  );
}
