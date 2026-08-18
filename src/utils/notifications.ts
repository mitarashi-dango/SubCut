import { Subscription } from '../types';
import { getDaysUntilDate } from './calculation';
import { formatCurrency } from './formatters';

const NOTIFIED_CACHE_KEY = 'subcut_notified_reminders_cache';

interface NotifiedCache {
  [subId: string]: string; // subId -> lastNotifiedDate (YYYY-MM-DD)
}

/**
 * ブラウザが Web Notification API をサポートしているか確認
 */
export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

/**
 * 現在の通知パーミッションを取得
 */
export function getNotificationPermission(): NotificationPermission | 'unsupported' {
  if (!isNotificationSupported()) return 'unsupported';
  return Notification.permission;
}

/**
 * 通知の許可をリクエスト
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!isNotificationSupported()) return false;
  try {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch (error) {
    console.error('Failed to request notification permission:', error);
    return false;
  }
}

/**
 * 直近の更新予定・無料体験終了のサブスクをチェックして通知
 */
export function checkAndTriggerBillingReminders(subscriptions: Subscription[]): void {
  if (!isNotificationSupported() || Notification.permission !== 'granted') {
    return;
  }

  const todayStr = new Date().toISOString().split('T')[0];
  let notifiedCache: NotifiedCache = {};

  try {
    const raw = localStorage.getItem(NOTIFIED_CACHE_KEY);
    if (raw) notifiedCache = JSON.parse(raw);
  } catch {
    notifiedCache = {};
  }

  const activeSubs = subscriptions.filter((s) => s.status === 'active');

  for (const sub of activeSubs) {
    const targetDate = sub.isTrial && sub.trialEndDate ? sub.trialEndDate : sub.nextBillingDate;
    const daysUntil = getDaysUntilDate(targetDate);

    // 0日以上3日以内の場合
    if (daysUntil >= 0 && daysUntil <= REMINDER_THRESHOLD_DAYS) {
      // 今日すでに通知済みならスキップ
      if (notifiedCache[sub.id] === todayStr) {
        continue;
      }

      const title = sub.isTrial
        ? `⚠️ 【解約期限】${sub.name} の無料体験があと${daysUntil === 0 ? '今日で' : `${daysUntil}日で`}終了します`
        : `🔔 【更新間近】${sub.name} の請求日があと${daysUntil === 0 ? '今日' : `${daysUntil}日後`}です (${formatCurrency(sub.amount)})`;

      const body = sub.isTrial
        ? `解約を忘れると本契約に移行して課金されます。不要な場合はSubCutの直通リンクから解約手続きを行ってください。`
        : `今月の利用状況を確認し、使っていない場合はSubCutから解約手続きを行いましょう。`;

      try {
        const notification = new Notification(title, {
          body,
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          tag: `subcut-reminder-${sub.id}`
        });

        notification.onclick = () => {
          window.focus();
          notification.close();
        };

        // キャッシュに記録
        notifiedCache[sub.id] = todayStr;
      } catch (err) {
        console.error('Error triggering notification:', err);
      }
    }
  }

  try {
    localStorage.setItem(NOTIFIED_CACHE_KEY, JSON.stringify(notifiedCache));
  } catch (err) {
    console.error('Failed to save notification cache:', err);
  }
}
