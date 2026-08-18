import React from 'react';
import { 
  Trophy, 
  TrendingDown, 
  Calendar, 
  AlertCircle, 
  CreditCard, 
  ArrowRight, 
  Plus, 
  Camera,
  Scissors
} from 'lucide-react';
import { Subscription } from '../types';
import { CATEGORIES } from '../constants/categories';
import { 
  calculateActiveTotals, 
  calculateTotalAnnualSavings, 
  evaluateCostEfficiency, 
  getCurrentMonthKey, 
  getDaysUntilDate 
} from '../utils/calculation';
import { formatCurrency, formatDaysRemaining } from '../utils/formatters';
import { CategoryIcon } from './CategoryIcon';

interface DashboardProps {
  subscriptions: Subscription[];
  onSelectSubscription: (sub: Subscription) => void;
  onOpenAddModal: () => void;
  onOpenScannerModal: () => void;
  onNavigateToTab: (tab: 'subscriptions' | 'zombies' | 'savings') => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  subscriptions,
  onSelectSubscription,
  onOpenAddModal,
  onOpenScannerModal,
  onNavigateToTab
}) => {
  const currentMonth = getCurrentMonthKey();
  const totals = calculateActiveTotals(subscriptions);
  const totalAnnualSavings = calculateTotalAnnualSavings(subscriptions);
  const canceledCount = subscriptions.filter((s) => s.status === 'canceled').length;
  const activeSubs = subscriptions.filter((s) => s.status === 'active');

  // ゾンビ（未利用）サブスクの抽出
  const zombieSubscriptions = activeSubs.filter(
    (s) => evaluateCostEfficiency(s, currentMonth).isZombie
  );

  // 7日以内に更新が迫っているサブスク
  const upcomingSubscriptions = activeSubs
    .map((s) => ({ sub: s, days: getDaysUntilDate(s.nextBillingDate) }))
    .filter((item) => item.days >= 0 && item.days <= 7)
    .sort((a, b) => a.days - b.days);

  // カテゴリ別支出集計
  const categorySpending = activeSubs.reduce((acc, sub) => {
    acc[sub.categoryId] = (acc[sub.categoryId] || 0) + sub.monthlyEquivalent;
    return acc;
  }, {} as Record<string, number>);

  const sortedCategories = Object.entries(categorySpending).sort(([, a], [, b]) => b - a);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* If no subscriptions, show prominent Main Card 3-Month Scanner Welcome Hero */}
      {activeSubs.length === 0 ? (
        <div
          className="card animate-fade-in"
          style={{
            background: 'linear-gradient(135deg, #1c1c1e 0%, #161618 100%)',
            border: '1px solid rgba(255, 69, 58, 0.4)',
            padding: '2rem 1.5rem',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1rem'
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'rgba(255, 69, 58, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-danger)'
            }}
          >
            <Camera size={28} />
          </div>

          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.35rem' }}>
              メインカードの過去3ヶ月明細からスタート！
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: '480px', lineHeight: 1.5 }}>
              普段使っているメインカードの利用明細スクショ（1〜3枚）を貼るだけで、
              知らずに払い続けている無駄なサブスクを自動で洗い出します。
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button
              className="btn btn-primary"
              onClick={onOpenScannerModal}
              style={{ background: '#ffffff', color: '#000000', fontWeight: 700 }}
            >
              <Camera size={16} />
              <span>3ヶ月明細スクショを診断する</span>
            </button>
            <button
              className="btn btn-secondary btn-sm"
              onClick={onOpenAddModal}
            >
              <Plus size={14} />
              <span>手動で登録する</span>
            </button>
          </div>
        </div>
      ) : (
        /* Regular Hero Savings Achievement Card */
        <div className="hero-savings-card animate-fade-in">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div className="savings-badge-icon">
              <Trophy size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.15rem' }}>
                <span style={{ fontSize: '0.785rem', fontWeight: 600, color: 'var(--color-success)', letterSpacing: '0.02em' }}>
                  年間削減実績
                </span>
                <span style={{ fontSize: '0.7rem', padding: '0.05rem 0.4rem', borderRadius: 'var(--radius-full)', background: 'rgba(48, 209, 88, 0.15)', color: 'var(--color-success)', fontWeight: 600 }}>
                  {canceledCount} 件解約
                </span>
              </div>
              <div className="savings-value">
                {formatCurrency(totalAnnualSavings)}
                <span style={{ fontSize: '0.95rem', color: 'var(--text-muted)', fontWeight: 500, marginLeft: '0.35rem' }}>/ 年</span>
              </div>
              <p style={{ fontSize: '0.785rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
                不要なサブスクを解約して浮かせた累計固定費
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              className="btn btn-secondary btn-sm"
              onClick={onOpenScannerModal}
              title="メインカードの過去3ヶ月明細から自動検出"
            >
              <Camera size={13} style={{ color: 'var(--accent-primary)' }} />
              <span>明細スクショスキャン</span>
            </button>
            <button
              className="btn btn-primary btn-sm"
              onClick={onOpenAddModal}
            >
              <Plus size={14} />
              <span>手動追加</span>
            </button>
          </div>
        </div>
      )}

      {/* KPI Overview Grid */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <span className="kpi-label">
            <CreditCard size={14} style={{ color: 'var(--text-muted)' }} />
            今月の固定費（月額換算）
          </span>
          <span className="kpi-amount">{formatCurrency(totals.monthlyTotal)}</span>
          <span className="kpi-subtext">アクティブ {totals.activeCount} 件</span>
        </div>

        <div className="kpi-card">
          <span className="kpi-label">
            <TrendingDown size={14} style={{ color: 'var(--text-muted)' }} />
            年間固定費総額
          </span>
          <span className="kpi-amount">{formatCurrency(totals.yearlyTotal)}</span>
          <span className="kpi-subtext">1年間の支払概算</span>
        </div>

        <div className="kpi-card" style={{ borderColor: totals.zombieCount > 0 ? 'rgba(255, 69, 58, 0.3)' : undefined }}>
          <span className="kpi-label" style={{ color: totals.zombieCount > 0 ? 'var(--color-danger)' : undefined }}>
            <AlertCircle size={14} style={{ color: totals.zombieCount > 0 ? 'var(--color-danger)' : 'var(--text-subtle)' }} />
            未利用サブスク
          </span>
          <span className="kpi-amount" style={{ color: totals.zombieCount > 0 ? 'var(--color-danger)' : 'var(--text-main)' }}>
            {totals.zombieCount} <span style={{ fontSize: '0.85rem' }}>件</span>
          </span>
          <span className="kpi-subtext">
            {totals.zombieCount > 0 ? '今月の利用回数が0〜1回' : 'すべて活用されています'}
          </span>
        </div>
      </div>

      {/* Inactive / Zombie Subscriptions Alert Section */}
      {zombieSubscriptions.length > 0 && (
        <div
          className="card"
          style={{
            borderColor: 'rgba(255, 69, 58, 0.25)',
            background: '#1a1314',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.85rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <AlertCircle size={16} style={{ color: 'var(--color-danger)' }} />
              <div>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#ffffff' }}>
                  未利用のサブスクがあります（{zombieSubscriptions.length}件）
                </h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  今月の利用が少なく、固定費が無駄になっている可能性があります。
                </span>
              </div>
            </div>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => onNavigateToTab('zombies')}
            >
              一覧を見る
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '0.5rem' }}>
            {zombieSubscriptions.map((sub) => {
              const cat = CATEGORIES[sub.categoryId] || CATEGORIES.other;
              return (
                <div
                  key={sub.id}
                  onClick={() => onSelectSubscription(sub)}
                  style={{
                    background: '#232326',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '0.65rem 0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <div
                      className="sub-icon"
                      style={{
                        backgroundColor: '#1c1c1e',
                        color: sub.color || cat.color,
                        width: '30px',
                        height: '30px'
                      }}
                    >
                      <CategoryIcon name={sub.icon || cat.icon} size={15} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{sub.name}</div>
                      <div style={{ fontSize: '0.725rem', color: 'var(--color-danger)' }}>
                        月 {formatCurrency(sub.monthlyEquivalent)}（利用0回）
                      </div>
                    </div>
                  </div>

                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    ➔
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2 Column Layout: Upcoming Renewals & Category Breakdown */}
      {activeSubs.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
          {/* Upcoming Renewals Timeline */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <Calendar size={15} style={{ color: 'var(--text-muted)' }} />
                <h3 style={{ fontSize: '0.925rem', fontWeight: 600 }}>直近の更新予定（7日以内）</h3>
              </div>
              <span style={{ fontSize: '0.725rem', color: 'var(--text-subtle)' }}>
                {upcomingSubscriptions.length}件
              </span>
            </div>

            {upcomingSubscriptions.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {upcomingSubscriptions.map(({ sub, days }) => {
                  const daysInfo = formatDaysRemaining(days);
                  const cat = CATEGORIES[sub.categoryId] || CATEGORIES.other;
                  return (
                    <div
                      key={sub.id}
                      onClick={() => onSelectSubscription(sub)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.55rem 0.75rem',
                        borderRadius: 'var(--radius-sm)',
                        background: 'var(--bg-card-secondary)',
                        border: '1px solid var(--border-subtle)',
                        cursor: 'pointer'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                        <CategoryIcon name={sub.icon || cat.icon} size={15} color={sub.color || cat.color} />
                        <span style={{ fontWeight: 500, fontSize: '0.825rem' }}>{sub.name}</span>
                        {sub.isTrial && (
                          <span style={{ fontSize: '0.625rem', background: 'rgba(10, 132, 255, 0.15)', color: 'var(--color-info)', padding: '0.05rem 0.3rem', borderRadius: '3px' }}>
                            無料体験
                          </span>
                        )}
                      </div>

                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          color: daysInfo.isUrgent ? 'var(--color-danger)' : 'var(--text-muted)'
                        }}
                      >
                        {daysInfo.text}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '1.25rem', color: 'var(--text-subtle)', fontSize: '0.8rem' }}>
                直近7日以内に更新予定のサブスクはありません
              </div>
            )}
          </div>

          {/* Category Breakdown */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
              <h3 style={{ fontSize: '0.925rem', fontWeight: 600 }}>カテゴリ別支出</h3>
              <span style={{ fontSize: '0.725rem', color: 'var(--text-subtle)' }}>月額換算</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {sortedCategories.slice(0, 5).map(([catId, amount]) => {
                const cat = CATEGORIES[catId as keyof typeof CATEGORIES] || CATEGORIES.other;
                const percentage = totals.monthlyTotal > 0 ? Math.round((amount / totals.monthlyTotal) * 100) : 0;
                return (
                  <div key={catId}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.785rem', marginBottom: '0.2rem' }}>
                      <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <CategoryIcon name={cat.icon} size={13} color={cat.color} />
                        {cat.name}
                      </span>
                      <span style={{ fontWeight: 600 }}>
                        {formatCurrency(amount)} ({percentage}%)
                      </span>
                    </div>
                    <div style={{ width: '100%', height: '4px', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: '2px', overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${percentage}%`,
                          height: '100%',
                          backgroundColor: cat.color,
                          borderRadius: '2px'
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
