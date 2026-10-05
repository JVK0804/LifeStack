import { mockProfile, mockSuggestions, mockSummary } from './mock';
import type { DailySummary, Profile, Suggestion } from './types';

/**
 * Every screen reads data through this interface.
 * HealthKit, finance and AI-backed implementations replace the mock one without screen changes.
 */
export interface LifestyleService {
  getSummary(): Promise<DailySummary>;
  getProfile(): Promise<Profile>;
  getScreenTimeSuggestions(): Promise<Suggestion[]>;
}

export const mockService: LifestyleService = {
  getSummary: async () => mockSummary(),
  getProfile: async () => mockProfile,
  getScreenTimeSuggestions: async () => mockSuggestions,
};

export const lifestyleService: LifestyleService = mockService;
