export type BillingCycle = 'monthly' | 'yearly' | 'custom_days';

export type SubscriptionStatus = 'active' | 'canceled' | 'paused';

export type CostEfficiencyLevel = 'excellent' | 'good' | 'warning' | 'zombie';

export type CategoryId = 
  | 'video'
  | 'music'
  | 'entertainment'
  | 'ai_tools'
  | 'productivity'
  | 'cloud_storage'
  | 'fitness'
  | 'learning'
  | 'lifestyle'
  | 'gaming'
  | 'other';

export interface CategoryInfo {
  id: CategoryId;
  name: string;
  icon: string;
  color: string;
  bgColor: string;
}

export interface UsageLog {
  monthKey: string; // 'YYYY-MM'
  count: number;
}

export interface Subscription {
  id: string;
  name: string;
  categoryId: CategoryId;
  amount: number; // 請求金額（円）
  billingCycle: BillingCycle;
  customDays?: number; // custom_days の場合の周期日数
  nextBillingDate: string; // 'YYYY-MM-DD'
  isTrial: boolean;
  trialEndDate?: string; // 'YYYY-MM-DD'
  cancelUrl?: string; // 解約直通URL
  officialUrl?: string;
  status: SubscriptionStatus;
  paymentMethod?: string;
  notes?: string;
  color?: string; // ブランドカラー
  icon?: string;
  usageLogs: Record<string, number>; // { '2026-08': 5 }
  createdAt: string; // ISO string
  canceledAt?: string; // ISO string
  monthlyEquivalent: number; // 算出された月額換算（円）
  yearlyEquivalent: number; // 算出された年額換算（円）
}

export interface PresetService {
  id: string;
  name: string;
  categoryId: CategoryId;
  defaultAmount: number;
  defaultCycle: BillingCycle;
  cancelUrl: string;
  officialUrl?: string;
  color: string;
  icon: string;
  description: string;
  tipsForCanceling?: string;
}

export interface CostEvaluation {
  level: CostEfficiencyLevel;
  costPerUse: number;
  currentMonthUsage: number;
  isZombie: boolean;
  message: string;
}

export interface AchievementBadge {
  id: string;
  title: string;
  description: string;
  icon: string;
  requiredSavings: number; // 年間節約額（円）
  requiredCancellations: number; // 解約数
  isUnlocked: boolean;
  unlockedAt?: string;
}

export interface AppBackupData {
  version: string;
  exportedAt: string;
  subscriptions: Subscription[];
  badges: AchievementBadge[];
  notes?: string;
}
