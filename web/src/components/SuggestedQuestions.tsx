'use client';

interface SuggestedQuestionsProps {
  onSelect: (question: string) => void;
}

const SUGGESTIONS = [
  {
    emoji: '🏠',
    text: 'How do I register at the gemeente?',
    lang: 'English',
  },
  {
    emoji: '🆔',
    text: 'كيف أحصل على رقم BSN؟',
    lang: 'Arabic',
  },
  {
    emoji: '🏦',
    text: 'Nasıl banka hesabı açabilirim?',
    lang: 'Turkish',
  },
  {
    emoji: '📋',
    text: 'Wat heb ik nodig voor DigiD?',
    lang: 'Dutch',
  },
  {
    emoji: '🏥',
    text: 'Jak uzyskać ubezpieczenie zdrowotne?',
    lang: 'Polish',
  },
];

export function SuggestedQuestions({ onSelect }: SuggestedQuestionsProps) {
  return (
    <div className="space-y-2">
      <p className="text-sm text-gray-500 text-center">Try asking:</p>
      <div className="flex flex-wrap justify-center gap-2">
        {SUGGESTIONS.map((suggestion, i) => (
          <button
            key={i}
            onClick={() => onSelect(suggestion.text)}
            className="group px-3 py-2 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-orange-50 transition-all text-sm text-left"
          >
            <span className="mr-2">{suggestion.emoji}</span>
            <span className="text-gray-700 group-hover:text-orange-700">{suggestion.text}</span>
            <span className="ml-2 text-xs text-gray-400">({suggestion.lang})</span>
          </button>
        ))}
      </div>
    </div>
  );
}
