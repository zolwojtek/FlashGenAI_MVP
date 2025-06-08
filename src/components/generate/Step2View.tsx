import React, { useEffect, useState } from 'react';
import { GenerateLayout } from './GenerateLayout';
import { useGenerationProcess } from './hooks/useGenerationProcess';
import { useNavigate } from '@/components/hooks/useNavigate';
import { FlashcardCarousel } from './FlashcardCarousel';
import { FlashcardReviewOptions } from './FlashcardReviewOptions';
import { ReviewNavigationButtons } from './ReviewNavigationButtons';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ExclamationTriangleIcon } from '@radix-ui/react-icons';
import { ChevronLeftIcon } from '@radix-ui/react-icons';
import { ChevronRightIcon } from '@radix-ui/react-icons';

export function Step2View() {
  const { state, acceptFlashcard, rejectFlashcard, editFlashcard, goToStep } =
    useGenerationProcess();
  const navigate = useNavigate();
  const [showReviewOptions, setShowReviewOptions] = useState(true);
  const [reviewComplete, setReviewComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check for flashcards in sessionStorage on initial load
  useEffect(() => {
    // Give a brief moment for the page to load and state to initialize
    const loadingTimer = setTimeout(() => {
      console.log('Checking for flashcards on initial load...');

      if (
        !state.generatedFlashcards ||
        state.generatedFlashcards.length === 0
      ) {
        // Try to load directly from sessionStorage if state doesn't have flashcards
        const savedState = sessionStorage.getItem('flashcardGenerationState');
        if (savedState) {
          try {
            const parsedState = JSON.parse(savedState);
            if (parsedState.generatedFlashcards?.length > 0) {
              console.log(
                'Found flashcards in sessionStorage, staying on step2'
              );
              setIsLoading(false);
              return;
            }
          } catch (error) {
            console.error('Error parsing saved state:', error);
          }
        }

        // If we get here, redirect to step1
        console.log('No flashcards found, redirecting to step1');
        navigate('/generate/step1');
      } else {
        console.log('Flashcards found in state, showing step2');
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(loadingTimer);
  }, []);

  // Update loading state when flashcards are available
  useEffect(() => {
    if (state.generatedFlashcards?.length > 0) {
      setIsLoading(false);
    }
  }, [state.generatedFlashcards]);

  const handleDecision = (id: string, decision: 'accept' | 'reject') => {
    if (decision === 'accept') {
      acceptFlashcard(id);
    } else {
      rejectFlashcard(id);
    }
  };

  const handleEdit = (
    id: string,
    field: 'front_content' | 'back_content',
    value: string
  ) => {
    editFlashcard(id, field, value);
  };

  const handleAcceptAll = () => {
    state.generatedFlashcards.forEach((card) => {
      acceptFlashcard(card.id);
    });
    setReviewComplete(true);
  };

  const handleRejectAll = () => {
    state.generatedFlashcards.forEach((card) => {
      rejectFlashcard(card.id);
    });
    setReviewComplete(true);
  };

  const handleStartReview = () => {
    setShowReviewOptions(false);
  };

  const handleCompleteReview = () => {
    setReviewComplete(true);
  };

  const handleGoToStep3 = () => {
    goToStep(3);
  };

  const handleGoToStep1 = () => {
    goToStep(1);
  };

  // Calculate progress
  const totalCards = state.generatedFlashcards?.length || 0;
  const reviewedCards =
    (state.acceptedIds?.length || 0) + (state.rejectedIds?.length || 0);
  const allCardsReviewed = totalCards > 0 && reviewedCards === totalCards;

  // Show loading state
  if (isLoading) {
    return (
      <GenerateLayout currentStep={2}>
        <div className="flex flex-col items-center justify-center py-12">
          <div className="animate-pulse">
            <p className="text-gray-500">Loading flashcards...</p>
          </div>
        </div>
      </GenerateLayout>
    );
  }

  return (
    <GenerateLayout currentStep={2}>
      <div className="space-y-8">
        {showReviewOptions && !reviewComplete ? (
          <FlashcardReviewOptions
            flashcardsCount={totalCards}
            onAcceptAll={handleAcceptAll}
            onRejectAll={handleRejectAll}
            onStartReview={handleStartReview}
          />
        ) : reviewComplete || allCardsReviewed ? (
          <div className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
              <h3 className="text-xl font-semibold text-green-800 mb-2">
                Review Complete!
              </h3>
              <p className="text-green-700">
                You&apos;ve reviewed all flashcards. You accepted{' '}
                {state.acceptedIds.length} cards and rejected{' '}
                {state.rejectedIds.length} cards.
              </p>

              {state.acceptedIds.length === 0 && (
                <Alert variant="destructive" className="mt-4">
                  <ExclamationTriangleIcon className="h-4 w-4" />
                  <AlertDescription>
                    Warning: You haven&apos;t accepted any flashcards. You need
                    to accept at least one flashcard to create a set.
                  </AlertDescription>
                </Alert>
              )}
            </div>

            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => setReviewComplete(false)}
              >
                <ChevronLeftIcon className="mr-2 h-4 w-4" />
                Continue Reviewing
              </Button>

              <Button
                onClick={handleGoToStep3}
                disabled={state.acceptedIds.length === 0}
              >
                Save Flashcards
                <ChevronRightIcon className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <FlashcardCarousel
              flashcards={state.generatedFlashcards}
              onDecision={handleDecision}
              onEdit={handleEdit}
              onComplete={handleCompleteReview}
            />

            <ReviewNavigationButtons
              onPrevious={handleGoToStep1}
              onComplete={handleCompleteReview}
              cardsReviewed={reviewedCards}
              totalCards={totalCards}
            />
          </div>
        )}
      </div>
    </GenerateLayout>
  );
}
