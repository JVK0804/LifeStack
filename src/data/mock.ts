import type { DailySummary, Profile, Suggestion } from './types';

export const mockProfile: Profile = {
  name: 'Sarah',
  email: 'sarah@example.com',
  healthSource: 'Apple Watch',
  budgetPeriod: 'Monthly',
  notifications: true,
  aiSuggestions: true,
};

export const mockSummary = (): DailySummary => ({
  date: new Date(),
  pillars: [
    { id: 'health', label: 'Health', score: 78, color: 'green' },
    { id: 'finance', label: 'Finance', score: 65, color: 'blue' },
    { id: 'habits', label: 'Habits', score: 50, color: 'orange' },
  ],
  heartRate: { current: 72, context: 'Resting · Now', trend: [68, 71, 69, 74, 72, 70, 73, 75, 72, 71, 73] },
  sleep: { durationMinutes: 443, quality: 78 },
  screenTime: {
    minutesToday: 222,
    tips: [
      'In 3h 42m you could master a pasta recipe from scratch.',
      "That's 35 pages of a book. Small reads compound fast.",
      'Three neighborhood walks, plus journaling after.',
      "50 words in a new language you've always wanted to speak.",
      'Four 55-minute focus sessions: a full deep-work day.',
    ],
  },
  budget: { spent: 47, limit: 200, currency: 'USD', period: 'today' },
  habits: [
    { id: 'walk', name: 'Morning walk', done: true },
    { id: 'water', name: '8 glasses of water', done: true },
    { id: 'read', name: 'Read 20 minutes', done: false },
    { id: 'meditate', name: 'Meditate', done: true },
    { id: 'sugar', name: 'No added sugar', done: false },
    { id: 'sleep', name: 'Sleep by 11 PM', done: false },
  ],
  insight: { title: 'HRV is 12% above your average', prompt: 'Ask Lifestyle AI what this means' },
});

const unsplash = (id: string) =>
  `https://images.unsplash.com/photo-${id}?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&w=400&h=400&q=80`;

export const mockSuggestions: Suggestion[] = [
  { id: 'cook', title: 'Cook a Recipe', description: 'A whole new dish from scratch.', image: unsplash('1737625854730-56e11fcaff17'), color: 'orange' },
  { id: 'read', title: 'Read a Book', description: "35+ pages of a story you'll remember.", image: unsplash('1506880018603-83d5b814b5a6'), color: 'blue' },
  { id: 'walk', title: 'Take a Walk', description: 'Fresh air and a clear mind.', image: unsplash('1777739512515-c7e100a97908'), color: 'green' },
  { id: 'meditate', title: 'Meditate', description: 'Your calm is one breath away.', image: unsplash('1506126613408-eca07ce68773'), color: 'purple' },
  { id: 'journal', title: 'Journal', description: 'Writing always beats scrolling.', image: unsplash('1586380951230-e6703d9f6833'), color: 'red' },
  { id: 'create', title: 'Get Creative', description: 'Sketch, doodle, make something.', image: unsplash('1569360531163-a61fa3da86ee'), color: 'orange' },
  { id: 'call', title: 'Call a Friend', description: 'A real conversation beats any DM.', image: unsplash('1582298538104-fe2e74c27f59'), color: 'green' },
  { id: 'stretch', title: 'Stretch & Move', description: 'Even 10 minutes makes a difference.', image: unsplash('1635367216109-aa3353c0c22e'), color: 'red' },
];
