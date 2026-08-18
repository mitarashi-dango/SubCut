import { CategoryId, CategoryInfo } from '../types';

export const CATEGORIES: Record<CategoryId, CategoryInfo> = {
  video: {
    id: 'video',
    name: '動画・配信',
    icon: 'Tv',
    color: '#e50914',
    bgColor: 'rgba(229, 9, 20, 0.15)',
  },
  music: {
    id: 'music',
    name: '音楽・ポッドキャスト',
    icon: 'Music',
    color: '#1db954',
    bgColor: 'rgba(29, 185, 84, 0.15)',
  },
  ai_tools: {
    id: 'ai_tools',
    name: 'AI・生成ツール',
    icon: 'Bot',
    color: '#10a37f',
    bgColor: 'rgba(16, 163, 127, 0.15)',
  },
  productivity: {
    id: 'productivity',
    name: '仕事・制作・ツール',
    icon: 'Briefcase',
    color: '#3b82f6',
    bgColor: 'rgba(59, 130, 246, 0.15)',
  },
  cloud_storage: {
    id: 'cloud_storage',
    name: 'クラウド・ストレージ',
    icon: 'Cloud',
    color: '#0284c7',
    bgColor: 'rgba(2, 132, 199, 0.15)',
  },
  fitness: {
    id: 'fitness',
    name: 'ジム・健康・ヘルスケア',
    icon: 'Dumbbell',
    color: '#f97316',
    bgColor: 'rgba(249, 115, 22, 0.15)',
  },
  learning: {
    id: 'learning',
    name: '学習・教育・書籍',
    icon: 'BookOpen',
    color: '#8b5cf6',
    bgColor: 'rgba(139, 92, 246, 0.15)',
  },
  gaming: {
    id: 'gaming',
    name: 'ゲーム',
    icon: 'Gamepad2',
    color: '#ec4899',
    bgColor: 'rgba(236, 72, 153, 0.15)',
  },
  entertainment: {
    id: 'entertainment',
    name: 'エンタメ・ファンクラブ',
    icon: 'Film',
    color: '#eab308',
    bgColor: 'rgba(234, 179, 8, 0.15)',
  },
  lifestyle: {
    id: 'lifestyle',
    name: 'ライフスタイル・定期便',
    icon: 'Coffee',
    color: '#14b8a6',
    bgColor: 'rgba(20, 184, 166, 0.15)',
  },
  other: {
    id: 'other',
    name: 'その他',
    icon: 'MoreHorizontal',
    color: '#94a3b8',
    bgColor: 'rgba(148, 163, 184, 0.15)',
  },
};

export const CATEGORY_LIST = Object.values(CATEGORIES);
