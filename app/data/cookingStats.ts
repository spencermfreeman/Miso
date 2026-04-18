// ─────────────────────────────────────────────────────────────────────────────
//  cookingStats.ts
//  Shared in-memory store for cooking activity data.
//  In a real app, replace with AsyncStorage, Zustand, or a backend.
// ─────────────────────────────────────────────────────────────────────────────

export type CookEntry = {
  id: string;
  date: string;       // ISO date string YYYY-MM-DD
  mealName: string;
  mealType: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';
  savedAmount: number; // estimated $ saved vs ordering out
  photoEmoji: string;
};

export type WeeklyChallenge = {
  id: string;
  title: string;
  description: string;
  emoji: string;
  reward: string;
  completed: boolean;
};

// ─── Seed data — past cook entries ────────────────────────────────────────────
export const COOK_LOG: CookEntry[] = [
  { id: '1', date: '2025-03-10', mealName: 'Spaghetti Bolognese', mealType: 'Dinner',    savedAmount: 22, photoEmoji: '🍝' },
  { id: '2', date: '2025-03-11', mealName: 'Greek Salad',         mealType: 'Lunch',     savedAmount: 14, photoEmoji: '🥗' },
  { id: '3', date: '2025-03-12', mealName: 'Chicken Soup',        mealType: 'Dinner',    savedAmount: 19, photoEmoji: '🍲' },
  { id: '4', date: '2025-03-13', mealName: 'Avocado Toast',       mealType: 'Breakfast', savedAmount: 11, photoEmoji: '🥑' },
  { id: '5', date: '2025-03-14', mealName: 'Stir Fry',            mealType: 'Dinner',    savedAmount: 18, photoEmoji: '🥦' },
  { id: '6', date: '2025-03-15', mealName: 'Ramen',               mealType: 'Dinner',    savedAmount: 21, photoEmoji: '🍜' },
  { id: '7', date: '2025-03-16', mealName: 'Spanakopita',         mealType: 'Dinner',    savedAmount: 16, photoEmoji: '🥬' },
];

// ─── Weekly challenge pool ─────────────────────────────────────────────────────
export const WEEKLY_CHALLENGES: WeeklyChallenge[] = [
  {
    id: 'c1',
    title: '5-Ingredient Dinner',
    description: 'Cook a dinner using only 5 ingredients or fewer. Simplicity is a skill.',
    emoji: '✋',
    reward: 'Minimalist Badge',
    completed: false,
  },
  {
    id: 'c2',
    title: 'Grandparent Approved',
    description: 'Cook one meal your grandparent would recognize — no shortcuts, no apps.',
    emoji: '👴',
    reward: 'Heritage Badge',
    completed: true,
  },
  {
    id: 'c3',
    title: 'Sunday Prep Day',
    description: 'Batch cook at least 3 meals or components in a single session.',
    emoji: '📦',
    reward: 'Prep Master Badge',
    completed: false,
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
export function totalSaved(log: CookEntry[]): number {
  return log.reduce((sum, e) => sum + e.savedAmount, 0);
}

export function mealsCooked(log: CookEntry[]): number {
  return log.length;
}

/** How many distinct calendar weeks had at least one cook entry */
export function weeksActive(log: CookEntry[]): number {
  const weeks = new Set(log.map(e => {
    const d = new Date(e.date);
    const jan1 = new Date(d.getFullYear(), 0, 1);
    return Math.ceil(((d.getTime() - jan1.getTime()) / 86400000 + jan1.getDay() + 1) / 7);
  }));
  return weeks.size;
}

/** Longest consecutive-day run in the log */
export function longestRun(log: CookEntry[]): number {
  if (!log.length) return 0;
  const days = [...new Set(log.map(e => e.date))].sort();
  let max = 1, cur = 1;
  for (let i = 1; i < days.length; i++) {
    const diff = (new Date(days[i]).getTime() - new Date(days[i - 1]).getTime()) / 86400000;
    cur = diff === 1 ? cur + 1 : 1;
    max = Math.max(max, cur);
  }
  return max;
}

/** Average $ saved per meal */
export function avgSaved(log: CookEntry[]): number {
  if (!log.length) return 0;
  return Math.round(totalSaved(log) / log.length);
}

/** Friend leaderboard seed data */
export const FRIEND_STATS = [
  { name: 'You',    emoji: '👩‍🍳', meals: 7,  saved: 121 },
  { name: 'Sawyer', emoji: '🧑‍🍳', meals: 5,  saved: 88  },
  { name: 'Katie',  emoji: '👨‍🍳', meals: 9,  saved: 154 },
  { name: 'Sara',   emoji: '👩‍🍳', meals: 3,  saved: 51  },
];
