'use client';

import { useState, useEffect, useCallback } from 'react';

export interface Message {
  role: string;
  content: string;
  timestamp: Date;
}

interface StoredMessage {
  role: string;
  content: string;
  timestamp: string;
}

const STORAGE_KEY = 'migrantai_conversation';
const MAX_MESSAGES = 50;

export function useConversationHistory() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          const parsed: StoredMessage[] = JSON.parse(stored);
          // Convert timestamp strings back to Date objects
          const restored = parsed.map(msg => ({
            ...msg,
            timestamp: new Date(msg.timestamp),
          }));
          setMessages(restored);
        } catch (e) {
          console.error('Failed to parse stored conversation:', e);
        }
      }
      setIsLoaded(true);
    }
  }, []);

  // Save to localStorage on change (limit to last 50 messages)
  useEffect(() => {
    if (isLoaded && typeof window !== 'undefined') {
      const toStore = messages.slice(-MAX_MESSAGES);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
    }
  }, [messages, isLoaded]);

  const addMessage = useCallback((msg: { role: string; content: string }) => {
    setMessages(prev => {
      const newMessages = [...prev, { ...msg, timestamp: new Date() }];
      // Keep only last 50 messages
      return newMessages.slice(-MAX_MESSAGES);
    });
  }, []);

  const clearHistory = useCallback(() => {
    setMessages([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  return {
    messages,
    addMessage,
    clearHistory,
    isLoaded,
  };
}
