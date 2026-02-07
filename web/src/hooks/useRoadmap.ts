'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Roadmap,
  RoadmapStep,
  RoadmapStepStatus,
  CreateRoadmapParams,
} from '@/lib/roadmap-types';

const STORAGE_KEY = 'migrantai_roadmap';

export function useRoadmap() {
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setRoadmap(parsed);
        } catch (e) {
          console.error('Failed to parse stored roadmap:', e);
        }
      }
      setIsLoaded(true);
    }
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    if (isLoaded && typeof window !== 'undefined') {
      if (roadmap) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(roadmap));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, [roadmap, isLoaded]);

  // Create a new roadmap from LLM params
  const createRoadmap = useCallback((params: CreateRoadmapParams): Roadmap => {
    const now = new Date().toISOString();
    const newRoadmap: Roadmap = {
      id: `roadmap-${Date.now()}`,
      name: params.name,
      createdAt: now,
      updatedAt: now,
      steps: params.steps.map((step, index) => ({
        id: `step-${index + 1}`,
        order: index + 1,
        title: step.title,
        description: step.description,
        estimatedTime: step.estimatedTime,
        tips: step.tips,
        sources: step.sources,
        status: 'pending' as RoadmapStepStatus,
      })),
    };
    setRoadmap(newRoadmap);
    return newRoadmap;
  }, []);

  // Update a step's status
  const setStepStatus = useCallback((stepId: string, status: RoadmapStepStatus) => {
    setRoadmap(prev => {
      if (!prev) return null;
      return {
        ...prev,
        updatedAt: new Date().toISOString(),
        steps: prev.steps.map(step =>
          step.id === stepId
            ? {
                ...step,
                status,
                completedAt: status === 'complete' ? new Date().toISOString() : undefined,
              }
            : step
        ),
      };
    });
  }, []);

  // Update a step's notes
  const updateNotes = useCallback((stepId: string, notes: string) => {
    setRoadmap(prev => {
      if (!prev) return null;
      return {
        ...prev,
        updatedAt: new Date().toISOString(),
        steps: prev.steps.map(step =>
          step.id === stepId ? { ...step, notes } : step
        ),
      };
    });
  }, []);

  // Clear the roadmap
  const clearRoadmap = useCallback(() => {
    setRoadmap(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  // Get completion percentage
  const getProgress = useCallback((): number => {
    if (!roadmap || roadmap.steps.length === 0) return 0;
    const completed = roadmap.steps.filter(s => s.status === 'complete').length;
    return Math.round((completed / roadmap.steps.length) * 100);
  }, [roadmap]);

  // Get completed count
  const getCompletedCount = useCallback((): number => {
    if (!roadmap) return 0;
    return roadmap.steps.filter(s => s.status === 'complete').length;
  }, [roadmap]);

  // Get the next incomplete step
  const getNextStep = useCallback((): RoadmapStep | undefined => {
    if (!roadmap) return undefined;
    const sortedSteps = [...roadmap.steps].sort((a, b) => a.order - b.order);
    return sortedSteps.find(step => step.status !== 'complete');
  }, [roadmap]);

  // Get a specific step by ID
  const getStep = useCallback((stepId: string): RoadmapStep | undefined => {
    if (!roadmap) return undefined;
    return roadmap.steps.find(step => step.id === stepId);
  }, [roadmap]);

  return {
    roadmap,
    isLoaded,
    createRoadmap,
    setStepStatus,
    updateNotes,
    clearRoadmap,
    getProgress,
    getCompletedCount,
    getNextStep,
    getStep,
    totalSteps: roadmap?.steps.length ?? 0,
  };
}
