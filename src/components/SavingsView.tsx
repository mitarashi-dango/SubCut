import React from 'react';
import { 
  Trophy, 
  Scissors,
  RotateCcw, 
  Award, 
  CheckCircle2
} from 'lucide-react';
import { AchievementBadge, Subscription } from '../types';
import { CATEGORIES } from '../constants/categories';
import { calculateTotalAnnualSavings } from '../utils/calculation';
import { formatCurrency, formatDate } from '../utils/formatters';
import { CategoryIcon } from './CategoryIcon';
import { SavingsSimulator } from './SavingsSimulator';

interface SavingsViewProps {
  subscriptions: Subscription[];
  badges: AchievementBadge[];
  onReactivateSub: (id: string) => void;
  onSelectSub: (sub: Subscription) => void;
}

export const SavingsView: React.FC<SavingsViewProps> = ({
  subscriptions,
  badges,
  onReactivateSub,
  onSelectSub
}) => {
  const canceledSubscriptions = subscriptions.filter((s) => s.status === 'canceled');
  const totalAnnualSavings = calculateTotalAnnualSavings(subscriptions);
  const totalMonthlySavings = Math.round(totalAnnualSavings / 12);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Hero Achievement Header */}
      <div className="hero-savings-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div className="savings-badge-icon">
            <Trophy size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.785rem', fontWeight: 600, color: 'var(--color-success)', display: 'block', marginBottom: '0.15rem' }}>
              固定費断捨離の実績
            </span>
            <div className="savings-value">
              {formatCurrency(totalAnnualSavings)} <span style={{ fontSize: '1rem', fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>/ 年</span>
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
              月額換算で約 <strong style={{ color: 'var(--text-main)', fontFamily: 'var(--font-mono)' }}>{formatCurrency(totalMonthlySavings)}</strong> の自由な資金を創出中
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Savings Reward Simulator */}
      <SavingsSimulator
        subscriptions={subscriptions}
        onSelectSubscription={onSelectSub}
      />

      {/* Achievement Badges Collection */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <Award size={16} style={{ color: 'var(--color-gold)' }} />
            <h3 style={{ fontSize: '0.95rem', fontWeight: 600 }}>節約バッジ</h3>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>
            {badges.filter((b) => b.isUnlocked).length} / {badges.length} 達成
          </span>
        </div>

        <div className="badge-grid">
          {badges.map((badge) => (
            <div
              key={badge.id}
              className={`badge-card ${badge.isUnlocked ? 'unlocked animate-fade-in' : 'locked'}`}
            >
              <div className={`badge-icon-box ${badge.isUnlocked ? 'unlocked' : 'locked'}`}>
                <CategoryIcon name={badge.icon} size={18} />
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: badge.isUnlocked ? 'var(--text-main)' : 'var(--text-muted)' }}>
                    {badge.title}
                  </h4>
                  {badge.isUnlocked && <CheckCircle2 size={13} style={{ color: 'var(--color-gold)' }} />}
                </div>
                <p style={{ fontSize: '0.725rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
                  {badge.description}
                </p>
                {badge.isUnlocked && badge.unlockedAt && (
                  <span style={{ fontSize: '0.675rem', color: 'var(--text-subtle)', display: 'block', marginTop: '0.15rem' }}>
                    達成日: {formatDate(badge.unlockedAt)}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Canceled Subscriptions List */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <Scissors size={16} style={{ color: 'var(--text-muted)' }} />
            <h3 style={{ fontSize: '0.95rem', fontWeight: 600 }}>解約したサブスク</h3>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>
            {canceledSubscriptions.length} 件
          </span>
        </div>

        {canceledSubscriptions.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {canceledSubscriptions.map((sub) => {
              const cat = CATEGORIES[sub.categoryId] || CATEGORIES.other;
              return (
                <div
                  key={sub.id}
                  className="card"
                  style={{
                    padding: '0.85rem 1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '0.65rem'
                  }}
                  onClick={() => onSelectSub(sub)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div
                      className="sub-icon"
                      style={{
                        backgroundColor: '#232326',
                        color: sub.color || cat.color,
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        width: '34px',
                        height: '34px'
                      }}
                    >
                      <CategoryIcon name={sub.icon || cat.icon} size={16} />
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <h4 style={{ fontWeight: 600, fontSize: '0.875rem' }}>{sub.name}</h4>
                        <span style={{ fontSize: '0.65rem', color: 'var(--color-success)', fontWeight: 600 }}>
                          ✓ 解約済
                        </span>
                      </div>
                      <div style={{ fontSize: '0.725rem', color: 'var(--text-subtle)' }}>
                        解約日: {formatDate(sub.canceledAt)} • {cat.name}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--color-success)', fontSize: '0.95rem' }}>
                        +{formatCurrency(sub.yearlyEquivalent)}
                      </div>
                      <span style={{ fontSize: '0.675rem', color: 'var(--text-subtle)' }}>年間削減額</span>
                    </div>

                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onReactivateSub(sub.id);
                      }}
                      title="契約中に戻す"
                    >
                      <RotateCcw size={13} />
                      <span>再開</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px dashed var(--border-card)',
              borderRadius: 'var(--radius-md)',
              padding: '2rem 1rem',
              textAlign: 'center',
              color: 'var(--text-subtle)',
              fontSize: '0.825rem'
            }}
          >
            まだ解約したサブスクはありません。
          </div>
        )}
      </div>
    </div>
  );
};
