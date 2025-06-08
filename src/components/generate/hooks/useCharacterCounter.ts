import { useState, useEffect } from 'react';
import { type TextInputState } from '@/types';

export const useCharacterCounter = (minLength: number, maxLength: number) => {
  const [state, setState] = useState<TextInputState>({
    text: '',
    charCount: 0,
    isValid: false,
    validationMessage: null,
  });

  const setText = (text: string) => {
    const charCount = text.length;
    const isValid = charCount >= minLength && charCount <= maxLength;

    // Update state immediately with new text, count, and validity
    setState((prev) => ({
      ...prev,
      text,
      charCount,
      isValid,
    }));
  };

  // Debounce only the validation message to prevent flickering during typing
  useEffect(() => {
    const timer = setTimeout(() => {
      const charCount = state.text.length;
      let validationMessage = null;

      if (charCount < minLength) {
        validationMessage = `Please enter at least ${minLength} characters (current: ${charCount})`;
      } else if (charCount > maxLength) {
        validationMessage = `Please enter no more than ${maxLength} characters (current: ${charCount})`;
      }

      setState((prev) => ({
        ...prev,
        validationMessage,
      }));
    }, 500);

    return () => clearTimeout(timer);
  }, [state.text, minLength, maxLength]);

  return {
    text: state.text,
    charCount: state.charCount,
    isValid: state.isValid,
    validationMessage: state.validationMessage,
    setText,
  };
};
