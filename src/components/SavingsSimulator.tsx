import React, { useState, useMemo } from 'react';
import { 
  Sparkles, 
  TrendingUp, 
  Sliders, 
  CheckSquare, 
  Square, 
  Coins, 
  PiggyBank, 
  Flame, 
  Info,
  Layers,
  ArrowRight
} from 'lucide-react';
import { Subscription } from '../types';
import { REWARD_ITEMS, calculateCompoundInterest } from '../constants/rewards';
import { evaluateCostEfficiency, getCurrentMonthKey, calculateTotalAnnualSavings } from '../utils/calculation';
import { formatCurrency } from '../utils/formatters';

interface SavingsSimulatorProps {
  subscriptions: Subscription[];
  onSelectSubscription?: (sub: Subscription) => void;
}

type SimulatorMode = 'potential' | 'achieved' | 'custom';

export const SavingsSimulator: React.FC<SavingsSimulatorProps> = ({
  subscriptions
}) => {
  const currentMonth = getCurrentMonthKey();

  // 未利用（ゾンビ）サブスクの抽出
  const zombieSubscriptions = useMemo(() => {
    return subscriptions.filter(
      (s) => s.status === 'active' && evaluateCostEfficiency(s, currentMonth).isZombie
    );
  }, [subscriptions, currentMonth]);

  // すでに解約済みの年間節約実績
  const totalAchievedSavings = useMemo(() => {
    return calculateTotalAnnualSavings(subscriptions);
  }, [subscriptions]);

  const [mode, setMode] = useState<SimulatorMode>(
    zombieSubscriptions.length > 0 ? 'potential' : totalAchievedSavings > 0 ? 'achieved' : 'custom'
  );

  // チェックされた未利用サブスクIDセット（デフォルトは全て選択）
  const [selectedZombieIds, setSelectedZombieIds] = useState<Set<string>>(() => {
    return new Set(zombieSubscriptions.map((s) => s.id));
  });

  // カスタム金額（月額入力）
  const [customMonthlyAmount, setCustomMonthlyAmount] = useState<number>(10000);

  // 選択切り替えハンドラー
  const toggleZombieSelect = (id: string) => {
    setSelectedZombieIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const selectAllZombies = () => {
    setSelectedZombieIds(new Set(zombieSubscriptions.map((s) => s.id)));
  };

  const deselectAllZombies = () => {
    setSelectedZombieIds(new Set());
  };

  // シミュレーション対象の年間節約額の算出
  const targetAnnualSavings = useMemo(() => {
    if (mode === 'potential') {
      return zombieSubscriptions
        .filter((s) => selectedZombieIds.has(s.id))
        .reduce((sum, s) => sum + s.yearlyEquivalent, 0);
    }
    if (mode === 'achieved') {
      return totalAchievedSavings;
    }
    return customMonthlyAmount * 12;
  }, [mode, zombieSubscriptions, selectedZombieIds, totalAchievedSavings, customMonthlyAmount]);

  const targetMonthlySavings = Math.round(targetAnnualSavings / 12);

  // つみたて投資シミュレーション (10年, 20年, 年利5%)
  const compound10Years = calculateCompoundInterest(targetMonthlySavings, 10, 0.05);
  const compound20Years = calculateCompoundInterest(targetMonthlySavings, 20, 0.05);

  return (
    <div className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', border: '1px solid rgba(255, 214, 10, 0.25)', background: 'linear-gradient(180deg, #181714 0%, #121214 100%)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.65rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <span style={{ fontSize: '1.25rem' }}>✨</span>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>
              「浮いたお金の使い道」節約シミュレーター
            </h3>
          </div>
          <p style={{ fontSize: '0.785rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            無駄なサブスクを解約して浮いたお金で、どんな体験・ご褒美が手に入るかリアルタイム換算！
          </p>
        </div>

        {/* Mode Selector Tabs */}
        <div className="nav-segmented" style={{ background: '#1c1c1e' }}>
          <button
            className={`segmented-btn ${mode === 'potential' ? 'active' : ''}`}
            onClick={() => setMode('potential')}
            style={{ fontSize: '0.775rem', padding: '0.35rem 0.65rem' }}
          >
            <Flame size={13} style={{ color: mode === 'potential' ? 'var(--color-danger)' : 'inherit' }} />
            <span>未利用解約 ({zombieSubscriptions.length}件)</span>
          </button>
          <button
            className={`segmented-btn ${mode === 'achieved' ? 'active' : ''}`}
            onClick={() => setMode('achieved')}
            style={{ fontSize: '0.775rem', padding: '0.35rem 0.65rem' }}
          >
            <Coins size={13} style={{ color: mode === 'achieved' ? 'var(--color-gold)' : 'inherit' }} />
            <span>解約実績</span>
          </button>
          <button
            className={`segmented-btn ${mode === 'custom' ? 'active' : ''}`}
            onClick={() => setMode('custom')}
            style={{ fontSize: '0.775rem', padding: '0.35rem 0.65rem' }}
          >
            <Sliders size={13} />
            <span>自由設定</span>
          </button>
        </div>
      </div>

      {/* Mode 1: Potential Zombie Checkbox Selection */}
      {mode === 'potential' && (
        <div style={{ background: '#1e1c18', border: '1px solid rgba(255, 159, 10, 0.2)', borderRadius: 'var(--radius-sm)', padding: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.4rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-warning)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Info size={14} /> 解約する未利用サブスクを選択して効果をシミュレーション:
            </span>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={selectAllZombies}
                style={{ fontSize: '0.7rem', color: 'var(--accent-primary)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
              >
                全選択
              </button>
              <button
                type="button"
                onClick={deselectAllZombies}
                style={{ fontSize: '0.7rem', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                全解除
              </button>
            </div>
          </div>

          {zombieSubscriptions.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.45rem' }}>
              {zombieSubscriptions.map((sub) => {
                const isSelected = selectedZombieIds.has(sub.id);
                return (
                  <div
                    key={sub.id}
                    onClick={() => toggleZombieSelect(sub.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.45rem 0.65rem',
                      borderRadius: 'var(--radius-sm)',
                      background: isSelected ? 'rgba(255, 69, 58, 0.15)' : '#161618',
                      border: `1px solid ${isSelected ? 'rgba(255, 69, 58, 0.4)' : 'var(--border-subtle)'}`,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {isSelected ? (
                      <CheckSquare size={16} style={{ color: 'var(--color-danger)', flexShrink: 0 }} />
                    ) : (
                      <Square size={16} style={{ color: 'var(--text-subtle)', flexShrink: 0 }} />
                    )}
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ fontSize: '0.8rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {sub.name}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                        +{formatCurrency(sub.yearlyEquivalent)}/年
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', padding: '0.5rem' }}>
              現在、未利用（ゾンビ）サブスクはありません！✨ 素晴らしい節約管理です。
            </div>
          )}
        </div>
      )}

      {/* Mode 3: Custom Amount Slider / Input */}
      {mode === 'custom' && (
        <div style={{ background: '#1c1c1e', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
            <span style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-main)' }}>
              毎月の目標節約額を設定:
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>月</span>
              <input
                type="number"
                min="1000"
                max="500000"
                step="1000"
                value={customMonthlyAmount}
                onChange={(e) => setCustomMonthlyAmount(Math.max(0, Number(e.target.value)))}
                className="form-input"
                style={{ width: '110px', padding: '0.25rem 0.5rem', textAlign: 'right', fontWeight: 700, fontFamily: 'var(--font-mono)' }}
              />
              <span style={{ fontSize: '0.8rem' }}>円</span>
            </div>
          </div>

          <input
            type="range"
            min="1000"
            max="100000"
            step="1000"
            value={customMonthlyAmount}
            onChange={(e) => setCustomMonthlyAmount(Number(e.target.value))}
            style={{ width: '100%', accentColor: 'var(--accent-primary)', cursor: 'pointer' }}
          />

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-subtle)', marginTop: '0.25rem' }}>
            <span>¥1,000/月</span>
            <span>¥30,000/月</span>
            <span>¥60,000/月</span>
            <span>¥100,000/月</span>
          </div>
        </div>
      )}

      {/* Big Savings Impact Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(255, 214, 10, 0.12) 0%, rgba(255, 149, 0, 0.05) 100%)',
          border: '1px solid rgba(255, 214, 10, 0.3)',
          borderRadius: 'var(--radius-md)',
          padding: '1rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem'
        }}
      >
        <div>
          <span style={{ fontSize: '0.775rem', fontWeight: 600, color: '#ffd60a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {mode === 'potential' ? '🎯 年間節約ポテンシャル（浮くお金）' : mode === 'achieved' ? '🏆 年間節約実績（浮いたお金）' : '💡 目標の年間創出額'}
          </span>
          <div style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#ffffff', lineHeight: 1.2, marginTop: '0.2rem' }}>
            {formatCurrency(targetAnnualSavings)} <span style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-muted)' }}>/ 年</span>
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            毎月あたり <strong style={{ color: '#ffffff', fontFamily: 'var(--font-mono)' }}>{formatCurrency(targetMonthlySavings)}</strong> の自由な使い道が生まれます
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: '#1c1b14', padding: '0.65rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(255, 214, 10, 0.2)' }}>
          <Sparkles size={24} style={{ color: '#ffd60a' }} />
          <div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-subtle)', display: 'block' }}>最大の目玉ご褒美</span>
            <strong style={{ fontSize: '0.9rem', color: '#ffffff' }}>
              {targetAnnualSavings >= 300000 ? '✈️ 海外リゾート旅行' :
               targetAnnualSavings >= 160000 ? '📱 最新フラッグシップスマホ' :
               targetAnnualSavings >= 40000 ? `♨️ 温泉旅館旅行 ${(targetAnnualSavings / 40000).toFixed(1)}回分` :
               targetAnnualSavings >= 12000 ? `🥩 焼肉ディナー ${(targetAnnualSavings / 12000).toFixed(1)}回分` :
               '☕ カフェラテ多数杯分'}
            </strong>
          </div>
        </div>
      </div>

      {/* Rewards Grid */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.75rem' }}>
          <Layers size={16} style={{ color: 'var(--accent-primary)' }} />
          <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>年間で手に入るご褒美・体験一覧</h4>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: '0.75rem' }}>
          {REWARD_ITEMS.map((item) => {
            const count = targetAnnualSavings > 0 ? targetAnnualSavings / item.price : 0;
            const isAchievable = count >= 1;
            const progressPercent = Math.min(100, Math.round((targetAnnualSavings / item.price) * 100));

            return (
              <div
                key={item.id}
                style={{
                  background: isAchievable ? 'rgba(255, 255, 255, 0.04)' : '#161618',
                  border: `1px solid ${isAchievable ? 'rgba(255, 214, 10, 0.25)' : 'var(--border-subtle)'}`,
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.85rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1.4rem' }}>{item.emoji}</span>
                    <div>
                      <div style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--text-main)' }}>
                        {item.name}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-subtle)' }}>
                        {formatCurrency(item.price)} / {item.unit}
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: '0.2rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>換算結果:</span>
                  <div style={{ textAlign: 'right' }}>
                    {isAchievable ? (
                      <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffd60a', fontFamily: 'var(--font-mono)' }}>
                        {count >= 10 ? Math.floor(count) : count.toFixed(1)} <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>{item.unit}分</span>
                      </span>
                    ) : (
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-subtle)' }}>
                        {(item.price / Math.max(1, targetAnnualSavings)).toFixed(1)}年で1{item.unit}
                      </span>
                    )}
                  </div>
                </div>

                {/* Progress Bar towards 1 unit */}
                <div style={{ width: '100%', height: '5px', background: '#252528', borderRadius: '9999px', overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${progressPercent}%`,
                      height: '100%',
                      background: isAchievable ? 'linear-gradient(90deg, #ffd60a, #ff9500)' : 'var(--accent-primary)',
                      borderRadius: '9999px',
                      transition: 'width 0.3s ease'
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Long-term Wealth Impact (つみたてNISA複利シミュレーション) */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(52, 199, 89, 0.08) 0%, rgba(0, 122, 255, 0.05) 100%)',
          border: '1px solid rgba(52, 199, 89, 0.25)',
          borderRadius: 'var(--radius-md)',
          padding: '1rem 1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <TrendingUp size={18} style={{ color: 'var(--color-success)' }} />
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)' }}>
              📈 浮いた固定費をつみたて投資（年利5%）に回した場合の将来資産
            </h4>
          </div>
          <span style={{ fontSize: '0.725rem', color: 'var(--text-subtle)' }}>※年利5%複利計算（元本＋運用益）</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
          {/* 10年後 */}
          <div style={{ background: '#151c16', border: '1px solid rgba(52, 199, 89, 0.2)', borderRadius: 'var(--radius-sm)', padding: '0.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
              <span style={{ fontSize: '0.775rem', fontWeight: 600, color: 'var(--text-muted)' }}>10年後の想定資産</span>
              <span style={{ fontSize: '0.675rem', background: 'rgba(52, 199, 89, 0.15)', color: 'var(--color-success)', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: 700 }}>
                10 Years
              </span>
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--color-success)' }}>
              {formatCurrency(compound10Years.totalAsset)}
            </div>
            <div style={{ fontSize: '0.725rem', color: 'var(--text-subtle)', marginTop: '0.2rem' }}>
              元本: {formatCurrency(compound10Years.totalPrincipal)} (利益 +{formatCurrency(compound10Years.earnedInterest)})
            </div>
          </div>

          {/* 20年後 */}
          <div style={{ background: '#151c16', border: '1px solid rgba(52, 199, 89, 0.2)', borderRadius: 'var(--radius-sm)', padding: '0.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
              <span style={{ fontSize: '0.775rem', fontWeight: 600, color: 'var(--text-muted)' }}>20年後の想定資産</span>
              <span style={{ fontSize: '0.675rem', background: 'rgba(52, 199, 89, 0.15)', color: 'var(--color-success)', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: 700 }}>
                20 Years
              </span>
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--color-success)' }}>
              {formatCurrency(compound20Years.totalAsset)}
            </div>
            <div style={{ fontSize: '0.725rem', color: 'var(--text-subtle)', marginTop: '0.2rem' }}>
              元本: {formatCurrency(compound20Years.totalPrincipal)} (利益 +{formatCurrency(compound20Years.earnedInterest)})
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
