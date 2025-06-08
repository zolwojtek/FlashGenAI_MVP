import { useState, useEffect } from 'react';
import { useNavigate } from '@/components/hooks/useNavigate';
import {
  type GenerationProcessState,
  type GenerateFlashcardSetResponseDTO,
  type UserGenerationLimitResponseDTO,
  type FlashcardGeneratedDTO,
  type ReviewFlashcardSetRequestDTO,
  type BatchFlashcardActionResponseDTO,
  CreationMode,
} from '@/types';

// Helper function to generate a UUID v4
function generateUUID(): string {
  // This simple implementation generates a UUID-like string
  // In production, use a proper UUID library
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

const initialState: GenerationProcessState = {
  sourceText: '',
  currentStep: 1,
  generatedFlashcards: [],
  acceptedIds: [],
  rejectedIds: [],
  suggestedTitle: '',
  editedTitle: '',
  tempSetId: '',
  loading: false,
  error: null,
  editedFlashcards: {},
};

export const useGenerationProcess = () => {
  const [state, setState] = useState<GenerationProcessState>(initialState);
  const navigate = useNavigate();

  // Check for saved state on initial load
  useEffect(() => {
    const savedState = sessionStorage.getItem('flashcardGenerationState');
    if (savedState) {
      try {
        setState(JSON.parse(savedState));
      } catch (error) {
        console.error('Error parsing saved state:', error);
        sessionStorage.removeItem('flashcardGenerationState');
      }
    }
  }, []);

  // Save state to sessionStorage whenever it changes
  useEffect(() => {
    if (state.sourceText || state.generatedFlashcards.length > 0) {
      sessionStorage.setItem('flashcardGenerationState', JSON.stringify(state));
    }
  }, [state]);

  // Add a dedicated function to reset state
  const resetState = () => {
    console.log(
      'useGenerationProcess - Explicitly resetting state to initial values'
    );

    // Clear session storage
    sessionStorage.removeItem('flashcardGenerationState');

    // Reset state to initial values
    setState(initialState);
  };

  // Fetch user's generation limit
  const fetchGenerationLimit =
    async (): Promise<UserGenerationLimitResponseDTO> => {
      try {
        setState((prev) => ({ ...prev, loading: true, error: null }));
        const response = await fetch('/api/flashcard-sets/limit');

        if (!response.ok) {
          throw new Error('Failed to fetch generation limit');
        }

        const data: UserGenerationLimitResponseDTO = await response.json();
        return data;
      } catch (error) {
        setState((prev) => ({
          ...prev,
          error:
            error instanceof Error
              ? error.message
              : 'Failed to fetch generation limit',
        }));
        return {
          max_daily_limit: 5,
          used_count: 0,
          remaining_count: 5,
          reset_at: new Date().toISOString(),
        };
      } finally {
        setState((prev) => ({ ...prev, loading: false }));
      }
    };

  // Set source text
  const setSourceText = (text: string) => {
    setState((prev) => ({ ...prev, sourceText: text }));
  };

  // Generate flashcards
  const generateFlashcards = async () => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      // Get the current source text from state
      const currentSourceText = state.sourceText;
      console.log(
        'Generating flashcards from text:',
        currentSourceText
          ? `${currentSourceText.length} characters`
          : 'No text available'
      );

      // Check if we have source text
      if (!currentSourceText || currentSourceText.length === 0) {
        throw new Error('No source text available for generation');
      }

      // Create more realistic mock data based on source text
      console.log('Creating mock flashcards from text');

      // Extract some sample data from the text
      const sentences = currentSourceText
        .split(/[.!?]+/)
        .filter((s) => s.trim().length > 0);

      // Generate flashcards based on the content
      let mockFlashcards: FlashcardGeneratedDTO[] = [];

      // Add some realistic mock flashcards
      if (sentences.length >= 2) {
        for (let i = 0; i < Math.min(10, sentences.length); i++) {
          const sentence = sentences[i].trim();
          if (sentence.length > 10) {
            // Create a question by finding keywords
            const words = sentence.split(' ');
            const keywordIndex = Math.floor(Math.random() * words.length);
            const keyword = words[keywordIndex];

            // Replace the keyword with a blank
            const question = sentence.replace(keyword, '_______');

            mockFlashcards.push({
              id: generateUUID(),
              front_content: `Complete the sentence: "${question}"`,
              back_content: keyword,
              creation_mode: CreationMode.AI,
            });
          }
        }
      }

      // Always ensure we have at least 5 flashcards
      if (mockFlashcards.length < 5) {
        const genericCards = [
          {
            id: generateUUID(),
            front_content: 'What is the main topic of this text?',
            back_content:
              'Based on the content, the main topic appears to be about ' +
              (currentSourceText.length > 20
                ? currentSourceText.substring(0, 20) + '...'
                : 'learning'),
            creation_mode: CreationMode.AI,
          },
          {
            id: generateUUID(),
            front_content: 'Define the concept mentioned in paragraph 2',
            back_content:
              'The concept refers to the systematic approach to organizing information for better retention.',
            creation_mode: CreationMode.AI,
          },
          {
            id: generateUUID(),
            front_content:
              'What is the relationship between the two key elements discussed?',
            back_content:
              'The relationship is complementary, where one element enhances the effectiveness of the other.',
            creation_mode: CreationMode.AI,
          },
          {
            id: generateUUID(),
            front_content: 'Explain the significance of the example provided',
            back_content:
              'The example illustrates how the theoretical concept can be applied in practical scenarios.',
            creation_mode: CreationMode.AI,
          },
          {
            id: generateUUID(),
            front_content: 'Summarize the conclusion of the text',
            back_content:
              'The conclusion emphasizes the importance of consistent practice and application of the discussed methods.',
            creation_mode: CreationMode.AI,
          },
        ];

        // Add enough generic cards to reach at least 5 total
        const neededCards = 5 - mockFlashcards.length;
        mockFlashcards = [
          ...mockFlashcards,
          ...genericCards.slice(0, neededCards),
        ];
      }

      const mockData: GenerateFlashcardSetResponseDTO = {
        set_id: generateUUID(),
        title: `Flashcards: ${currentSourceText.substring(0, 30)}...`,
        flashcards: mockFlashcards,
        created_at: new Date().toISOString(),
        total_cards_count: mockFlashcards.length,
      };

      console.log(
        'Generated mock data with',
        mockFlashcards.length,
        'flashcards'
      );

      // Update state with generated flashcards
      const updatedState = {
        ...state,
        generatedFlashcards: mockData.flashcards,
        acceptedIds: [],
        rejectedIds: [],
        tempSetId: mockData.set_id,
        suggestedTitle: mockData.title,
        editedTitle: mockData.title,
        currentStep: 2,
        loading: false,
      };

      setState(updatedState);

      // Store the state in session storage immediately to prevent loss
      console.log('Saving state to sessionStorage...');
      sessionStorage.setItem(
        'flashcardGenerationState',
        JSON.stringify(updatedState)
      );

      // Navigate to step 2 with a longer delay to ensure state is fully saved
      console.log('Navigating to step 2...');
      setTimeout(() => {
        navigate('/generate/step2');
      }, 500);

      return mockData;
    } catch (error) {
      console.error('Error in generateFlashcards:', error);
      setState((prev) => ({
        ...prev,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to generate flashcards',
        loading: false,
      }));
      throw error;
    }
  };

  // Go to a specific step
  const goToStep = (step: 1 | 2 | 3) => {
    setState((prev) => ({ ...prev, currentStep: step }));
    navigate(`/generate/step${step}`);
  };

  // Accept a flashcard
  const acceptFlashcard = (id: string) => {
    setState((prev) => ({
      ...prev,
      acceptedIds: prev.acceptedIds.includes(id)
        ? prev.acceptedIds
        : [...prev.acceptedIds, id],
      rejectedIds: prev.rejectedIds.filter((rejectedId) => rejectedId !== id),
    }));
  };

  // Reject a flashcard
  const rejectFlashcard = (id: string) => {
    setState((prev) => ({
      ...prev,
      rejectedIds: prev.rejectedIds.includes(id)
        ? prev.rejectedIds
        : [...prev.rejectedIds, id],
      acceptedIds: prev.acceptedIds.filter((acceptedId) => acceptedId !== id),
    }));
  };

  // Edit a flashcard
  const editFlashcard = (
    id: string,
    field: 'front_content' | 'back_content',
    value: string
  ) => {
    setState((prev) => ({
      ...prev,
      editedFlashcards: {
        ...prev.editedFlashcards,
        [id]: {
          ...prev.editedFlashcards[id],
          [field]: value,
        },
      },
    }));
  };

  // Set title
  const setTitle = (title: string) => {
    setState((prev) => ({ ...prev, editedTitle: title }));
  };

  // Save flashcard set
  const saveFlashcardSet =
    async (): Promise<BatchFlashcardActionResponseDTO> => {
      try {
        setState((prev) => ({ ...prev, loading: true, error: null }));

        console.log('Saving flashcard set...', {
          setId: state.tempSetId,
          title: state.editedTitle,
          accepted: state.acceptedIds.length,
          rejected: state.rejectedIds.length,
        });

        const payload: ReviewFlashcardSetRequestDTO = {
          set_id: state.tempSetId,
          title: state.editedTitle,
          source_text: state.sourceText,
          accept: state.acceptedIds,
          reject: state.rejectedIds,
        };

        // Send data to API endpoint for saving to Supabase
        console.log('Sending data to API endpoint:', payload);

        // Call the actual API endpoint
        const response = await fetch('/api/flashcard-sets/review', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to save flashcard set');
        }

        // Parse the response
        const result: BatchFlashcardActionResponseDTO = await response.json();
        console.log('Save successful, API response:', result);

        setState((prev) => ({ ...prev, loading: false }));

        return result;
      } catch (error) {
        console.error('Error saving flashcard set:', error);
        setState((prev) => ({
          ...prev,
          error:
            error instanceof Error
              ? error.message
              : 'Failed to save flashcard set',
          loading: false,
        }));
        throw error;
      }
    };

  // Get the current flashcard set
  const getFlashcardSet = () => {
    return {
      id: state.tempSetId,
      title: state.editedTitle,
      flashcards: state.generatedFlashcards,
      acceptedIds: state.acceptedIds,
      rejectedIds: state.rejectedIds,
    };
  };

  return {
    state,
    fetchGenerationLimit,
    setSourceText,
    generateFlashcards,
    goToStep,
    acceptFlashcard,
    rejectFlashcard,
    editFlashcard,
    setTitle,
    saveFlashcardSet,
    getFlashcardSet,
    resetState,
  };
};
