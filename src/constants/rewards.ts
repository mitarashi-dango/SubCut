export interface RewardItem {
  id: string;
  name: string;
  category: 'food' | 'travel' | 'gadget' | 'lifestyle';
  price: number; // 単位あたりの金額 (円)
  unit: string; // 単位（杯、回、台、年など）
  icon: string; // Lucide icon name または絵文字
  emoji: string;
  description: string;
}

export const REWARD_ITEMS: RewardItem[] = [
  {
    id: 'coffee',
    name: 'カフェラテ / フラペチーノ',
    category: 'food',
    price: 700,
    unit: '杯',
    icon: 'Coffee',
    emoji: '☕',
    description: 'ちょっと贅沢なカフェタイム'
  },
  {
    id: 'sushi_lunch',
    name: '高級寿司ランチ',
    category: 'food',
    price: 3500,
    unit: '回',
    icon: 'Utensils',
    emoji: '🍣',
    description: 'カウンターで味わう極上寿司'
  },
  {
    id: 'yakiniku_dinner',
    name: '黒毛和牛 焼肉ディナー',
    category: 'food',
    price: 12000,
    unit: '回',
    icon: 'Flame',
    emoji: '🥩',
    description: '家族や恋人と楽しむ豪華ディナー'
  },
  {
    id: 'hotspring_trip',
    name: '1泊2日 温泉旅館ペア旅行',
    category: 'travel',
    price: 40000,
    unit: '回',
    icon: 'Palmtree',
    emoji: '♨️',
    description: '客室露天風呂付きの温泉旅行'
  },
  {
    id: 'noise_cancelling_headphones',
    name: '高級ノイズキャンセリングヘッドホン',
    category: 'gadget',
    price: 50000,
    unit: '台',
    icon: 'Headphones',
    emoji: '🎧',
    description: 'AirPods Max / Sony WH-1000XM5クラス'
  },
  {
    id: 'game_console',
    name: '最新ゲーム機本体',
    category: 'gadget',
    price: 65000,
    unit: '台',
    icon: 'Gamepad2',
    emoji: '🎮',
    description: 'PS5 / 次世代ゲーム機'
  },
  {
    id: 'flagship_smartphone',
    name: '最新フラッグシップスマホ',
    category: 'gadget',
    price: 160000,
    unit: '台',
    icon: 'Smartphone',
    emoji: '📱',
    description: '最新iPhone Pro / Galaxy Ultra'
  },
  {
    id: 'hawaii_trip',
    name: 'ハワイ・海外リゾート旅行',
    category: 'travel',
    price: 300000,
    unit: '回',
    icon: 'Plane',
    emoji: '✈️',
    description: '南国での特別なバケーション'
  }
];

/**
 * 毎月積立投資（年利5%複利）を行った場合の将来資産を計算
 * @param monthlySavings 毎月の積立額 (円)
 * @param years 運用年数
 * @param annualRate 想定年利 (例: 0.05)
 */
export function calculateCompoundInterest(
  monthlySavings: number,
  years: number,
  annualRate: number = 0.05
): { totalPrincipal: number; totalAsset: number; earnedInterest: number } {
  const months = years * 12;
  const monthlyRate = annualRate / 12;
  
  let totalAsset = 0;
  for (let i = 0; i < months; i++) {
    totalAsset = (totalAsset + monthlySavings) * (1 + monthlyRate);
  }

  const totalPrincipal = monthlySavings * months;
  const earnedInterest = Math.max(0, Math.round(totalAsset - totalPrincipal));

  return {
    totalPrincipal: Math.round(totalPrincipal),
    totalAsset: Math.round(totalAsset),
    earnedInterest
  };
}
