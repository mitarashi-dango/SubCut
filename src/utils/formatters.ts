import { BillingCycle } from '../types';

/**
 * 日本円通貨表記へフォーマット
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency: 'JPY',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * 料金と請求サイクルのラベル表記（例: ¥1,590 / 月）
 */
export function formatPriceWithCycle(amount: number, cycle: BillingCycle, customDays?: number): string {
  const formattedAmount = formatCurrency(amount);
  switch (cycle) {
    case 'monthly':
      return `${formattedAmount} / 月`;
    case 'yearly':
      return `${formattedAmount} / 年`;
    case 'custom_days':
      return `${formattedAmount} / ${customDays || 30}日`;
  }
}

/**
 * 日付（YYYY-MM-DD）の表示用フォーマット
 */
export function formatDate(dateStr?: string): string {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${year}年${month}月${day}日`;
}

/**
 * 残り日数のテキスト表現
 */
export function formatDaysRemaining(days: number): { text: string; isUrgent: boolean; isPassed: boolean } {
  if (days < 0) {
    return { text: `${Math.abs(days)}日超過`, isUrgent: true, isPassed: true };
  }
  if (days === 0) {
    return { text: '今日が更新日！', isUrgent: true, isPassed: false };
  }
  if (days === 1) {
    return { text: '明日が更新日！', isUrgent: true, isPassed: false };
  }
  if (days <= 3) {
    return { text: `あと${days}日（更新迫る）`, isUrgent: true, isPassed: false };
  }
  if (days <= 7) {
    return { text: `あと${days}日`, isUrgent: false, isPassed: false };
  }
  return { text: `あと${days}日`, isUrgent: false, isPassed: false };
}
