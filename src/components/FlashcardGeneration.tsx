import React, { useState } from 'react';
import { FlashcardReview } from './FlashcardReview';
import {
  CreationMode,
  type FlashcardGeneratedDTO,
  type ReviewFlashcardSetRequestDTO,
} from '../types';

enum GenerationStep {
  FORM,
  GENERATING,
  REVIEW,
  SAVING,
  COMPLETE,
  ERROR,
}

export function FlashcardGeneration() {
  const [sourceText, setSourceText] = useState('');
  const [title, setTitle] = useState('');
  const [step, setStep] = useState<GenerationStep>(GenerationStep.FORM);
  const [flashcards, setFlashcards] = useState<FlashcardGeneratedDTO[]>([]);
  const [accepted, setAccepted] = useState<string[]>([]);
  const [rejected, setRejected] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [generationLimit, setGenerationLimit] = useState({
    used: 0,
    max: 10,
    remaining: 10,
  });
  const [setId, setSetId] = useState<string | null>(null);
  const [editedFlashcards, setEditedFlashcards] = useState<
    Record<string, FlashcardGeneratedDTO>
  >({});

  // Mocked function to get current generation limit
  const fetchGenerationLimit = async () => {
    // This would be an API call in a real implementation
    setGenerationLimit({
      used: 3,
      max: 10,
      remaining: 7,
    });
  };

  // Mocked function to generate flashcards
  const generateFlashcards = async () => {
    try {
      setStep(GenerationStep.GENERATING);

      // This would be an API call in a real implementation
      // Simulating API delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Mock response
      const generatedSetId = 'mock-set-id-' + Date.now();
      setSetId(generatedSetId);

      const mockFlashcards: FlashcardGeneratedDTO[] = [];
      for (let i = 1; i <= 5; i++) {
        mockFlashcards.push({
          id: `mock-id-${i}`,
          front_content: `Question ${i}: What is the key concept in "${sourceText.substring(0, 20)}..."?`,
          back_content: `Answer ${i}: It explains how the concept works with specific details.`,
          creation_mode: CreationMode.AI,
        });
      }

      setFlashcards(mockFlashcards);
      await fetchGenerationLimit();
      setStep(GenerationStep.REVIEW);
    } catch (err) {
      console.error('Error generating flashcards:', err);
      setError('Failed to generate flashcards. Please try again.');
      setStep(GenerationStep.ERROR);
    }
  };

  // Mocked function to save reviewed flashcards
  const saveReviewedFlashcards = async () => {
    try {
      setStep(GenerationStep.SAVING);

      // This would be an API call in a real implementation
      // Create a payload for the API
      const reviewData: ReviewFlashcardSetRequestDTO = {
        set_id: setId || '',
        title,
        source_text: sourceText,
        accept: accepted,
        reject: rejected,
      };

      // Apply any edits to the accepted flashcards
      const acceptedWithEdits = flashcards
        .filter((f) => accepted.includes(f.id))
        .map((f) => editedFlashcards[f.id] || f);

      console.log('Saving flashcards:', { reviewData, acceptedWithEdits });

      // Simulating API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setStep(GenerationStep.COMPLETE);
    } catch (err) {
      console.error('Error saving flashcards:', err);
      setError('Failed to save flashcards. Please try again.');
      setStep(GenerationStep.ERROR);
    }
  };

  const handleSourceTextChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setSourceText(e.target.value);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (sourceText.trim()) {
      generateFlashcards();
    }
  };

  const handleAccept = (id: string) => {
    setAccepted((prev) => [...prev, id]);
    setRejected((prev) => prev.filter((item) => item !== id));
  };

  const handleReject = (id: string) => {
    setRejected((prev) => [...prev, id]);
    setAccepted((prev) => prev.filter((item) => item !== id));
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

    setEditedFlashcards((prev) => ({
      ...prev,
      [id]: updatedFlashcard,
    }));
  };

  const handleReviewComplete = (
    acceptedIds: string[],
    rejectedIds: string[]
  ) => {
    setAccepted(acceptedIds);
    setRejected(rejectedIds);
    saveReviewedFlashcards();
  };

  const handleReset = () => {
    setSourceText('');
    setTitle('');
    setFlashcards([]);
    setAccepted([]);
    setRejected([]);
    setEditedFlashcards({});
    setError(null);
    setStep(GenerationStep.FORM);
  };

  const renderStep = () => {
    switch (step) {
      case GenerationStep.FORM:
        return (
          <div className="max-w-3xl mx-auto">
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <InformationCircleIcon className="h-5 w-5 text-blue-500" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-blue-700">
                    Daily generation limit: {generationLimit.used}/
                    {generationLimit.max} ({generationLimit.remaining}{' '}
                    remaining)
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-gray-700"
                >
                  Flashcard Set Title
                </label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={handleTitleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Enter a title for your flashcard set"
                />
              </div>

              <div>
                <label
                  htmlFor="sourceText"
                  className="block text-sm font-medium text-gray-700"
                >
                  Source Text
                </label>
                <textarea
                  id="sourceText"
                  value={sourceText}
                  onChange={handleSourceTextChange}
                  rows={10}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Paste or type the source text you want to create flashcards from"
                  required
                />
              </div>

              <div>
                <button
                  type="submit"
                  disabled={
                    !sourceText.trim() || generationLimit.remaining <= 0
                  }
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  Generate Flashcards
                </button>
              </div>
            </form>
          </div>
        );

      case GenerationStep.GENERATING:
      case GenerationStep.REVIEW:
        return (
          <FlashcardReview
            flashcards={flashcards}
            title={title || 'Untitled Flashcard Set'}
            isLoading={step === GenerationStep.GENERATING}
            onAccept={handleAccept}
            onReject={handleReject}
            onEdit={handleEdit}
            onComplete={handleReviewComplete}
          />
        );

      case GenerationStep.SAVING:
        return (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-lg">Saving your flashcards...</p>
          </div>
        );

      case GenerationStep.COMPLETE:
        return (
          <div className="text-center py-12">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
              <CheckIcon className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="mt-3 text-lg font-medium text-gray-900">
              Flashcards saved successfully!
            </h3>
            <div className="mt-2 text-sm text-gray-500">
              <p>Your flashcards have been saved and are ready for review.</p>
            </div>
            <div className="mt-5">
              <button
                onClick={handleReset}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Create Another Set
              </button>
            </div>
          </div>
        );

      case GenerationStep.ERROR:
        return (
          <div className="text-center py-12">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
              <XIcon className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="mt-3 text-lg font-medium text-gray-900">
              Generation failed
            </h3>
            <div className="mt-2 text-sm text-gray-500">
              <p>
                {error || 'An unexpected error occurred. Please try again.'}
              </p>
            </div>
            <div className="mt-5">
              <button
                onClick={handleReset}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Try Again
              </button>
            </div>
          </div>
        );
    }
  };

  return <div className="py-4">{renderStep()}</div>;
}

// Icon components
function InformationCircleIcon(props: React.SVGProps<SVGSVGElement>) {
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
        d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
      />
    </svg>
  );
}

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
