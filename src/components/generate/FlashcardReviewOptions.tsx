import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { CheckIcon } from '@radix-ui/react-icons';
import { Cross2Icon } from '@radix-ui/react-icons';
import { MagnifyingGlassIcon } from '@radix-ui/react-icons';

interface FlashcardReviewOptionsProps {
  flashcardsCount: number;
  onAcceptAll: () => void;
  onRejectAll: () => void;
  onStartReview: () => void;
}

export function FlashcardReviewOptions({
  flashcardsCount,
  onAcceptAll,
  onRejectAll,
  onStartReview,
}: FlashcardReviewOptionsProps) {
  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold mb-2">Review Flashcards</h2>
        <p className="text-gray-600">
          {flashcardsCount} flashcards have been generated. How would you like
          to review them?
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-2 hover:border-blue-500 hover:shadow-md transition-all">
          <CardHeader>
            <CardTitle className="flex items-center">
              <MagnifyingGlassIcon className="h-5 w-5 mr-2 text-blue-500" />
              Review One by One
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Review each flashcard individually. You can accept, reject, or
              edit each card as needed.
            </CardDescription>
          </CardContent>
          <CardFooter>
            <Button onClick={onStartReview} className="w-full">
              Start Review
            </Button>
          </CardFooter>
        </Card>

        <Card className="border-2 hover:border-green-500 hover:shadow-md transition-all">
          <CardHeader>
            <CardTitle className="flex items-center">
              <CheckIcon className="h-5 w-5 mr-2 text-green-500" />
              Accept All Flashcards
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Accept all generated flashcards without review. You can edit them
              later.
            </CardDescription>
          </CardContent>
          <CardFooter>
            <Button
              onClick={onAcceptAll}
              variant="outline"
              className="w-full border-green-500 text-green-700 hover:bg-green-50"
            >
              Accept All
            </Button>
          </CardFooter>
        </Card>

        <Card className="border-2 hover:border-red-500 hover:shadow-md transition-all">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Cross2Icon className="h-5 w-5 mr-2 text-red-500" />
              Reject All Flashcards
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Reject all generated flashcards and start over with a new
              generation.
            </CardDescription>
          </CardContent>
          <CardFooter>
            <Button
              onClick={onRejectAll}
              variant="outline"
              className="w-full border-red-500 text-red-700 hover:bg-red-50"
            >
              Reject All
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
