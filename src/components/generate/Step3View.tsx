import React, { useState, useEffect } from 'react';
import { GenerateLayout } from './GenerateLayout';
import { useGenerationProcess } from './hooks/useGenerationProcess';
import { useNavigate } from '@/components/hooks/useNavigate';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Define icons directly as React components to avoid import issues
function AlertCircleIcon(props: React.SVGProps<SVGSVGElement>) {
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

function ArrowRightIcon(props: React.SVGProps<SVGSVGElement>) {
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
        d="M8.15 3.35a.5.5 0 0 1 .7 0l3.8 3.8a.5.5 0 0 1 0 .7l-3.8 3.8a.5.5 0 0 1-.7-.7L11.3 7.5H2.5a.5.5 0 0 1 0-1h8.8L8.15 3.35a.5.5 0 0 1 0-.7Z"
        fill="currentColor"
      />
    </svg>
  );
}

function CheckCircledIcon(props: React.SVGProps<SVGSVGElement>) {
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
        d="M7.5.877a6.623 6.623 0 1 0 0 13.246A6.623 6.623 0 0 0 7.5.877Zm0 11.826a5.203 5.203 0 1 1 0-10.406 5.203 5.203 0 0 1 0 10.406Zm2.354-6.396-3.01 3.01-1.198-1.198a.71.71 0 0 0-1.004 1.004l1.7 1.7a.71.71 0 0 0 1.004 0l3.512-3.512a.71.71 0 1 0-1.004-1.004Z"
        fill="currentColor"
      />
    </svg>
  );
}

