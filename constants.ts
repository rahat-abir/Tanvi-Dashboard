
import { EmailStats, MonthlyData } from './types';

export const MOCK_STATS: EmailStats = {
  total: 24580,
  completed: 18435, // 75%
  replied: 4916,    // 20%
  cold: 983,       // 4%
  bounced: 246,     // 1%
  emailsToSend: 0,
  linkedInSent: 0,
};

export const MOCK_MONTHLY_DATA: MonthlyData[] = [
  { month: 'Jan', sent: 4000, replied: 800, bounced: 50 },
  { month: 'Feb', sent: 3000, replied: 750, bounced: 40 },
  { month: 'Mar', sent: 5000, replied: 1200, bounced: 90 },
  { month: 'Apr', sent: 4500, replied: 1100, bounced: 60 },
  { month: 'May', sent: 6000, replied: 1500, bounced: 110 },
  { month: 'Jun', sent: 2000, replied: 400, bounced: 20 },
];

export const COLORS = {
  total: '#6366f1',     // Indigo
  completed: '#10b981', // Emerald
  replied: '#3b82f6',   // Blue
  cold: '#f59e0b',      // Amber
  bounced: '#ef4444',   // Red
};
