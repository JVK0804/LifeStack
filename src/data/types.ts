import type { Accent } from '@/theme';

export type Pillar = { id: 'health' | 'finance' | 'habits'; label: string; score: number; color: Accent };

export type HeartRate = { current: number; context: string; trend: number[] };
export type Sleep = { durationMinutes: number; quality: number };
export type ScreenTime = { minutesToday: number; tips: string[] };
export type Budget = { spent: number; limit: number; currency: string; period: string };
export type Habit = { id: string; name: string; done: boolean };
export type Insight = { title: string; prompt: string };

export type Profile = {
  name: string;
  email: string;
  healthSource: string;
  budgetPeriod: string;
  notifications: boolean;
  aiSuggestions: boolean;
};

export type DailySummary = {
  date: Date;
  pillars: Pillar[];
  heartRate: HeartRate;
  sleep: Sleep;
  screenTime: ScreenTime;
  budget: Budget;
  habits: Habit[];
  insight: Insight;
};

export type Suggestion = { id: string; title: string; description: string; image: string; color: Accent };