function Cross2Icon(props: React.SVGProps<SVGSVGElement>) {
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
        d="M11.782 4.032a.575.575 0 1 0-.813-.814L7.5 6.687 4.032 3.218a.575.575 0 0 0-.814.814L6.687 7.5l-3.469 3.468a.575.575 0 0 0 .814.814L7.5 8.313l3.469 3.469a.575.575 0 0 0 .813-.814L8.313 7.5l3.469-3.468Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function Step3View() {
  const { state, setTitle, saveFlashcardSet } = useGenerationProcess();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSaveInProgress, setIsSaveInProgress] = useState(false);
  const [saveCompleted, setSaveCompleted] = useState(false);
  const isMounted = React.useRef(true);
  const initialTempSetId = React.useRef(state.tempSetId);
  const autoSaveAttempted = React.useRef(false);

  // On unmount, update the ref
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Set initial temp set ID on mount
  useEffect(() => {
    if (state.tempSetId) {
      initialTempSetId.current = state.tempSetId;
      console.log('Step3View - Stored initial tempSetId:', state.tempSetId);
    }
  }, []);

  // Auto-save on component mount
  useEffect(() => {
    // Only try to auto-save once
    if (autoSaveAttempted.current) {
      return;
    }

    // Skip if already saving or completed
    if (isSaving || saveCompleted) {
      return;
    }

    // If we have a valid title and flashcards, start saving automatically
    if (
      state.tempSetId &&
      state.editedTitle.trim() &&
      !autoSaveAttempted.current
    ) {
      console.log('Step3View - Auto-saving on mount');
      autoSaveAttempted.current = true;
      // Use a setTimeout to avoid dependency issues
      setTimeout(() => {
        if (isMounted.current) {
          handleSave();
        }
      }, 500);
    }
  }, [state.tempSetId, state.editedTitle, isSaving, saveCompleted]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  const handleSave = async () => {
    if (!state.editedTitle.trim()) {
      setError('Please enter a title for your flashcard set');
      return;
    }

    try {
      // Set all saving-related states
      setIsSaving(true);
      setIsSaveInProgress(true);
      setSaveCompleted(false);
      setError(null);

      console.log('Step3View - Starting save process');

      // Longer delay to ensure UI state updates are processed
      await new Promise((resolve) => setTimeout(resolve, 300));

      const result = await saveFlashcardSet();
      console.log('Step3View - Save successful, result:', result);

      // Mark save as completed
      setSaveCompleted(true);

      // Show success message
      setIsSaving(false);

      // No redirection or state reset - just stay on the page with success message
    } catch (error) {
      console.error('Step3View - Error in handleSave:', error);
      setError(
        error instanceof Error ? error.message : 'Failed to save flashcard set'
      );
      // Reset save states on error
      setIsSaveInProgress(false);
      setSaveCompleted(false);
    } finally {
      if (isMounted.current) {
        setIsSaving(false);
      }
    }
  };

  // Calculate statistics
  const totalGenerated = state.generatedFlashcards?.length || 0;
  const accepted = state.acceptedIds?.length || 0;
  const rejected = state.rejectedIds?.length || 0;

  // Check if we have any flashcards to show
  const hasFlashcards = totalGenerated > 0;

  // If no flashcards, show a message
  if (!hasFlashcards) {
    return (
      <GenerateLayout currentStep={3}>
        <div className="space-y-8 max-w-2xl mx-auto">
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-2">
              No Flashcards Available
            </h2>
            <p className="text-gray-600 mb-8">
              No flashcards have been generated. Please use the main navigation
              to start a new generation.
            </p>
          </div>
        </div>
      </GenerateLayout>
    );
  }

  return (
    <GenerateLayout currentStep={3}>
      <div className="space-y-8 max-w-2xl mx-auto">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Save Flashcard Set</h2>
          <p className="text-gray-600">
            {isSaving
              ? 'Saving your flashcard set...'
              : saveCompleted
                ? 'Flashcard set saved successfully!'
                : 'Your flashcard set is being saved automatically.'}
          </p>
        </div>

        <TitleForm
          value={state.editedTitle}
          onChange={handleTitleChange}
          suggestedTitle={state.suggestedTitle}
        />

        <GenerationStats
          acceptedCount={accepted}
          rejectedCount={rejected}
          totalGenerated={totalGenerated}
        />

        {error && (
          <Alert variant="destructive">
            <AlertCircleIcon className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {saveCompleted && (
          <Alert variant="default" className="bg-green-50 border-green-200">
            <CheckCircledIcon className="h-4 w-4 text-green-500" />
            <AlertDescription className="text-green-700">
              {state.acceptedIds.length > 0
                ? 'Flashcard set saved successfully!'
                : 'Generation log saved successfully!'}
            </AlertDescription>
          </Alert>
        )}

        <div className="flex justify-center pt-4">
          {!saveCompleted && (
            <SaveSetButton
              onClick={handleSave}
              isLoading={isSaving}
              isDisabled={!state.editedTitle.trim() || saveCompleted}
            />
          )}
        </div>
      </div>
    </GenerateLayout>
  );
}

interface TitleFormProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  suggestedTitle: string;
}

function TitleForm({ value, onChange, suggestedTitle }: TitleFormProps) {
  // Display title as static text, not an editable input
  return (
    <div className="space-y-2">
      <label
        htmlFor="title"
        className="block text-sm font-medium text-gray-700"
      >
        Flashcard Set Title
      </label>
      <div className="p-2 border rounded-md bg-gray-50">
        <p className="text-gray-800 font-medium">{value || suggestedTitle}</p>
      </div>
    </div>
  );
}

interface GenerationStatsProps {
  acceptedCount: number;
  rejectedCount: number;
  totalGenerated: number;
}

function GenerationStats({
  acceptedCount,
  rejectedCount,
  totalGenerated,
}: GenerationStatsProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="text-lg font-medium mb-4">Generation Summary</h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-600">
              {totalGenerated}
            </div>
            <div className="text-sm text-gray-500">Total Generated</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600 flex items-center justify-center">
              <CheckCircledIcon className="mr-1 h-5 w-5" />
              {acceptedCount}
            </div>
            <div className="text-sm text-gray-500">Accepted</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-red-600 flex items-center justify-center">
              <Cross2Icon className="mr-1 h-5 w-5" />
              {rejectedCount}
            </div>
            <div className="text-sm text-gray-500">Rejected</div>
          </div>
        </div>

        {acceptedCount === 0 && (
          <Alert
            variant="default"
            className="mt-4 border-amber-200 bg-amber-50"
          >
            <AlertCircleIcon className="h-4 w-4 text-amber-500" />
            <AlertDescription className="text-amber-700">
              No flashcards have been accepted. Only a generation log will be
              saved, without creating a flashcard set. You can still click "Save
              Generation Log" to record this activity.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}

interface SaveSetButtonProps {
  onClick: () => void;
  isLoading: boolean;
  isDisabled: boolean;
}

function SaveSetButton({ onClick, isLoading, isDisabled }: SaveSetButtonProps) {
  const { state } = useGenerationProcess();
  const hasAcceptedCards = state.acceptedIds.length > 0;

  return (
    <Button
      onClick={onClick}
      disabled={isDisabled || isLoading}
      className={`px-6 ${
        hasAcceptedCards
          ? 'bg-blue-600 hover:bg-blue-700'
          : 'bg-green-600 hover:bg-green-700'
      } text-white`}
    >
      {isLoading ? (
        <>
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Saving...
        </>
      ) : (
        <>
          {hasAcceptedCards ? 'Save Flashcard Set' : 'Save Generation Log'}
          <ArrowRightIcon className="ml-2 h-4 w-4" />
        </>
      )}
    </Button>
  );
}
