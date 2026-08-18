import { PRESET_SERVICES } from '../constants/presets';
import { CategoryId, PresetService, Subscription } from '../types';

// グローバルTesseractの型定義
declare global {
  interface Window {
    Tesseract?: {
      recognize: (
        image: any,
        lang?: string,
        options?: any
      ) => Promise<{ data: { text: string } }>;
    };
  }
}

export interface ScannedSubscriptionCandidate {
  id: string;
  originalName: string;
  normalizedName: string;
  amount: number;
  categoryId: CategoryId;
  occurrences: number; // 過去3ヶ月で検出された月数 (1〜3)
  monthsDetected: string[];
  totalPaid3Months: number; // 3ヶ月間の累計支払額
  cancelUrl?: string;
  tipsForCanceling?: string;
  matchedPreset?: PresetService;
  color?: string;
  icon?: string;
  isSelected: boolean;
  confidence: 'high' | 'medium';
}

interface RawTransaction {
  dateStr?: string;
  monthKey?: string;
  name: string;
  amount: number;
}

// 国内外の主要サブスク判定用キーワードマップ
const PRESET_KEYWORD_MAP: Array<{ keywords: string[]; presetId: string }> = [
  { keywords: ['netflix', 'ネットフリックス', 'ネトフリ'], presetId: 'netflix' },
  { keywords: ['amazon prime', 'アマゾンプライム', 'amazonプライム', 'amzn prime', 'prime video'], presetId: 'amazon_prime' },
  { keywords: ['youtube', 'ユーチューブ', 'yt premium', 'google youtube'], presetId: 'youtube_premium' },
  { keywords: ['spotify', 'スポティファイ'], presetId: 'spotify' },
  { keywords: ['chatgpt', 'openai', 'オープンエーアイ'], presetId: 'chatgpt_plus' },
  { keywords: ['claude', 'anthropic', 'アンソロピック'], presetId: 'claude_pro' },
  { keywords: ['apple one', 'アップルワン', 'apple.com/bill', 'itunes.com'], presetId: 'apple_one' },
  { keywords: ['icloud', 'アイクラウド'], presetId: 'icloud_plus' },
  { keywords: ['disney', 'ディズニープラス', 'disney+'], presetId: 'disney_plus' },
  { keywords: ['adobe', 'アドビ', 'creative cloud'], presetId: 'adobe_creative_cloud' },
  { keywords: ['github', 'ギットハブ', 'copilot'], presetId: 'github_copilot' },
  { keywords: ['u-next', 'ユーネクスト', 'unext'], presetId: 'u_next' },
  { keywords: ['dmm', 'ディーエムエム', 'dmm premium'], presetId: 'dmm_tv' },
  { keywords: ['dazn', 'ダゾーン'], presetId: 'dazn' },
  { keywords: ['nintendo', 'ニンテンドー', 'switch online'], presetId: 'nintendo_switch_online' },
  { keywords: ['audible', 'オーディブル'], presetId: 'audible' },
  { keywords: ['chocozap', 'チョコザップ', 'ﾁｮｺｻﾞｯﾌﾟ', 'rizap'], presetId: 'chocozap' },
  { keywords: ['anytime', 'エニタイム', 'エニタイムフィットネス'], presetId: 'anytime_fitness' },
  { keywords: ['canva', 'キャンバ'], presetId: 'canva_pro' },
  { keywords: ['notion', 'ノーション'], presetId: 'notion_plus' }
];

/**
 * 1行のテキストから取引データ（店名・金額・日付）を抽出
 */
