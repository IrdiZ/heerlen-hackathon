'use client';

import { useState } from 'react';
import { FAQ_DATA, FAQ_CATEGORIES, FAQ } from '@/lib/faq-data';

interface FAQSectionProps {
  onAskAbout?: (question: string) => void;
}

export function FAQSection({ onAskAbout }: FAQSectionProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredFAQs = selectedCategory
    ? FAQ_DATA.filter(faq => faq.category === selectedCategory)
    : FAQ_DATA;

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="px-6 py-4 border-b bg-gray-50">
        <h2 className="text-xl font-bold text-gray-800">❓ Common Questions</h2>
        <p className="text-sm text-gray-500 mt-1">Quick answers about Dutch immigration</p>
      </div>

      {/* Category filters */}
      <div className="px-6 py-3 border-b flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`px-3 py-1 rounded-full text-sm transition-colors ${
            selectedCategory === null
              ? 'bg-orange-500 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          All
        </button>
        {Object.entries(FAQ_CATEGORIES).map(([key, { label, emoji }]) => (
          <button
            key={key}
            onClick={() => setSelectedCategory(key)}
            className={`px-3 py-1 rounded-full text-sm transition-colors ${
              selectedCategory === key
                ? 'bg-orange-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {emoji} {label}
          </button>
        ))}
      </div>

      {/* FAQ list */}
      <div className="divide-y max-h-96 overflow-y-auto">
        {filteredFAQs.map((faq) => (
          <FAQItem
            key={faq.id}
            faq={faq}
            isExpanded={expandedId === faq.id}
            onToggle={() => setExpandedId(expandedId === faq.id ? null : faq.id)}
            onAsk={onAskAbout}
          />
        ))}
      </div>
    </div>
  );
}

function FAQItem({ 
  faq, 
  isExpanded, 
  onToggle, 
  onAsk 
}: { 
  faq: FAQ; 
  isExpanded: boolean; 
  onToggle: () => void;
  onAsk?: (q: string) => void;
}) {
  const category = FAQ_CATEGORIES[faq.category];

  return (
    <div className="px-6 py-4">
      <button
        onClick={onToggle}
        className="w-full text-left flex items-start justify-between gap-4"
      >
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm">{category.emoji}</span>
            <span className="text-xs text-gray-500">{category.label}</span>
          </div>
          <h3 className="font-medium text-gray-800">{faq.question}</h3>
        </div>
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {isExpanded && (
        <div className="mt-3 pl-7">
          <p className="text-gray-600 text-sm leading-relaxed">{faq.answer}</p>
          {onAsk && (
            <button
              onClick={() => onAsk(faq.question)}
              className="mt-3 text-sm text-orange-600 hover:text-orange-700 flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Ask AI about this
            </button>
          )}
        </div>
      )}
    </div>
  );
}
