import React, { useEffect, useState } from 'react';
import { GenerateLayout } from './GenerateLayout';
import { useGenerationProcess } from './hooks/useGenerationProcess';
import { useNavigate } from '@/components/hooks/useNavigate';
import { FlashcardCarousel } from './FlashcardCarousel';
import { FlashcardReviewOptions } from './FlashcardReviewOptions';
import { ReviewNavigationButtons } from './ReviewNavigationButtons';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Directly create DOM elements for icons
function InfoCircledIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 15 15"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M7.5 1.75a5.75 5.75 0 1 0 0 11.5 5.75 5.75 0 0 0 0-11.5ZM.75 7.5a6.75 6.75 0 1 1 13.5 0 6.75 6.75 0 0 1-13.5 0ZM7 4.5a.5.5 0 0 1 .5-.5h.01a.5.5 0 0 1 0 1H7.5a.5.5 0 0 1-.5-.5Zm.5 2a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 1 0V7a.5.5 0 0 0-.5-.5Z"
        fill="currentColor"
      />
    </svg>
  );
}

function ChevronLeftIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 15 15"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M8.842 3.135a.5.5 0 0 1 .023.707L5.435 7.5l3.43 3.658a.5.5 0 0 1-.73.684l-3.75-4a.5.5 0 0 1 0-.684l3.75-4a.5.5 0 0 1 .707-.023Z"
        fill="currentColor"
      />
    </svg>
  );
}

function ChevronRightIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 15 15"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M6.158 3.135a.5.5 0 0 0-.023.707L9.565 7.5l-3.43 3.658a.5.5 0 0 0 .73.684l3.75-4a.5.5 0 0 0 0-.684l-3.75-4a.5.5 0 0 0-.707-.023Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function Step2View() {
  const { state, acceptFlashcard, rejectFlashcard, editFlashcard, goToStep } =
    useGenerationProcess();
  const navigate = useNavigate();
  const [showReviewOptions, setShowReviewOptions] = useState(true);
  const [reviewComplete, setReviewComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const initialCheckComplete = React.useRef(false);

  // Check for flashcards in sessionStorage on initial load - but only once
  useEffect(() => {
    if (initialCheckComplete.current) {
      console.log('Initial check already completed, skipping');
      return;
    }

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
              initialCheckComplete.current = true;
              return;
            }
          } catch (error) {
            console.error('Error parsing saved state:', error);
          }
        }

        // Only redirect if we haven't completed the initial check yet
        if (!initialCheckComplete.current) {
          // If we get here, redirect to step1
          console.log('No flashcards found, redirecting to step1');
          initialCheckComplete.current = true;
          navigate('/generate/step1', { replace: true });
        }
      } else {
        console.log('Flashcards found in state, showing step2');
        setIsLoading(false);
        initialCheckComplete.current = true;
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

  // Handle the actual redirect to step 3 when the goToStep function is called
  const handleGoToStep3 = () => {
    // Check if all cards were reviewed and all were rejected
    const allRejected =
      state.generatedFlashcards.length > 0 &&
      state.rejectedIds.length === state.generatedFlashcards.length;

    // Log info for debugging
    console.log('Going to step 3', {
      acceptedCount: state.acceptedIds.length,
      rejectedCount: state.rejectedIds.length,
      totalCards: state.generatedFlashcards.length,
      allRejected,
    });

    // Add extensive debugging
    console.log('Step2View - Current state:', {
      tempSetId: state.tempSetId,
      flashcards: state.generatedFlashcards.length,
      accepted: state.acceptedIds.length,
      rejected: state.rejectedIds.length,
    });
    console.log('Step2View - Attempting to navigate to step 3');

    // Always proceed to step 3, even if all cards were rejected
    goToStep(3);

    // Verify navigation was called
    console.log('Step2View - goToStep(3) was called');
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
                <Alert
                  variant="default"
                  className="mt-4 border-orange-200 bg-orange-50"
                >
                  <InfoCircledIcon className="h-4 w-4 text-orange-500" />
                  <AlertTitle className="text-orange-700">Note</AlertTitle>
                  <AlertDescription className="text-orange-600">
                    You haven&apos;t accepted any flashcards. A generation log
                    will be created, but no flashcard set will be saved.
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
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {state.acceptedIds.length > 0
                  ? 'Save Flashcards'
                  : 'Finish Review'}
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
