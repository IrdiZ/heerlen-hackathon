'use client';

import { useState } from 'react';

interface FeedbackWidgetProps {
  onSubmit?: (feedback: { rating: number; comment: string }) => void;
}

export function FeedbackWidget({ onSubmit }: FeedbackWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (rating === 0) return;
    
    const feedback = { rating, comment };
    
    // Store locally
    const existing = JSON.parse(localStorage.getItem('migrantai_feedback') || '[]');
    existing.push({ ...feedback, timestamp: Date.now() });
    localStorage.setItem('migrantai_feedback', JSON.stringify(existing));
    
    onSubmit?.(feedback);
    setSubmitted(true);
    
    setTimeout(() => {
      setIsOpen(false);
      setSubmitted(false);
      setRating(0);
      setComment('');
    }, 2000);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 p-3 bg-orange-500 text-white rounded-full shadow-lg hover:bg-orange-600 transition-all hover:scale-110 z-50"
        title="Send feedback"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
        </svg>
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-80 bg-white rounded-xl shadow-2xl border z-50 overflow-hidden">
      <div className="px-4 py-3 bg-orange-500 text-white flex items-center justify-between">
        <span className="font-medium">Send Feedback</span>
        <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {submitted ? (
        <div className="p-6 text-center">
          <div className="text-4xl mb-2">🙏</div>
          <p className="font-medium text-gray-800">Thank you!</p>
          <p className="text-sm text-gray-500">Your feedback helps us improve.</p>
        </div>
      ) : (
        <div className="p-4 space-y-4">
          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              How was your experience?
            </label>
            <div className="flex gap-2 justify-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className={`text-2xl transition-transform hover:scale-125 ${
                    star <= rating ? 'text-yellow-400' : 'text-gray-300'
                  }`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>

          {/* Comment */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Any suggestions? (optional)
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="What could we do better?"
              className="w-full p-2 border rounded-lg text-sm resize-none h-20 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
            />
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={rating === 0}
            className="w-full py-2 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Send Feedback
          </button>
        </div>
      )}
    </div>
  );
}
