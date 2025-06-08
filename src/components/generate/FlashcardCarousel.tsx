import React from 'react';
import { useFlashcardReview } from './hooks/useFlashcardReview';
import { FlashcardCard } from './FlashcardCard';
import { ActionButtons } from './ActionButtons';
import { Button } from '@/components/ui/button';
import { type FlashcardGeneratedDTO } from '@/types';
import { ChevronLeftIcon } from '@radix-ui/react-icons';
import { ChevronRightIcon } from '@radix-ui/react-icons';

interface FlashcardCarouselProps {
  flashcards: FlashcardGeneratedDTO[];
  onDecision: (id: string, decision: 'accept' | 'reject') => void;
  onEdit: (
    id: string,
    field: 'front_content' | 'back_content',
    value: string
  ) => void;
  onComplete: () => void;
}

export function FlashcardCarousel({
  flashcards,
  onDecision,
  onEdit,
  onComplete,
}: FlashcardCarouselProps) {
  const {
    currentFlashcard,
    isFlipped,
    editMode,
    currentIndex,
    totalCount,
    flipCard,
    goToNext,
    goToPrevious,
    acceptCurrent,
    rejectCurrent,
    toggleEditMode,
    editCurrent,
    getCurrentFlashcardContent,
  } = useFlashcardReview(flashcards, onDecision);

  if (!currentFlashcard) {
    return <div>No flashcards available for review.</div>;
  }

  const handleAccept = () => {
    onDecision(currentFlashcard.id, 'accept');
    if (currentIndex === totalCount - 1) {
      onComplete();
    } else {
      goToNext();
    }
  };

  const handleReject = () => {
    onDecision(currentFlashcard.id, 'reject');
    if (currentIndex === totalCount - 1) {
      onComplete();
    } else {
      goToNext();
    }
  };

  const handleEdit = (
    field: 'front_content' | 'back_content',
    value: string
  ) => {
    onEdit(currentFlashcard.id, field, value);
    editCurrent(field, value);
  };

  const currentContent = getCurrentFlashcardContent();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Review Flashcards</h2>
        <div className="text-sm text-gray-500">
          Card {currentIndex + 1} of {totalCount}
        </div>
      </div>

      <div className="relative">
        <FlashcardCard
          flashcard={{
            ...currentFlashcard,
            front_content: currentContent.front,
            back_content: currentContent.back,
          }}
          isFlipped={isFlipped}
          onFlip={flipCard}
          onEdit={handleEdit}
          isEditable={editMode}
        />

        {/* Navigation arrows */}
        <div className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-12">
          <Button
            variant="outline"
            size="icon"
            onClick={goToPrevious}
            disabled={currentIndex === 0}
            className="rounded-full h-10 w-10"
          >
            <ChevronLeftIcon className="h-5 w-5" />
          </Button>
        </div>

        <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-12">
          <Button
            variant="outline"
            size="icon"
            onClick={goToNext}
            disabled={currentIndex === totalCount - 1}
            className="rounded-full h-10 w-10"
          >
            <ChevronRightIcon className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <ActionButtons
        onAccept={handleAccept}
        onReject={handleReject}
        onToggleEdit={toggleEditMode}
        isEditMode={editMode}
      />

      <div className="flex justify-center space-x-1">
        {flashcards.map((_, index) => (
          <div
            key={index}
            className={`h-1.5 w-8 rounded-full ${
              index === currentIndex ? 'bg-blue-600' : 'bg-gray-200'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
