'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  VisaIntakeData, 
  VisaType,
  VisaStep,
  CountryCode,
  determineVisaType,
  getVisaPathway,
  getCountryData,
} from '@/lib/visa-wizard-data';

export type WizardStep = 'intake' | 'results';

export interface StepProgress {
  [stepId: string]: {
    completed: boolean;
    completedAt?: string;
    documentChecks: { [docId: string]: boolean };
  };
}

export interface VisaWizardState {
  currentStep: WizardStep;
  intakeData: VisaIntakeData;
  determinedVisaType: VisaType | null;
  stepProgress: StepProgress;
}

const STORAGE_KEY = 'visa_wizard_state';

const initialIntakeData: VisaIntakeData = {
  countryOfOrigin: '',
  currentLocation: '',
  hasJobOffer: '',
  sponsorRecognized: '',
  salaryRange: '',
};

const initialState: VisaWizardState = {
  currentStep: 'intake',
  intakeData: initialIntakeData,
  determinedVisaType: null,
  stepProgress: {},
};

export function useVisaWizard() {
  const [state, setState] = useState<VisaWizardState>(initialState);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setState({ ...initialState, ...parsed });
        } catch (e) {
          console.error('Failed to parse stored visa wizard state:', e);
        }
      }
      setIsLoaded(true);
    }
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    if (isLoaded && typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  }, [state, isLoaded]);

  // Update intake data field
  const updateIntakeField = useCallback(<K extends keyof VisaIntakeData>(
    field: K,
    value: VisaIntakeData[K]
  ) => {
    setState(prev => ({
      ...prev,
      intakeData: {
        ...prev.intakeData,
        [field]: value,
      },
    }));
  }, []);

  // Get pathway helper (uses country from intake data)
  const getPathway = useCallback(() => {
    if (!state.determinedVisaType) return null;
    return getVisaPathway(state.determinedVisaType, state.intakeData.countryOfOrigin);
  }, [state.determinedVisaType, state.intakeData.countryOfOrigin]);

  // Submit intake form and determine visa type
  const submitIntake = useCallback(() => {
    const visaType = determineVisaType(state.intakeData);
    const pathway = getVisaPathway(visaType, state.intakeData.countryOfOrigin);
    
    // Initialize step progress for all steps
    const initialProgress: StepProgress = {};
    pathway.steps.forEach(step => {
      initialProgress[step.id] = {
        completed: false,
        documentChecks: step.requiredDocuments.reduce((acc, doc) => ({
          ...acc,
          [doc.id]: false,
        }), {}),
      };
    });

    setState(prev => ({
      ...prev,
      currentStep: 'results',
      determinedVisaType: visaType,
      stepProgress: initialProgress,
    }));
  }, [state.intakeData]);

  // Go back to intake form
  const goBackToIntake = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentStep: 'intake',
    }));
  }, []);

  // Toggle step completion
  const toggleStepComplete = useCallback((stepId: string) => {
    setState(prev => ({
      ...prev,
      stepProgress: {
        ...prev.stepProgress,
        [stepId]: {
          ...prev.stepProgress[stepId],
          completed: !prev.stepProgress[stepId]?.completed,
          completedAt: !prev.stepProgress[stepId]?.completed 
            ? new Date().toISOString() 
            : undefined,
        },
      },
    }));
  }, []);

  // Toggle document check
  const toggleDocumentCheck = useCallback((stepId: string, docId: string) => {
    setState(prev => ({
      ...prev,
      stepProgress: {
        ...prev.stepProgress,
        [stepId]: {
          ...prev.stepProgress[stepId],
          documentChecks: {
            ...prev.stepProgress[stepId]?.documentChecks,
            [docId]: !prev.stepProgress[stepId]?.documentChecks?.[docId],
          },
        },
      },
    }));
  }, []);

  // Get progress percentage
  const getProgress = useCallback((): number => {
    const pathway = getPathway();
    if (!pathway || pathway.steps.length === 0) return 0;
    
    const completedSteps = pathway.steps.filter(
      step => state.stepProgress[step.id]?.completed
    ).length;
    
    return Math.round((completedSteps / pathway.steps.length) * 100);
  }, [getPathway, state.stepProgress]);

  // Get completed steps count
  const getCompletedCount = useCallback((): number => {
    const pathway = getPathway();
    if (!pathway) return 0;
    
    return pathway.steps.filter(
      step => state.stepProgress[step.id]?.completed
    ).length;
  }, [getPathway, state.stepProgress]);

  // Get next incomplete step
  const getNextStep = useCallback((): VisaStep | undefined => {
    const pathway = getPathway();
    if (!pathway) return undefined;
    
    return pathway.steps.find(
      step => !state.stepProgress[step.id]?.completed
    );
  }, [getPathway, state.stepProgress]);

  // Check if step is completed
  const isStepCompleted = useCallback((stepId: string): boolean => {
    return state.stepProgress[stepId]?.completed || false;
  }, [state.stepProgress]);

  // Check if document is checked
  const isDocumentChecked = useCallback((stepId: string, docId: string): boolean => {
    return state.stepProgress[stepId]?.documentChecks?.[docId] || false;
  }, [state.stepProgress]);

  // Reset wizard
  const resetWizard = useCallback(() => {
    setState(initialState);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  // Check if intake form is complete
  const isIntakeComplete = useCallback((): boolean => {
    const { intakeData } = state;
    return !!(
      intakeData.countryOfOrigin &&
      intakeData.currentLocation &&
      intakeData.hasJobOffer &&
      (intakeData.hasJobOffer === 'no' || intakeData.sponsorRecognized) &&
      (intakeData.hasJobOffer === 'no' || intakeData.salaryRange)
    );
  }, [state]);

  // Get country-specific data
  const getSelectedCountryData = useCallback(() => {
    return getCountryData(state.intakeData.countryOfOrigin);
  }, [state.intakeData.countryOfOrigin]);

  return {
    // State
    currentStep: state.currentStep,
    intakeData: state.intakeData,
    determinedVisaType: state.determinedVisaType,
    stepProgress: state.stepProgress,
    isLoaded,
    
    // Actions
    updateIntakeField,
    submitIntake,
    goBackToIntake,
    toggleStepComplete,
    toggleDocumentCheck,
    resetWizard,
    
    // Computed
    getProgress,
    getCompletedCount,
    getNextStep,
    isStepCompleted,
    isDocumentChecked,
    isIntakeComplete,
    
    // Helpers
    getVisaPathway: getPathway,
    getSelectedCountryData,
  };
}
