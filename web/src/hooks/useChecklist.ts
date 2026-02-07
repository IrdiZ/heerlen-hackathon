'use client';

import { useState, useEffect, useCallback } from 'react';
import { StepStatus, IMMIGRATION_STEPS } from '@/lib/immigration-steps';

export interface ChecklistState {
  [stepId: string]: {
    status: StepStatus;
    completedAt?: string;
    notes?: string;
  };
}

const STORAGE_KEY = 'migrantai_checklist';

const initialState: ChecklistState = IMMIGRATION_STEPS.reduce(
  (acc, step) => ({
    ...acc,
    [step.id]: { status: 'pending' as StepStatus },
  }),
  {}
);

export function useChecklist() {
  const [checklist, setChecklist] = useState<ChecklistState>(initialState);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          // Merge with initial state to handle new steps
          setChecklist({ ...initialState, ...parsed });
        } catch (e) {
          console.error('Failed to parse stored checklist:', e);
        }
      }
      setIsLoaded(true);
    }
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    if (isLoaded && typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(checklist));
    }
  }, [checklist, isLoaded]);

  const updateStatus = useCallback((stepId: string, status: StepStatus) => {
    setChecklist(prev => ({
      ...prev,
      [stepId]: {
        ...prev[stepId],
        status,
        completedAt: status === 'complete' ? new Date().toISOString() : undefined,
      },
    }));
  }, []);

  const updateNotes = useCallback((stepId: string, notes: string) => {
    setChecklist(prev => ({
      ...prev,
      [stepId]: {
        ...prev[stepId],
        notes,
      },
    }));
  }, []);

  const markComplete = useCallback((stepId: string) => {
    updateStatus(stepId, 'complete');
  }, [updateStatus]);

  const markInProgress = useCallback((stepId: string) => {
    updateStatus(stepId, 'in-progress');
  }, [updateStatus]);

  const markPending = useCallback((stepId: string) => {
    updateStatus(stepId, 'pending');
  }, [updateStatus]);

  const resetAll = useCallback(() => {
    setChecklist(initialState);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const getCompletedCount = useCallback(() => {
    return Object.values(checklist).filter(s => s.status === 'complete').length;
  }, [checklist]);

  const getProgress = useCallback(() => {
    const total = IMMIGRATION_STEPS.length;
    const completed = getCompletedCount();
    return Math.round((completed / total) * 100);
  }, [getCompletedCount]);

  const getNextStep = useCallback(() => {
    const sortedSteps = [...IMMIGRATION_STEPS].sort((a, b) => a.order - b.order);
    return sortedSteps.find(
      step => checklist[step.id]?.status !== 'complete'
    );
  }, [checklist]);

  const getStatus = useCallback(
    (stepId: string): StepStatus => {
      return checklist[stepId]?.status || 'pending';
    },
    [checklist]
  );

  const getNotes = useCallback(
    (stepId: string): string => {
      return checklist[stepId]?.notes || '';
    },
    [checklist]
  );

  return {
    checklist,
    isLoaded,
    updateStatus,
    updateNotes,
    markComplete,
    markInProgress,
    markPending,
    resetAll,
    getCompletedCount,
    getProgress,
    getNextStep,
    getStatus,
    getNotes,
    totalSteps: IMMIGRATION_STEPS.length,
  };
}
