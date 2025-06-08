import React, { useState, useEffect } from 'react';
import { type FlashcardGeneratedDTO } from '@/types';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface FlashcardCardProps {
  flashcard: FlashcardGeneratedDTO;
  isFlipped: boolean;
  onFlip: () => void;
  onEdit?: (field: 'front_content' | 'back_content', value: string) => void;
  isEditable?: boolean;
}

export function FlashcardCard({
  flashcard,
  isFlipped,
  onFlip,
  onEdit,
  isEditable = false,
}: FlashcardCardProps) {
  const [frontContent, setFrontContent] = useState(flashcard.front_content);
  const [backContent, setBackContent] = useState(flashcard.back_content);

  // Update local state when flashcard content changes
  useEffect(() => {
    setFrontContent(flashcard.front_content);
    setBackContent(flashcard.back_content);
  }, [flashcard]);

  const handleFrontEdit = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setFrontContent(value);
    onEdit?.('front_content', value);
  };

  const handleBackEdit = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setBackContent(value);
    onEdit?.('back_content', value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (!isEditable) {
        onFlip();
      }
    }
  };

  return (
    <div
      className="w-full h-[300px] mx-auto cursor-pointer"
      style={{ perspective: '1000px' }}
      onClick={!isEditable ? onFlip : undefined}
      onKeyDown={handleKeyDown}
      tabIndex={!isEditable ? 0 : undefined}
      role="button"
      aria-label={!isEditable ? 'Flip flashcard' : undefined}
    >
      <div
        className="relative w-full h-full transition-all duration-500"
        style={{
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        {/* Front */}
        <div
          className={cn(
            'absolute w-full h-full bg-white rounded-xl shadow-lg p-6 flex flex-col',
            isEditable && 'cursor-text'
          )}
          style={{ backfaceVisibility: 'hidden' }}
        >
          <div className="text-sm text-gray-500 mb-2">Question</div>
          {isEditable ? (
            <Textarea
              value={frontContent}
              onChange={handleFrontEdit}
              placeholder="Enter question..."
              className="flex-1 resize-none text-lg border-none shadow-none focus-visible:ring-0 p-0"
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <div className="flex-1 overflow-auto text-lg">{frontContent}</div>
          )}
          <div className="text-sm text-blue-600 mt-4 text-center">
            {!isEditable && 'Click to flip'}
          </div>
        </div>

        {/* Back */}
        <div
          className={cn(
            'absolute w-full h-full bg-white rounded-xl shadow-lg p-6 flex flex-col',
            isEditable && 'cursor-text'
          )}
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          <div className="text-sm text-gray-500 mb-2">Answer</div>
          {isEditable ? (
            <Textarea
              value={backContent}
              onChange={handleBackEdit}
              placeholder="Enter answer..."
              className="flex-1 resize-none text-lg border-none shadow-none focus-visible:ring-0 p-0"
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <div className="flex-1 overflow-auto text-lg">{backContent}</div>
          )}
          <div className="text-sm text-blue-600 mt-4 text-center">
            {!isEditable && 'Click to flip back'}
          </div>
        </div>
      </div>
    </div>
  );
}
