import { AchievementBadge, Subscription } from '../types';
import { INITIAL_BADGES } from '../constants/badges';
import { calculateEquivalents, getCurrentMonthKey } from './calculation';

const STORAGE_KEYS = {
  SUBSCRIPTIONS: 'subcut_subscriptions_v2',
  BADGES: 'subcut_badges_v2',
  FIRST_RUN: 'subcut_first_run_done_v2'
} as const;

/**
 * 初期デモ用サンプルデータを生成
 */
export function getSampleSubscriptions(): Subscription[] {
  const currentMonth = getCurrentMonthKey();
  const today = new Date();
  
  // 5日後
  const date5DaysLater = new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  // 2日後（更新間近）
  const date2DaysLater = new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  // 18日後
  const date18DaysLater = new Date(today.getTime() + 18 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  // 25日後
  const date25DaysLater = new Date(today.getTime() + 25 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const netflixEquiv = calculateEquivalents(1590, 'monthly');
  const chatgptEquiv = calculateEquivalents(3000, 'monthly');
  const primeEquiv = calculateEquivalents(600, 'monthly');
  const gymEquiv = calculateEquivalents(3278, 'monthly');
  const icloudEquiv = calculateEquivalents(130, 'monthly');
  const daznEquiv = calculateEquivalents(4200, 'monthly');

  return [
    {
      id: 'sub_sample_netflix',
      name: 'Netflix',
      categoryId: 'video',
      amount: 1590,
      billingCycle: 'monthly',
      nextBillingDate: date18DaysLater,
      isTrial: false,
      cancelUrl: 'https://www.netflix.com/youraccount',
      officialUrl: 'https://www.netflix.com',
      status: 'active',
      paymentMethod: 'クレジットカード（末尾 4242）',
      notes: 'スタンダードプラン。週末に映画を視聴。',
      color: '#E50914',
      icon: 'Tv',
      usageLogs: { [currentMonth]: 8 }, // 8回利用 -> コスパ良好
      createdAt: new Date(today.getTime() - 60 * 24 * 60 * 60 * 1000).toISOString(),
      monthlyEquivalent: netflixEquiv.monthly,
      yearlyEquivalent: netflixEquiv.yearly
    },
    {
      id: 'sub_sample_chatgpt',
      name: 'ChatGPT Plus',
      categoryId: 'ai_tools',
      amount: 3000,
      billingCycle: 'monthly',
      nextBillingDate: date5DaysLater,
      isTrial: false,
      cancelUrl: 'https://chatgpt.com/#settings/Subscription',
      officialUrl: 'https://chatgpt.com',
      status: 'active',
      paymentMethod: 'Mastercard',
      notes: '仕事・リサーチ・コーディングで毎日ヘビーユース。',
      color: '#10A37F',
      icon: 'Bot',
      usageLogs: { [currentMonth]: 42 }, // 42回利用 -> 超高コスパ
      createdAt: new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString(),
      monthlyEquivalent: chatgptEquiv.monthly,
      yearlyEquivalent: chatgptEquiv.yearly
    },
    {
      id: 'sub_sample_gym',
      name: 'chocoZAP (チョコザップ)',
      categoryId: 'fitness',
      amount: 3278,
      billingCycle: 'monthly',
      nextBillingDate: date2DaysLater, // 2日後更新！
      isTrial: false,
      cancelUrl: 'https://chocozap.jp/',
      officialUrl: 'https://chocozap.jp',
      status: 'active',
      paymentMethod: 'Visa',
      notes: '先月から忙しくて1度も行けていない…',
      color: '#FFE600',
      icon: 'Dumbbell',
      usageLogs: { [currentMonth]: 0 }, // 0回利用 -> ⚠️ ゾンビ課金！
      createdAt: new Date(today.getTime() - 45 * 24 * 60 * 60 * 1000).toISOString(),
      monthlyEquivalent: gymEquiv.monthly,
      yearlyEquivalent: gymEquiv.yearly
    },
    {
      id: 'sub_sample_prime',
      name: 'Amazon Prime (無料体験中)',
      categoryId: 'lifestyle',
      amount: 600,
      billingCycle: 'monthly',
      nextBillingDate: date5DaysLater,
      isTrial: true,
      trialEndDate: date5DaysLater,
      cancelUrl: 'https://www.amazon.co.jp/mc/pipelines/cancellation',
      officialUrl: 'https://www.amazon.co.jp',
      status: 'active',
      paymentMethod: 'JCB',
      notes: 'セール時にお試し登録。解約し忘れると自動課金される！',
      color: '#00A8E1',
      icon: 'ShoppingBag',
      usageLogs: { [currentMonth]: 1 },
      createdAt: new Date(today.getTime() - 25 * 24 * 60 * 60 * 1000).toISOString(),
      monthlyEquivalent: primeEquiv.monthly,
      yearlyEquivalent: primeEquiv.yearly
    },
    {
      id: 'sub_sample_icloud',
      name: 'iCloud+ 50GB',
      categoryId: 'cloud_storage',
      amount: 130,
      billingCycle: 'monthly',
      nextBillingDate: date25DaysLater,
      isTrial: false,
      cancelUrl: 'https://support.apple.com/ja-jp/HT207594',
      officialUrl: 'https://www.apple.com/jp/icloud/',
      status: 'active',
      paymentMethod: 'Apple Pay',
      notes: '写真バックアップ用。月130円で必須。',
      color: '#0070C9',
      icon: 'Cloud',
      usageLogs: { [currentMonth]: 30 },
      createdAt: new Date(today.getTime() - 200 * 24 * 60 * 60 * 1000).toISOString(),
      monthlyEquivalent: icloudEquiv.monthly,
      yearlyEquivalent: icloudEquiv.yearly
    },
    {
      id: 'sub_sample_dazn_canceled',
      name: 'DAZN (スポーツ見放題)',
      categoryId: 'video',
      amount: 4200,
      billingCycle: 'monthly',
      nextBillingDate: '2026-07-31',
      isTrial: false,
      cancelUrl: 'https://www.dazn.com/ja-JP/myaccount/subscription',
      officialUrl: 'https://www.dazn.com',
      status: 'canceled', // 過去に解約済み -> 節約実績にカウントされる！
      paymentMethod: 'クレジットカード',
      notes: 'シーズン終了に伴い解約！年間約5万円の節約達成。',
      color: '#F8F8F8',
      icon: 'Activity',
      usageLogs: {},
      createdAt: new Date(today.getTime() - 120 * 24 * 60 * 60 * 1000).toISOString(),
      canceledAt: new Date(today.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      monthlyEquivalent: daznEquiv.monthly,
      yearlyEquivalent: daznEquiv.yearly
    }
  ];
}

/**
 * LocalStorageからサブスク一覧を取得
 */
export function loadSubscriptions(): Subscription[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SUBSCRIPTIONS);
    if (!raw) {
      // 初回起動時はまっさら（空配列）でスタート
      saveSubscriptions([]);
      return [];
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load subscriptions from localStorage', err);
    return [];
  }
}

/**
 * LocalStorageにサブスク一覧を保存
 */
export function saveSubscriptions(subscriptions: Subscription[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SUBSCRIPTIONS, JSON.stringify(subscriptions));
  } catch (err) {
    console.error('Failed to save subscriptions to localStorage', err);
  }
}

/**
 * LocalStorageからバッジ一覧を取得
 */
export function loadBadges(): AchievementBadge[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.BADGES);
    if (!raw) {
      saveBadges(INITIAL_BADGES);
      return INITIAL_BADGES;
    }
    const storedBadges: AchievementBadge[] = JSON.parse(raw);
    
    // 定義が増えた場合にマージ
    return INITIAL_BADGES.map((initBadge) => {
      const found = storedBadges.find((b) => b.id === initBadge.id);
      return found ? { ...initBadge, isUnlocked: found.isUnlocked, unlockedAt: found.unlockedAt } : initBadge;
    });
  } catch (err) {
    console.error('Failed to load badges from localStorage', err);
    return INITIAL_BADGES;
  }
}

/**
 * LocalStorageにバッジ一覧を保存
 */
export function saveBadges(badges: AchievementBadge[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.BADGES, JSON.stringify(badges));
  } catch (err) {
    console.error('Failed to save badges to localStorage', err);
  }
}

/**
 * データをすべてリセット
 */
export function clearAllData(): void {
  localStorage.removeItem(STORAGE_KEYS.SUBSCRIPTIONS);
  localStorage.removeItem(STORAGE_KEYS.BADGES);
  localStorage.removeItem(STORAGE_KEYS.FIRST_RUN);
  // 旧バージョンのキーも念のため消去
  localStorage.removeItem('subcut_subscriptions_v1');
  localStorage.removeItem('subcut_badges_v1');
  localStorage.removeItem('subcut_first_run_done');
}
