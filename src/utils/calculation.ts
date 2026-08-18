import { BillingCycle, CostEvaluation, CostEfficiencyLevel, Subscription } from '../types';

// コスパ判定の基準定数
export const COST_EFFICIENCY_THRESHOLDS = {
  EXCELLENT_MAX_PER_USE: 300, // 1回あたり300円以下は極めて良好
  GOOD_MAX_PER_USE: 800,      // 1回あたり800円以下は標準的
  MIN_ACTIVE_USAGE_COUNT: 2,  // 月2回未満はゾンビ警告対象
  URGENT_DAYS_THRESHOLD: 3,   // 更新3日以内は緊急アラート
  UPCOMING_DAYS_THRESHOLD: 7  // 更新7日以内は予告アラート
} as const;

/**
 * 現在の年月キー（YYYY-MM）を取得
 */
export function getCurrentMonthKey(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

/**
 * 請求周期に基づいて月額換算額と年額換算額を計算
 */
export function calculateEquivalents(
  amount: number,
  cycle: BillingCycle,
  customDays?: number
): { monthly: number; yearly: number } {
  let monthly = 0;
  let yearly = 0;

  switch (cycle) {
    case 'monthly':
      monthly = amount;
      yearly = Math.round(amount * 12);
      break;
    case 'yearly':
      yearly = amount;
      monthly = Math.round(amount / 12);
      break;
    case 'custom_days': {
      const days = customDays && customDays > 0 ? customDays : 30;
      monthly = Math.round((amount / days) * 30.4375);
      yearly = Math.round((amount / days) * 365.25);
      break;
    }
  }

  return { monthly, yearly };
}

/**
 * 今月の利用回数と1回あたりコスト・コスパ判定を算出
 */
export function evaluateCostEfficiency(
  subscription: Subscription,
  monthKey: string = getCurrentMonthKey()
): CostEvaluation {
  const usageCount = subscription.usageLogs[monthKey] || 0;
  const monthlyCost = subscription.monthlyEquivalent;

  // 1回あたりコストの計算（0回の場合は月額全額）
  const costPerUse = usageCount > 0 ? Math.round(monthlyCost / usageCount) : monthlyCost;

  let level: CostEfficiencyLevel;
  let isZombie = false;
  let message = '';

  if (usageCount === 0) {
    level = 'zombie';
    isZombie = true;
    message = '⚠️ 今月の利用なし（ゾンビ課金中）';
  } else if (usageCount === 1 && monthlyCost >= 800) {
    level = 'warning';
    isZombie = true;
    message = '⚠️ 利用回数が少なく1回あたりが割高です';
  } else if (costPerUse <= COST_EFFICIENCY_THRESHOLDS.EXCELLENT_MAX_PER_USE) {
    level = 'excellent';
    isZombie = false;
    message = '✨ 非常に高いコスパで活用中！';
  } else if (costPerUse <= COST_EFFICIENCY_THRESHOLDS.GOOD_MAX_PER_USE) {
    level = 'good';
    isZombie = false;
    message = '👍 適正な頻度で利用されています';
  } else {
    level = 'warning';
    isZombie = false;
    message = '💡 もう少し利用頻度を増やすか見直し推奨';
  }

  return {
    level,
    costPerUse,
    currentMonthUsage: usageCount,
    isZombie,
    message
  };
}

/**
 * 指定された日付までの残り日数を計算
 */
export function getDaysUntilDate(targetDateStr: string): number {
  if (!targetDateStr) return 999;
  const targetDate = new Date(targetDateStr);
  targetDate.setHours(0, 0, 0, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const diffMs = targetDate.getTime() - today.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * 解約により浮かせた年間累計節約額を計算
 */
export function calculateTotalAnnualSavings(subscriptions: Subscription[]): number {
  return subscriptions
    .filter((sub) => sub.status === 'canceled')
    .reduce((sum, sub) => sum + sub.yearlyEquivalent, 0);
}

/**
 * 現在アクティブなサブスクの月額合計と年額合計を計算
 */
export function calculateActiveTotals(subscriptions: Subscription[]): {
  monthlyTotal: number;
  yearlyTotal: number;
  activeCount: number;
  zombieCount: number;
} {
  const activeSubs = subscriptions.filter((sub) => sub.status === 'active');
  const currentMonth = getCurrentMonthKey();

  let monthlyTotal = 0;
  let yearlyTotal = 0;
  let zombieCount = 0;

  for (const sub of activeSubs) {
    monthlyTotal += sub.monthlyEquivalent;
    yearlyTotal += sub.yearlyEquivalent;

    const evalResult = evaluateCostEfficiency(sub, currentMonth);
    if (evalResult.isZombie) {
      zombieCount++;
    }
  }

  return {
    monthlyTotal,
    yearlyTotal,
    activeCount: activeSubs.length,
    zombieCount
  };
}
