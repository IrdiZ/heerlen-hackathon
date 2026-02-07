// Roadmap Types for Progress Tracker Feature

export type RoadmapStepStatus = 'pending' | 'in-progress' | 'complete';

export interface RoadmapStep {
  id: string;
  order: number;
  title: string;
  description: string;
  estimatedTime?: string;
  status: RoadmapStepStatus;
  tips?: string[];
  sources?: RoadmapSource[];
  completedAt?: string;
  notes?: string;
}

export interface RoadmapSource {
  label: string;
  url?: string;
}

export interface Roadmap {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  steps: RoadmapStep[];
}

// Tool call parameters from LLM
export interface CreateRoadmapParams {
  name: string;
  steps: Array<{
    title: string;
    description: string;
    estimatedTime?: string;
    tips?: string[];
    sources?: RoadmapSource[];
  }>;
}

export interface UpdateRoadmapParams {
  stepId: string;
  status?: RoadmapStepStatus;
  notes?: string;
}
