
export interface EmailStats {
  total: number;
  completed: number;
  replied: number;
  cold: number;
  bounced: number;
  emailsToSend: number;
  linkedInSent: number;
}

export interface ChartData {
  name: string;
  value: number;
  color: string;
}

export interface MonthlyData {
  month: string;
  sent: number;
  replied: number;
  bounced: number;
}
