import { AchievementBadge } from '../types';

export const INITIAL_BADGES: AchievementBadge[] = [
  {
    id: 'first_blood',
    title: '断捨離の第一歩',
    description: '初めて使っていないサブスクを1件解約した',
    icon: 'Scissors',
    requiredSavings: 0,
    requiredCancellations: 1,
    isUnlocked: false
  },
  {
    id: 'savings_10k',
    title: '1万円セーバー',
    description: '年間で10,000円以上の固定費削減に成功した',
    icon: 'Coins',
    requiredSavings: 10000,
    requiredCancellations: 1,
    isUnlocked: false
  },
  {
    id: 'savings_30k',
    title: '節約エキスパート',
    description: '年間で30,000円以上の固定費削減に成功した',
    icon: 'Flame',
    requiredSavings: 30000,
    requiredCancellations: 2,
    isUnlocked: false
  },
  {
    id: 'savings_50k',
    title: '断捨離マスター',
    description: '年間で50,000円以上の固定費削減に成功した',
    icon: 'Award',
    requiredSavings: 50000,
    requiredCancellations: 3,
    isUnlocked: false
  },
  {
    id: 'savings_100k',
    title: '年間10万円オーバーの英雄',
    description: '年間で100,000円以上の固定費を浮かせた伝説の節約家',
    icon: 'Crown',
    requiredSavings: 100000,
    requiredCancellations: 4,
    isUnlocked: false
  },
  {
    id: 'zombie_slayer_3',
    title: 'ゾンビハンター',
    description: '3件以上のサブスクを断捨離・整理した',
    icon: 'ShieldCheck',
    requiredSavings: 0,
    requiredCancellations: 3,
    isUnlocked: false
  },
  {
    id: 'zombie_slayer_5',
    title: '固定費の守護神',
    description: '5件以上のサブスクを断捨離した',
    icon: 'Sparkles',
    requiredSavings: 0,
    requiredCancellations: 5,
    isUnlocked: false
  }
];
