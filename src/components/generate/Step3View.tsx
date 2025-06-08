import React, { useState, useEffect } from 'react';
import { GenerateLayout } from './GenerateLayout';
import { useGenerationProcess } from './hooks/useGenerationProcess';
import { useNavigate } from '@/components/hooks/useNavigate';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import pkg from '@radix-ui/react-icons';
const {
  AlertCircleIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckCircledIcon,
  Cross2Icon,
} = pkg;

export function Step3View() {
  const { state, setTitle, saveFlashcardSet, goToStep } =
    useGenerationProcess();
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect to step 1 if there's no data
  useEffect(() => {
    if (!state.tempSetId || state.acceptedIds.length === 0) {
      navigate('/generate/step1');
    }
  }, [state.tempSetId, state.acceptedIds]);

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
      const result = await saveFlashcardSet();

      // Redirect to dashboard or set details page
      navigate('/');
    } catch (error) {
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
            isDisabled={!state.editedTitle.trim() || accepted === 0}
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
          <Alert variant="destructive" className="mt-4">
            <AlertCircleIcon className="h-4 w-4" />
            <AlertDescription>
              You need to accept at least one flashcard to create a set.
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
  return (
    <Button
      onClick={onClick}
      disabled={isDisabled || isLoading}
      className="px-6"
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
          Save Flashcard Set
          <ArrowRightIcon className="ml-2 h-4 w-4" />
        </>
      )}
    </Button>
  );
}
