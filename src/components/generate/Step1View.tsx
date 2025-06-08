import React, { useEffect, useState } from 'react';
import { GenerateLayout } from './GenerateLayout';
import { useGenerationProcess } from './hooks/useGenerationProcess';
import type { UserGenerationLimitResponseDTO } from '@/types';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { InfoCircledIcon } from '@radix-ui/react-icons';

export function Step1View() {
  const { state, setSourceText, generateFlashcards, fetchGenerationLimit } =
    useGenerationProcess();

  const [text, setText] = useState(state.sourceText || '');
  const [limitInfo, setLimitInfo] = useState<UserGenerationLimitResponseDTO>({
    max_daily_limit: 5,
    used_count: 0,
    remaining_count: 5,
    reset_at: new Date().toISOString(),
  });

  // Initialize with state.sourceText if available
  useEffect(() => {
    if (state.sourceText) {
      setText(state.sourceText);
    }
  }, [state.sourceText]);

  // Fetch generation limit on component mount
  useEffect(() => {
    const getLimitInfo = async () => {
      try {
        const data = await fetchGenerationLimit();
        setLimitInfo(data);
      } catch (error) {
        console.error('Failed to fetch generation limit:', error);
      }
    };
    getLimitInfo();
  }, []);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setText(newText);
    setSourceText(newText);
  };

  const handleGenerateClick = async () => {
    // Basic validation
    if (text.length < 1) {
      console.log('No text to generate flashcards from');
      return;
    }

    try {
      console.log(
        'Starting flashcard generation with text length:',
        text.length
      );

      // Call the generateFlashcards function from the hook
      // This will update the state and navigate to step 2
      await generateFlashcards();

      // Navigation happens inside the generateFlashcards function in useGenerationProcess
      console.log('Flashcard generation completed successfully');
    } catch (error) {
      console.error('Error generating flashcards:', error);
    }
  };

  // Calculate if button should be disabled
  const isGenerateDisabled =
    text.length < 1 || state.loading || limitInfo.remaining_count <= 0;

  return (
    <GenerateLayout currentStep={1}>
      <div className="space-y-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-semibold mb-4">Enter Source Text</h2>
          <p className="text-gray-600 mb-6">
            Paste or type the text you want to create flashcards from. The AI
            will analyze the content and generate relevant flashcards.
          </p>

          <GenerationLimitInfo
            usedCount={limitInfo.used_count}
            maxDailyLimit={limitInfo.max_daily_limit}
            resetAt={limitInfo.reset_at}
          />

          <div className="space-y-6">
            <div className="space-y-2">
              <label
                htmlFor="sourceText"
                className="block text-sm font-medium text-gray-700"
              >
                Source Text
              </label>
              <textarea
                id="sourceText"
                value={text}
                onChange={handleTextChange}
                rows={12}
                placeholder="Paste or type your text here..."
                className="w-full h-64 resize-none overflow-y-auto p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <div className="text-xs text-gray-500 flex justify-end">
                <span
                  className={
                    text.length < 1000
                      ? 'text-red-500'
                      : text.length > 10000
                        ? 'text-red-500'
                        : 'text-green-500'
                  }
                >
                  {text.length} characters{' '}
                  {text.length < 1000
                    ? '(minimum 1000)'
                    : text.length > 10000
                      ? '(maximum 10000)'
                      : ''}
                </span>
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                onClick={handleGenerateClick}
                disabled={isGenerateDisabled}
              >
                {state.loading ? 'Generating...' : 'Generate Flashcards'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </GenerateLayout>
  );
}

interface GenerationLimitInfoProps {
  usedCount: number;
  maxDailyLimit: number;
  resetAt: string;
}

function GenerationLimitInfo({
  usedCount,
  maxDailyLimit,
  resetAt,
}: GenerationLimitInfoProps) {
  const remainingCount = maxDailyLimit - usedCount;
  const resetDate = new Date(resetAt);
  const formattedResetTime = resetDate.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <Alert className="mb-6 bg-blue-50 border-blue-200">
      <InfoCircledIcon className="h-4 w-4 text-blue-600" />
      <AlertDescription className="text-blue-800">
        Daily generation limit: {usedCount}/{maxDailyLimit} ({remainingCount}{' '}
        remaining)
        {remainingCount <= 0 && (
          <span className="block mt-1">
            Your limit will reset at {formattedResetTime}
          </span>
        )}
      </AlertDescription>
    </Alert>
  );
}
