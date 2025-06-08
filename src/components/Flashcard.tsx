import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { CreationMode, type FlashcardGeneratedDTO } from '../types';

interface FlashcardProps {
  flashcard: FlashcardGeneratedDTO;
  onFlip?: () => void;
  onEdit?: (content: string, side: 'front' | 'back') => void;
  isEditable?: boolean;
  className?: string;
}

export function Flashcard({
  flashcard,
  onFlip,
  onEdit,
  isEditable = false,
  className,
}: FlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
    if (onFlip) onFlip();
  };

  const handleEditStart = (side: 'front' | 'back') => {
    setEditContent(
      side === 'front' ? flashcard.front_content : flashcard.back_content
    );
    setIsEditing(true);
  };

  const handleEditSave = (side: 'front' | 'back') => {
    if (onEdit) onEdit(editContent, side);
    setIsEditing(false);
  };

  const renderCreationModeIcon = () => {
    switch (flashcard.creation_mode) {
      case CreationMode.AI:
        return <RobotIcon className="h-6 w-6 text-blue-500" />;
      case CreationMode.MANUAL:
        return <PersonIcon className="h-6 w-6 text-green-500" />;
      case CreationMode.AI_EDITED:
        return <RobotEditIcon className="h-6 w-6 text-purple-500" />;
      default:
        return null;
    }
  };

  return (
    <div
      className={cn(
        'relative w-full max-w-md mx-auto perspective-1000 h-64',
        className
      )}
    >
      <div
        className={cn(
          'relative w-full h-full transition-transform duration-500 transform-style-preserve-3d',
          isFlipped ? 'rotate-y-180' : ''
        )}
      >
        {/* Front side */}
        <div
          className={cn(
            'absolute w-full h-full backface-hidden bg-white rounded-xl shadow-lg p-6 flex flex-col',
            isFlipped ? 'hidden' : ''
          )}
        >
          <div className="absolute top-3 right-3">
            {renderCreationModeIcon()}
          </div>
          {isEditing ? (
            <div className="flex-1 flex flex-col">
              <textarea
                className="flex-1 border border-gray-300 rounded-md p-2 resize-none"
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                autoFocus
              />
              <div className="flex justify-end mt-2 space-x-2">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1 text-sm bg-gray-200 rounded-md"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleEditSave('front')}
                  className="px-3 py-1 text-sm bg-blue-500 text-white rounded-md"
                >
                  Save
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex-1 flex items-center justify-center">
                <p className="text-lg text-center">{flashcard.front_content}</p>
              </div>
              <div className="flex justify-between items-center">
                {isEditable && (
                  <button
                    onClick={() => handleEditStart('front')}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    <PencilIcon className="h-5 w-5" />
                  </button>
                )}
                <button
                  onClick={handleFlip}
                  className="ml-auto text-gray-500 hover:text-gray-700"
                >
                  <FlipIcon className="h-5 w-5" />
                </button>
              </div>
            </>
          )}
        </div>

        {/* Back side */}
        <div
          className={cn(
            'absolute w-full h-full backface-hidden bg-white rounded-xl shadow-lg p-6 flex flex-col rotate-y-180',
            !isFlipped ? 'hidden' : ''
          )}
        >
          <div className="absolute top-3 right-3">
            {renderCreationModeIcon()}
          </div>
          {isEditing ? (
            <div className="flex-1 flex flex-col">
              <textarea
                className="flex-1 border border-gray-300 rounded-md p-2 resize-none"
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                autoFocus
              />
              <div className="flex justify-end mt-2 space-x-2">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1 text-sm bg-gray-200 rounded-md"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleEditSave('back')}
                  className="px-3 py-1 text-sm bg-blue-500 text-white rounded-md"
                >
                  Save
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex-1 flex items-center justify-center">
                <p className="text-lg text-center">{flashcard.back_content}</p>
              </div>
              <div className="flex justify-between items-center">
                {isEditable && (
                  <button
                    onClick={() => handleEditStart('back')}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    <PencilIcon className="h-5 w-5" />
                  </button>
                )}
                <button
                  onClick={handleFlip}
                  className="ml-auto text-gray-500 hover:text-gray-700"
                >
                  <FlipIcon className="h-5 w-5" />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Icon components
function RobotIcon(props: React.SVGProps<SVGSVGElement>) {
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
        d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"
      />
    </svg>
  );
}

function PersonIcon(props: React.SVGProps<SVGSVGElement>) {
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
        d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
      />
    </svg>
  );
}

function RobotEditIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 8V4H8" />
      <rect width="16" height="12" x="4" y="8" rx="2" />
      <path d="M2 14h2" />
      <path d="M20 14h2" />
      <path d="M15 13v2" />
      <path d="M9 13v2" />
      <path d="m16 19 2 2 4-4" />
    </svg>
  );
}

function PencilIcon(props: React.SVGProps<SVGSVGElement>) {
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
        d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
      />
    </svg>
  );
}

function FlipIcon(props: React.SVGProps<SVGSVGElement>) {
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
        d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5"
      />
    </svg>
  );
}
