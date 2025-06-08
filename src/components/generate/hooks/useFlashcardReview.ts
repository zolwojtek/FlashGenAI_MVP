import { useState } from 'react';
import { type FlashcardGeneratedDTO, type FlashcardReviewState } from '@/types';

export const useFlashcardReview = (
  flashcards: FlashcardGeneratedDTO[],
  onDecision: (id: string, decision: 'accept' | 'reject') => void
) => {
  const [state, setState] = useState<FlashcardReviewState>({
    currentIndex: 0,
    isFlipped: false,
    editMode: false,
    editedFlashcards: {},
  });

  const currentFlashcard = flashcards[state.currentIndex];

  // Flip the card
  const flipCard = () => {
    setState((prev) => ({ ...prev, isFlipped: !prev.isFlipped }));
  };

  // Move to the next card
  const goToNext = () => {
    if (state.currentIndex < flashcards.length - 1) {
      setState((prev) => ({
        ...prev,
        currentIndex: prev.currentIndex + 1,
        isFlipped: false,
      }));
    }
  };

  // Move to the previous card
  const goToPrevious = () => {
    if (state.currentIndex > 0) {
      setState((prev) => ({
        ...prev,
        currentIndex: prev.currentIndex - 1,
        isFlipped: false,
      }));
    }
  };

  // Accept the current card
  const acceptCurrent = () => {
    if (currentFlashcard) {
      onDecision(currentFlashcard.id, 'accept');
      goToNext();
    }
  };

  // Reject the current card
  const rejectCurrent = () => {
    if (currentFlashcard) {
      onDecision(currentFlashcard.id, 'reject');
      goToNext();
    }
  };

  // Toggle edit mode
  const toggleEditMode = () => {
    setState((prev) => ({ ...prev, editMode: !prev.editMode }));
  };

  // Edit the current card
  const editCurrent = (
    field: 'front_content' | 'back_content',
    value: string
  ) => {
    if (!currentFlashcard) return;

    setState((prev) => ({
      ...prev,
      editedFlashcards: {
        ...prev.editedFlashcards,
        [currentFlashcard.id]: {
          ...prev.editedFlashcards[currentFlashcard.id],
          [field === 'front_content' ? 'frontContent' : 'backContent']: value,
        },
      },
    }));
  };

  // Get the edited or original content for the current flashcard
  const getCurrentFlashcardContent = () => {
    if (!currentFlashcard) return { front: '', back: '' };

    const edits = state.editedFlashcards[currentFlashcard.id] || {};

    return {
      front:
        edits.frontContent !== undefined
          ? edits.frontContent
          : currentFlashcard.front_content,
      back:
        edits.backContent !== undefined
          ? edits.backContent
          : currentFlashcard.back_content,
    };
  };

  return {
    currentFlashcard,
    isFlipped: state.isFlipped,
    editMode: state.editMode,
    currentIndex: state.currentIndex,
    totalCount: flashcards.length,
    flipCard,
    goToNext,
    goToPrevious,
    acceptCurrent,
    rejectCurrent,
    toggleEditMode,
    editCurrent,
    getCurrentFlashcardContent,
  };
};
