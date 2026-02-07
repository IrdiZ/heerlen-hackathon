'use client';

import { useState } from 'react';
import { DUTCH_TERMS, DutchTerm } from '@/lib/dutch-terms';

export function DutchTermsGlossary() {
  const [search, setSearch] = useState('');
  const [expandedTerm, setExpandedTerm] = useState<string | null>(null);

  const filteredTerms = search
    ? DUTCH_TERMS.filter(t =>
        t.term.toLowerCase().includes(search.toLowerCase()) ||
        t.translation.toLowerCase().includes(search.toLowerCase())
      )
    : DUTCH_TERMS;

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="px-6 py-4 border-b bg-gradient-to-r from-orange-500 to-red-500">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          🇳🇱 Dutch Terms Glossary
        </h2>
        <p className="text-white/80 text-sm mt-1">
          Common bureaucratic terms explained
        </p>
      </div>

      {/* Search */}
      <div className="px-4 py-3 border-b">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search terms..."
          className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
        />
      </div>

      {/* Terms list */}
      <div className="divide-y max-h-96 overflow-y-auto">
        {filteredTerms.map((term) => (
          <TermItem
            key={term.term}
            term={term}
            isExpanded={expandedTerm === term.term}
            onToggle={() => setExpandedTerm(expandedTerm === term.term ? null : term.term)}
          />
        ))}
        {filteredTerms.length === 0 && (
          <div className="px-6 py-8 text-center text-gray-500">
            No terms found for &quot;{search}&quot;
          </div>
        )}
      </div>
    </div>
  );
}

function TermItem({
  term,
  isExpanded,
  onToggle,
}: {
  term: DutchTerm;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="px-6 py-4">
      <button
        onClick={onToggle}
        className="w-full text-left flex items-start justify-between gap-4"
      >
        <div>
          <h3 className="font-semibold text-gray-800">{term.term}</h3>
          <p className="text-sm text-gray-500">{term.translation}</p>
        </div>
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform flex-shrink-0 mt-1 ${
            isExpanded ? 'rotate-180' : ''
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isExpanded && (
        <div className="mt-3 space-y-2">
          <p className="text-gray-600 text-sm">{term.explanation}</p>
          <div className="bg-orange-50 rounded-lg p-3">
            <p className="text-sm text-orange-800">
              <span className="font-medium">💡 Context:</span> {term.context}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
