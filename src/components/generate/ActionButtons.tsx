import React from 'react';
import { Button } from '@/components/ui/button';
import { CheckIcon } from '@radix-ui/react-icons';
import { Cross2Icon } from '@radix-ui/react-icons';
import { Pencil2Icon } from '@radix-ui/react-icons';

interface ActionButtonsProps {
  onAccept: () => void;
  onReject: () => void;
  onToggleEdit: () => void;
  isEditMode: boolean;
}

export function ActionButtons({
  onAccept,
  onReject,
  onToggleEdit,
  isEditMode,
}: ActionButtonsProps) {
  return (
    <div className="flex justify-center space-x-4 mt-6">
      <Button
        variant="outline"
        className={`flex items-center border-2 ${
          isEditMode
            ? 'border-blue-500 bg-blue-50 text-blue-700'
            : 'border-gray-200 hover:border-blue-500 hover:text-blue-700'
        }`}
        onClick={onToggleEdit}
      >
        <Pencil2Icon className="mr-2 h-4 w-4" />
        {isEditMode ? 'Done Editing' : 'Edit Card'}
      </Button>

      <Button
        variant="outline"
        className="flex items-center border-2 border-red-200 text-red-700 hover:bg-red-50 hover:border-red-500"
        onClick={onReject}
      >
        <Cross2Icon className="mr-2 h-4 w-4" />
        Reject
      </Button>

      <Button
        className="flex items-center bg-green-600 hover:bg-green-700"
        onClick={onAccept}
      >
        <CheckIcon className="mr-2 h-4 w-4" />
        Accept
      </Button>
    </div>
  );
}
