import { CreationMode, type FlashcardGeneratedDTO } from '../../types';
import { randomUUID } from 'crypto';

/**
 * AI Service for generating flashcards and titles
 * This is a mock implementation that will be replaced with actual AI integration
 */
class AIService {
  // Private static instance for singleton pattern
  private static instance: AIService;

  // Private constructor to prevent direct instantiation
  private constructor() {
    // Empty constructor is required for singleton pattern
  }

  /**
   * Get the singleton instance of AIService
   * @returns The single instance of AIService
   */
  public static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  /**
   * Generate flashcards from source text
   * @param sourceText The text to generate flashcards from
   * @returns Array of generated flashcards
   */
  async generateFlashcards(
    sourceText: string
  ): Promise<FlashcardGeneratedDTO[]> {
    // Mock implementation - this will be replaced with actual AI calls
    console.log(`Generating flashcards from text (${sourceText.length} chars)`);

    // Extract some sample data from the text for more realistic flashcards
    const sentences = sourceText
      .split(/[.!?]+/)
      .filter((s) => s.trim().length > 0);
    const paragraphs = sourceText
      .split(/\n\s*\n/)
      .filter((p) => p.trim().length > 0);

    // Generate mock flashcards
    const mockFlashcards: FlashcardGeneratedDTO[] = [];

    // Create definition flashcards
    if (sentences.length >= 3) {
      // Find potential definition sentences (containing "is", "are", "means", "refers to")
      const definitionSentences = sentences.filter((s) =>
        /\s(is|are|means|refers to)\s/.test(s.toLowerCase())
      );

      if (definitionSentences.length > 0) {
        // Take up to 3 definition sentences
        for (let i = 0; i < Math.min(3, definitionSentences.length); i++) {
          const sentence = definitionSentences[i].trim();
          // Try to extract a term being defined
          const match = sentence.match(
            /([A-Z][a-z]+(?:\s+[a-z]+){0,3})\s+(is|are|means|refers to)/
          );
          if (match) {
            const term = match[1];
            mockFlashcards.push({
              id: randomUUID(),
              front_content: `Define: ${term}`,
              back_content: sentence,
              creation_mode: CreationMode.AI,
            });
          }
        }
      }
    }

    // Create fill-in-the-blank questions
    if (sentences.length >= 2) {
      // Take sentences not used for definitions
      const remainingSentences = sentences.filter(
        (s) => s.length > 20 && s.split(' ').length > 6
      );

      for (let i = 0; i < Math.min(4, remainingSentences.length); i++) {
        const sentence = remainingSentences[i].trim();
        // Find a significant word to blank out
        const words = sentence.split(' ');
        const significantWords = words.filter((w) => w.length > 4);

        if (significantWords.length > 0) {
          const wordToBlank =
            significantWords[
              Math.floor(Math.random() * significantWords.length)
            ];
          const question = sentence.replace(wordToBlank, '________');

          mockFlashcards.push({
            id: randomUUID(),
            front_content: `Complete this statement: "${question}"`,
            back_content: wordToBlank,
            creation_mode: CreationMode.AI,
          });
        }
      }
    }

    // Create contextual questions
    if (paragraphs.length > 0) {
      for (let i = 0; i < Math.min(3, paragraphs.length); i++) {
        const paragraph = paragraphs[i].trim();
        if (paragraph.length > 50) {
          // Create a question based on the paragraph topic
          const firstSentence = paragraph.split(/[.!?]/)[0];
          if (firstSentence && firstSentence.length > 20) {
            mockFlashcards.push({
              id: randomUUID(),
              front_content: `What is the main point of the following text: "${firstSentence}..."?`,
              back_content: `The main point is about ${firstSentence.substring(0, 30).toLowerCase()}...`,
              creation_mode: CreationMode.AI,
            });
          }
        }
      }
    }

    // Add some generic flashcards if we don't have enough
    if (mockFlashcards.length < 5) {
      const genericQuestions = [
        {
          front: 'What is the main topic of this text?',
          back:
            'The main topic appears to be about ' +
            sourceText.substring(0, 30).toLowerCase() +
            '...',
        },
        {
          front: 'List three key points from the text.',
          back: 'The key points include: 1) Understanding the concepts, 2) Applying the knowledge, and 3) Reviewing the material regularly.',
        },
        {
          front: 'What would be a good title for this text?',
          back:
            'A good title would be "' + sourceText.substring(0, 20) + '..."',
        },
        {
          front: 'Why is this information important?',
          back: 'This information is important because it provides essential knowledge about the subject matter and its applications.',
        },
        {
          front: 'How would you summarize this text in one sentence?',
          back:
            'The text discusses ' +
            sourceText.substring(0, 40).toLowerCase() +
            '...',
        },
      ];

      // Add enough generic cards to reach at least 5 total
      for (let i = 0; i < Math.min(5, genericQuestions.length); i++) {
        if (mockFlashcards.length >= 5) break;

        mockFlashcards.push({
          id: randomUUID(),
          front_content: genericQuestions[i].front,
          back_content: genericQuestions[i].back,
          creation_mode: CreationMode.AI,
        });
      }
    }

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    return mockFlashcards;
  }

  /**
   * Generate a title suggestion for the flashcard set based on source text
   * @param sourceText The text to base the title on
   * @returns A suggested title
   */
  async suggestTitle(sourceText: string): Promise<string> {
    // Mock implementation - this will be replaced with actual AI calls
    console.log(`Generating title from text (${sourceText.length} chars)`);

    // Get first few words to create a more meaningful title
    const firstSentence = sourceText.split(/[.!?]/)[0] || '';
    const words = firstSentence.split(' ').filter((w) => w.length > 0);

    let title = '';

    if (words.length >= 3) {
      // Create a title from the first few words
      const keyWords = words.slice(0, Math.min(5, words.length)).join(' ');
      title = `Flashcards: ${keyWords}${keyWords.length >= 30 ? '...' : ''}`;
    } else {
      // Fallback to a generic title with text excerpt
      const excerpt = sourceText.trim().substring(0, 40);
      title = `Flashcards: ${excerpt}${excerpt.length >= 40 ? '...' : ''}`;
    }

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    return title;
  }
}

// Singleton instance for use throughout the application
export const aiService = AIService.getInstance();
