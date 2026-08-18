import { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { AchievementBadge, Subscription } from '../types';
import { 
  loadSubscriptions, 
  saveSubscriptions, 
  loadBadges, 
  saveBadges, 
  getSampleSubscriptions,
  clearAllData 
} from '../utils/storage';
import { 
  calculateEquivalents, 
  calculateTotalAnnualSavings,
  getCurrentMonthKey 
} from '../utils/calculation';

export function useSubscriptions() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [badges, setBadges] = useState<AchievementBadge[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // 初回ロード
  useEffect(() => {
    const loadedSubs = loadSubscriptions();
    const loadedBdg = loadBadges();
    setSubscriptions(loadedSubs);
    setBadges(loadedBdg);
    setIsLoaded(true);
  }, []);

  // 変更時にLocalStorage保存 & バッジ判定
  const persistSubscriptions = useCallback((updatedSubs: Subscription[]) => {
    setSubscriptions(updatedSubs);
    saveSubscriptions(updatedSubs);

    // バッジアンロック判定
    const canceledSubs = updatedSubs.filter((s) => s.status === 'canceled');
    const totalSavings = calculateTotalAnnualSavings(updatedSubs);
    const cancelCount = canceledSubs.length;

    setBadges((prevBadges) => {
      let newlyUnlocked = false;
      const updatedBadges = prevBadges.map((badge) => {
        if (!badge.isUnlocked) {
          const savingsMet = totalSavings >= badge.requiredSavings;
          const countMet = cancelCount >= badge.requiredCancellations;
          if (savingsMet && countMet) {
            newlyUnlocked = true;
            return {
              ...badge,
              isUnlocked: true,
              unlockedAt: new Date().toISOString()
            };
          }
        }
        return badge;
      });

      if (newlyUnlocked) {
        saveBadges(updatedBadges);
        // バッジ獲得時の特別紙吹雪
        try {
          confetti({
            particleCount: 80,
            spread: 90,
            origin: { y: 0.6 },
            colors: ['#FFE600', '#FF4338', '#1DB954', '#3b82f6', '#8b5cf6']
          });
        } catch {
          // ignore
        }
      }
      return updatedBadges;
    });
  }, []);

  // サブスクの追加
  const addSubscription = useCallback((newSubData: Omit<Subscription, 'id' | 'createdAt' | 'usageLogs' | 'monthlyEquivalent' | 'yearlyEquivalent'>) => {
    const { monthly, yearly } = calculateEquivalents(
      newSubData.amount,
      newSubData.billingCycle,
      newSubData.customDays
    );

    const newSub: Subscription = {
      ...newSubData,
      id: 'sub_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      usageLogs: { [getCurrentMonthKey()]: 0 },
      createdAt: new Date().toISOString(),
      monthlyEquivalent: monthly,
      yearlyEquivalent: yearly
    };

    const updated = [newSub, ...subscriptions];
    persistSubscriptions(updated);
    return newSub;
  }, [subscriptions, persistSubscriptions]);

  // サブスクの更新
  const updateSubscription = useCallback((id: string, updates: Partial<Subscription>) => {
    const updated = subscriptions.map((sub) => {
      if (sub.id === id) {
        const merged = { ...sub, ...updates };
        const { monthly, yearly } = calculateEquivalents(
          merged.amount,
          merged.billingCycle,
          merged.customDays
        );
        return {
          ...merged,
          monthlyEquivalent: monthly,
          yearlyEquivalent: yearly
        };
      }
      return sub;
    });
    persistSubscriptions(updated);
  }, [subscriptions, persistSubscriptions]);

  // 今月の利用回数インクリメント (+1)
  const incrementUsage = useCallback((id: string, delta: number = 1) => {
    const currentMonth = getCurrentMonthKey();
    const updated = subscriptions.map((sub) => {
      if (sub.id === id) {
        const currentCount = sub.usageLogs[currentMonth] || 0;
        const newCount = Math.max(0, currentCount + delta);
        return {
          ...sub,
          usageLogs: {
            ...sub.usageLogs,
            [currentMonth]: newCount
          }
        };
      }
      return sub;
    });
    persistSubscriptions(updated);
  }, [subscriptions, persistSubscriptions]);

  // 解約（ステータス変更 ＆ 節約実績に追加）
  const cancelSubscription = useCallback((id: string) => {
    const subToCancel = subscriptions.find((s) => s.id === id);
    if (!subToCancel) return;

    const updated = subscriptions.map((sub) => {
      if (sub.id === id) {
        return {
          ...sub,
          status: 'canceled' as const,
          canceledAt: new Date().toISOString()
        };
      }
      return sub;
    });

    persistSubscriptions(updated);

    // 祝砲紙吹雪エフェクト（大）
    try {
      confetti({
        particleCount: 120,
        spread: 100,
        origin: { y: 0.5 },
        colors: ['#10B981', '#34D399', '#6EE7B7', '#FCD34D', '#60A5FA']
      });
    } catch {
      // ignore
    }
  }, [subscriptions, persistSubscriptions]);

  // 復活（再契約）
  const reactivateSubscription = useCallback((id: string) => {
    const updated = subscriptions.map((sub) => {
      if (sub.id === id) {
        return {
          ...sub,
          status: 'active' as const,
          canceledAt: undefined
        };
      }
      return sub;
    });
    persistSubscriptions(updated);
  }, [subscriptions, persistSubscriptions]);

  // 完全削除
  const deleteSubscription = useCallback((id: string) => {
    const updated = subscriptions.filter((sub) => sub.id !== id);
    persistSubscriptions(updated);
  }, [subscriptions, persistSubscriptions]);

  // サンプルデータ再読み込み
  const resetToSampleData = useCallback(() => {
    const sample = getSampleSubscriptions();
    persistSubscriptions(sample);
  }, [persistSubscriptions]);

  // 全データ初期化
  const clearAll = useCallback(() => {
    clearAllData();
    setSubscriptions([]);
    setBadges(loadBadges());
  }, []);

  // バックアップデータの一括適用
  const importBackupData = useCallback((newSubs: Subscription[], newBadges?: AchievementBadge[]) => {
    setSubscriptions(newSubs);
    saveSubscriptions(newSubs);
    if (newBadges && newBadges.length > 0) {
      setBadges(newBadges);
      saveBadges(newBadges);
    }
  }, []);

  return {
    subscriptions,
    badges,
    isLoaded,
    addSubscription,
    updateSubscription,
    incrementUsage,
    cancelSubscription,
    reactivateSubscription,
    deleteSubscription,
    resetToSampleData,
    clearAll,
    importBackupData
  };
}