function parseTransactionLine(line: string): RawTransaction | null {
  const cleanLine = line.trim();
  if (!cleanLine || cleanLine.length < 3) return null;

  // 金額の抽出（¥1,590, 1,590円, 1590, ￥3,278 等）
  const amountMatch = cleanLine.match(/[¥￥]?\s*([0-9]{1,3}(?:,[0-9]{3})+|[0-9]{3,7})\s*(?:円|\b)/);
  if (!amountMatch) return null;

  const rawAmountStr = amountMatch[1].replace(/,/g, '');
  const amount = parseInt(rawAmountStr, 10);
  if (isNaN(amount) || amount <= 0 || amount > 500000) return null;

  // 日付の抽出（2026/06/15, 06/15, 6/15, 2026-07-20 等）
  let dateStr: string | undefined;
  let monthKey: string | undefined;
  const dateMatch = cleanLine.match(/(?:(202[0-9])[\/\-\.年])?\s*([0-1]?[0-9])[\/\-\.月]\s*([0-3]?[0-9])日?/);
  if (dateMatch) {
    const year = dateMatch[1] || new Date().getFullYear().toString();
    const month = String(dateMatch[2]).padStart(2, '0');
    const day = String(dateMatch[3]).padStart(2, '0');
    dateStr = `${year}-${month}-${day}`;
    monthKey = `${year}-${month}`;
  }

  // 店名の抽出
  let name = cleanLine
    .replace(/[¥￥]?\s*([0-9]{1,3}(?:,[0-9]{3})+|[0-9]{3,7})\s*(?:円|\b)/g, '')
    .replace(/(?:(202[0-9])[\/\-\.年])?\s*([0-1]?[0-9])[\/\-\.月]\s*([0-3]?[0-9])日?/g, '')
    .replace(/[\|・:;,\-_/\\*]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!name || name.length < 2) return null;

  return {
    dateStr,
    monthKey,
    name,
    amount
  };
}

/**
 * 既知のプリセットとのマッチング
 */
function findMatchingPreset(name: string): PresetService | undefined {
  const lowerName = name.toLowerCase();
  for (const item of PRESET_KEYWORD_MAP) {
    for (const kw of item.keywords) {
      if (lowerName.includes(kw.toLowerCase())) {
        return PRESET_SERVICES.find((p) => p.id === item.presetId);
      }
    }
  }
  return undefined;
}

/**
 * 抽出された全テキストを解析し、3ヶ月定期課金サブスクを検出
 */
export function analyzeExtractedText(allText: string): ScannedSubscriptionCandidate[] {
  const lines = allText.split(/\r?\n/);
  const rawTransactions: RawTransaction[] = [];

  for (const line of lines) {
    const tx = parseTransactionLine(line);
    if (tx) {
      rawTransactions.push(tx);
    }
  }

  // 店名・金額でグループ化
  const groups: Record<string, {
    originalName: string;
    amount: number;
    months: Set<string>;
    count: number;
  }> = {};

  for (const tx of rawTransactions) {
    const preset = findMatchingPreset(tx.name);
    const groupKey = preset ? `preset_${preset.id}` : `${tx.name.toLowerCase().replace(/\s/g, '')}_${tx.amount}`;

    if (!groups[groupKey]) {
      groups[groupKey] = {
        originalName: preset ? preset.name : tx.name,
        amount: tx.amount,
        months: new Set<string>(),
        count: 0
      };
    }

    if (tx.monthKey) {
      groups[groupKey].months.add(tx.monthKey);
    }
    groups[groupKey].count++;
  }

  const candidates: ScannedSubscriptionCandidate[] = [];

  for (const [key, group] of Object.entries(groups)) {
    const matchedPreset = key.startsWith('preset_')
      ? PRESET_SERVICES.find((p) => `preset_${p.id}` === key)
      : findMatchingPreset(group.originalName);

    const occurrences = Math.max(group.months.size, Math.min(3, group.count));
    const isHighConfidence = !!matchedPreset || occurrences >= 2;

    if (isHighConfidence || group.count >= 1) {
      const categoryId: CategoryId = matchedPreset ? matchedPreset.categoryId : 'other';
      const category = CATEGORIES[categoryId] || CATEGORIES.other;

      candidates.push({
        id: 'cand_' + Math.random().toString(36).substring(2, 9),
        originalName: group.originalName,
        normalizedName: matchedPreset ? matchedPreset.name : group.originalName,
        amount: group.amount,
        categoryId,
        occurrences,
        monthsDetected: Array.from(group.months),
        totalPaid3Months: group.amount * (occurrences || 1),
        cancelUrl: matchedPreset?.cancelUrl,
        tipsForCanceling: matchedPreset?.tipsForCanceling,
        matchedPreset,
        color: matchedPreset?.color || category.color,
        icon: matchedPreset?.icon || category.icon,
        isSelected: isHighConfidence,
        confidence: isHighConfidence ? 'high' : 'medium'
      });
    }
  }

  return candidates.sort((a, b) => {
    if (a.confidence === 'high' && b.confidence !== 'high') return -1;
    if (b.confidence === 'high' && a.confidence !== 'high') return 1;
    return b.amount - a.amount;
  });
}

