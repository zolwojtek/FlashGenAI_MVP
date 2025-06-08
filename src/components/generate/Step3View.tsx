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

function ArrowLeftIcon(props: React.SVGProps<SVGSVGElement>) {
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
        d="M6.85 3.35a.5.5 0 0 0-.7 0L2.35 7.15a.5.5 0 0 0 0 .7l3.8 3.8a.5.5 0 0 0 .7-.7L3.7 7.5h8.8a.5.5 0 0 0 0-1H3.7l3.15-3.15a.5.5 0 0 0 0-.7Z"
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
  const { state, setTitle, saveFlashcardSet, goToStep } =
    useGenerationProcess();
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect to step 1 if there's no data
  useEffect(() => {
    // Only redirect if there's no temp set ID (which means no generation has occurred)
    if (!state.tempSetId) {
      navigate('/generate/step1');
    }
    // Removed the check for state.acceptedIds.length === 0 to allow viewing step 3
    // even when all cards were rejected
  }, [state.tempSetId]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  const handleSave = async () => {
    if (!state.editedTitle.trim()) {
      setError('Please enter a title for your flashcard set');
      return;
    }

    try {
      setIsSaving(true);
      setError(null);

      console.log('Step3View - Starting save process');

      // Add a small delay to ensure state updates are processed
      await new Promise((resolve) => setTimeout(resolve, 100));

      const result = await saveFlashcardSet();
      console.log('Step3View - Save successful, result:', result);

      // Add a small delay before navigation
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Redirect to dashboard or set details page
      console.log('Step3View - Navigating to home');
      navigate('/');
    } catch (error) {
      console.error('Step3View - Error in handleSave:', error);
      setError(
        error instanceof Error ? error.message : 'Failed to save flashcard set'
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleBack = () => {
    goToStep(2);
  };

  // Calculate statistics
  const totalGenerated = state.generatedFlashcards?.length || 0;
  const accepted = state.acceptedIds?.length || 0;
  const rejected = state.rejectedIds?.length || 0;

  return (
    <GenerateLayout currentStep={3}>
      <div className="space-y-8 max-w-2xl mx-auto">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Save Flashcard Set</h2>
          <p className="text-gray-600">
            Review your flashcard set information before saving.
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

        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={handleBack}>
            <ArrowLeftIcon className="mr-2 h-4 w-4" />
            Back to Review
          </Button>

          <SaveSetButton
            onClick={handleSave}
            isLoading={isSaving}
            isDisabled={!state.editedTitle.trim()}
          />
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
  return (
    <div className="space-y-2">
      <label
        htmlFor="title"
        className="block text-sm font-medium text-gray-700"
      >
        Flashcard Set Title
      </label>
      <Input
        id="title"
        value={value}
        onChange={onChange}
        placeholder="Enter a title for your flashcard set"
        className="w-full"
      />
      {suggestedTitle && suggestedTitle !== value && (
        <p className="text-sm text-gray-500">
          <span className="font-medium">Suggested title:</span> {suggestedTitle}
        </p>
      )}
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
              saved, without creating a flashcard set.
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
      className={`px-6 ${hasAcceptedCards ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'} text-white`}
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
