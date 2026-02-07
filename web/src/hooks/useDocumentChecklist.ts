'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  DocumentStatus,
  STEP_DOCUMENTS,
  getAllDocuments,
  getDocumentsForStep,
} from '@/lib/document-requirements';

export interface DocumentState {
  status: DocumentStatus;
  obtainedAt?: string;
  notes?: string;
}

export interface DocumentChecklistState {
  [docId: string]: DocumentState;
}

const STORAGE_KEY = 'migrantai_documents';

export function useDocumentChecklist() {
  const allDocs = useMemo(() => getAllDocuments(), []);
  
  const initialState: DocumentChecklistState = useMemo(() => 
    allDocs.reduce(
      (acc, doc) => ({
        ...acc,
        [doc.id]: { status: 'pending' as DocumentStatus },
      }),
      {}
    ), [allDocs]);

  const [documents, setDocuments] = useState<DocumentChecklistState>(initialState);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          // Merge with initial state to handle new documents
          setDocuments({ ...initialState, ...parsed });
        } catch (e) {
          console.error('Failed to parse stored documents:', e);
        }
      }
      setIsLoaded(true);
    }
  }, [initialState]);

  // Save to localStorage on change
  useEffect(() => {
    if (isLoaded && typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(documents));
    }
  }, [documents, isLoaded]);

  const updateStatus = useCallback((docId: string, status: DocumentStatus) => {
    setDocuments(prev => ({
      ...prev,
      [docId]: {
        ...prev[docId],
        status,
        obtainedAt: status === 'obtained' ? new Date().toISOString() : undefined,
      },
    }));
  }, []);

  const updateNotes = useCallback((docId: string, notes: string) => {
    setDocuments(prev => ({
      ...prev,
      [docId]: {
        ...prev[docId],
        notes,
      },
    }));
  }, []);

  const getStatus = useCallback(
    (docId: string): DocumentStatus => {
      return documents[docId]?.status || 'pending';
    },
    [documents]
  );

  const getNotes = useCallback(
    (docId: string): string => {
      return documents[docId]?.notes || '';
    },
    [documents]
  );

  const resetAll = useCallback(() => {
    setDocuments(initialState);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [initialState]);

  // Get progress for a specific step
  const getStepProgress = useCallback(
    (stepId: string) => {
      const stepDocs = getDocumentsForStep(stepId);
      if (stepDocs.length === 0) return { obtained: 0, pending: 0, notNeeded: 0, total: 0, percentage: 0 };

      let obtained = 0;
      let pending = 0;
      let notNeeded = 0;

      for (const doc of stepDocs) {
        const status = getStatus(doc.id);
        if (status === 'obtained') obtained++;
        else if (status === 'not-needed') notNeeded++;
        else pending++;
      }

      const relevantTotal = stepDocs.length - notNeeded;
      const percentage = relevantTotal > 0 ? Math.round((obtained / relevantTotal) * 100) : 100;

      return { obtained, pending, notNeeded, total: stepDocs.length, percentage };
    },
    [getStatus]
  );

  // Get overall progress
  const getOverallProgress = useCallback(() => {
    let obtained = 0;
    let pending = 0;
    let notNeeded = 0;

    for (const doc of allDocs) {
      const status = getStatus(doc.id);
      if (status === 'obtained') obtained++;
      else if (status === 'not-needed') notNeeded++;
      else pending++;
    }

    const relevantTotal = allDocs.length - notNeeded;
    const percentage = relevantTotal > 0 ? Math.round((obtained / relevantTotal) * 100) : 100;

    return { obtained, pending, notNeeded, total: allDocs.length, percentage };
  }, [allDocs, getStatus]);

  // Get missing documents for a step (pending documents)
  const getMissingForStep = useCallback(
    (stepId: string) => {
      const stepDocs = getDocumentsForStep(stepId);
      return stepDocs.filter(doc => getStatus(doc.id) === 'pending');
    },
    [getStatus]
  );

  // Check if step can be started (all required docs obtained or not-needed)
  const canStartStep = useCallback(
    (stepId: string) => {
      const missing = getMissingForStep(stepId);
      return missing.length === 0;
    },
    [getMissingForStep]
  );

  // Get all steps with their document readiness
  const getStepsWithReadiness = useCallback(() => {
    return STEP_DOCUMENTS.map(step => ({
      stepId: step.stepId,
      stepName: step.stepName,
      progress: getStepProgress(step.stepId),
      missingDocs: getMissingForStep(step.stepId),
      canStart: canStartStep(step.stepId),
    }));
  }, [getStepProgress, getMissingForStep, canStartStep]);

  return {
    documents,
    isLoaded,
    updateStatus,
    updateNotes,
    getStatus,
    getNotes,
    resetAll,
    getStepProgress,
    getOverallProgress,
    getMissingForStep,
    canStartStep,
    getStepsWithReadiness,
    allDocuments: allDocs,
    stepDocuments: STEP_DOCUMENTS,
  };
}