/**
 * 画像ファイルからテキストをOCR認識（Tesseract CDNまたはフォールバック）
 */
export async function performOcrOnImage(
  imageFile: File | Blob,
  onProgress?: (progress: number, statusText: string) => void
): Promise<string> {
  // Tesseract CDNの動的読み込み
  if (!window.Tesseract) {
    if (onProgress) onProgress(20, 'OCRエンジンを準備中...');
    await new Promise<void>((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('OCRエンジンの読み込みに失敗しました'));
      document.head.appendChild(script);
    });
  }

  if (window.Tesseract) {
    if (onProgress) onProgress(50, 'スクショ画像を解析中...');
    const res = await window.Tesseract.recognize(imageFile, 'jpn+eng', {
      logger: (m: any) => {
        if (m.status === 'recognizing text' && onProgress) {
          onProgress(Math.round(50 + (m.progress || 0) * 45), '文字を読み取り中...');
        }
      }
    });
    return res.data.text;
  }

  throw new Error('OCRエンジンが利用できません');
}

/**
 * デモ・お試し用のリアルな3ヶ月分明細サンプル
 */
export const SAMPLE_STATEMENT_TEXT = `
2026/06/15 NETFLIX.COM 1,590円
2026/06/20 AMAZON PRIME 600円
2026/06/22 ﾁｮｺｻﾞｯﾌﾟ (chocoZAP) 3,278円
2026/06/28 OPENAI *CHATGPT PLUS 3,000円
2026/07/15 NETFLIX.COM 1,590円
2026/07/20 AMAZON PRIME 600円
2026/07/22 ﾁｮｺｻﾞｯﾌﾟ (chocoZAP) 3,278円
2026/07/28 OPENAI *CHATGPT PLUS 3,000円
2026/07/30 APPLE.COM/BILL 130円
2026/08/15 NETFLIX.COM 1,590円
2026/08/20 AMAZON PRIME 600円
2026/08/22 ﾁｮｺｻﾞｯﾌﾟ (chocoZAP) 3,278円
2026/08/28 OPENAI *CHATGPT PLUS 3,000円
2026/08/30 APPLE.COM/BILL 130円
`;

/**
 * 検出された候補を一括で `Subscription` オブジェクトに変換
 */
export function convertCandidatesToSubscriptions(candidates: ScannedSubscriptionCandidate[]): Subscription[] {
  const currentMonth = getCurrentMonthKey();
  const today = new Date();

  return candidates.map((cand, idx) => {
    const { monthly, yearly } = calculateEquivalents(cand.amount, 'monthly');
    const nextDate = new Date(today.getTime() + (idx * 3 + 5) * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    return {
      id: 'sub_scanned_' + Date.now() + '_' + idx,
      name: cand.normalizedName,
      categoryId: cand.categoryId,
      amount: cand.amount,
      billingCycle: 'monthly',
      nextBillingDate: nextDate,
      isTrial: false,
      cancelUrl: cand.cancelUrl,
      officialUrl: cand.matchedPreset?.officialUrl,
      status: 'active',
      paymentMethod: 'クレジットカード（明細スキャン）',
      notes: `過去3ヶ月で${cand.occurrences}回検出（3ヶ月累計支払: ¥${cand.totalPaid3Months.toLocaleString()}）`,
      color: cand.color,
      icon: cand.icon,
      usageLogs: { [currentMonth]: 0 },
      createdAt: new Date().toISOString(),
      monthlyEquivalent: monthly,
      yearlyEquivalent: yearly
    };
  });
}
