// Generate flashcards
const generateFlashcards = async () => {
  try {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    console.log(
      'Generating flashcards from text:',
      state.sourceText.substring(0, 50) + '...'
    );

    // First attempt API call
    try {
      const response = await fetch('/api/flashcard-sets/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source_text: state.sourceText }),
      });

      if (!response.ok) {
        throw new Error('API call failed');
      }

      const data: GenerateFlashcardSetResponseDTO = await response.json();
      console.log('Received flashcards from API:', data);

      setState((prev) => ({
        ...prev,
        generatedFlashcards: data.flashcards,
        acceptedIds: data.flashcards.map((card) => card.id), // Initialize all as accepted
        rejectedIds: [],
        tempSetId: data.set_id,
        suggestedTitle: data.title,
        editedTitle: data.title,
        currentStep: 2,
      }));

      // Navigate to step 2
      navigate('/generate/step2');
      return data;
    } catch (apiError) {
      console.error('API error:', apiError);
      console.log('Falling back to mock data due to API error');

      // Mock data as fallback
      const mockFlashcards: FlashcardGeneratedDTO[] = [
        {
          id: '1',
          front_content: 'What is the capital of France?',
          back_content: 'Paris',
          tags: ['geography'],
          confidence_score: 0.95,
        },
        {
          id: '2',
          front_content: 'What is the largest planet in our solar system?',
          back_content: 'Jupiter',
          tags: ['astronomy'],
          confidence_score: 0.98,
        },
        {
          id: '3',
          front_content: "Who wrote 'Romeo and Juliet'?",
          back_content: 'William Shakespeare',
          tags: ['literature'],
          confidence_score: 0.99,
        },
      ];

      const mockData: GenerateFlashcardSetResponseDTO = {
        set_id: 'mock-set-' + Date.now(),
        title: 'Mock Flashcard Set',
        flashcards: mockFlashcards,
        created_at: new Date().toISOString(),
        total_cards_count: mockFlashcards.length,
      };

      console.log('Using mock data:', mockData);

      setState((prev) => ({
        ...prev,
        generatedFlashcards: mockData.flashcards,
        acceptedIds: mockData.flashcards.map((card) => card.id),
        rejectedIds: [],
        tempSetId: mockData.set_id,
        suggestedTitle: mockData.title,
        editedTitle: mockData.title,
        currentStep: 2,
      }));

      // Navigate to step 2
      navigate('/generate/step2');
      return mockData;
    }
  } catch (error) {
    setState((prev) => ({
      ...prev,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to generate flashcards',
    }));
    throw error;
  } finally {
    setState((prev) => ({ ...prev, loading: false }));
  }
};
