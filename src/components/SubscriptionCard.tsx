import React from 'react';
import { Plus, Minus, ExternalLink } from 'lucide-react';
import { Subscription } from '../types';
import { evaluateCostEfficiency, getDaysUntilDate, getCurrentMonthKey } from '../utils/calculation';
import { formatCurrency, formatDaysRemaining } from '../utils/formatters';
import { CATEGORIES } from '../constants/categories';
import { CategoryIcon } from './CategoryIcon';

interface SubscriptionCardProps {
  subscription: Subscription;
  onIncrementUsage: (id: string, delta: number) => void;
  onSelect: (sub: Subscription) => void;
}

export const SubscriptionCard: React.FC<SubscriptionCardProps> = ({
  subscription,
  onIncrementUsage,
  onSelect
}) => {
  const currentMonth = getCurrentMonthKey();
  const evaluation = evaluateCostEfficiency(subscription, currentMonth);
  const category = CATEGORIES[subscription.categoryId] || CATEGORIES.other;
  
  const daysUntilNext = getDaysUntilDate(subscription.nextBillingDate);
  const daysInfo = formatDaysRemaining(daysUntilNext);

  // コスパバッジの設定
  const getBadgeClass = () => {
    switch (evaluation.level) {
      case 'excellent':
        return 'cost-badge cost-badge-excellent';
      case 'good':
        return 'cost-badge cost-badge-good';
      case 'warning':
        return 'cost-badge cost-badge-warning';
      case 'zombie':
        return 'cost-badge cost-badge-zombie';
    }
  };

  const getBadgeLabel = () => {
    switch (evaluation.level) {
      case 'excellent':
        return '高コスパ';
      case 'good':
        return '適正利用';
      case 'warning':
        return '割高';
      case 'zombie':
        return '未利用';
    }
  };

  return (
    <div
      className={`sub-card animate-fade-in ${evaluation.isZombie ? 'card-zombie' : ''}`}
      onClick={() => onSelect(subscription)}
      style={{ cursor: 'pointer' }}
    >
      {/* Top row: Icon, Name, Category, Price */}
      <div className="sub-card-header">
        <div className="sub-card-brand">
          <div
            className="sub-icon"
            style={{
              backgroundColor: '#232326',
              color: subscription.color || category.color,
              border: '1px solid rgba(255, 255, 255, 0.08)'
            }}
          >
            <CategoryIcon name={subscription.icon || category.icon} size={18} />
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
              <h3 className="sub-name">{subscription.name}</h3>
              {subscription.isTrial && (
                <span
                  style={{
                    fontSize: '0.65rem',
                    fontWeight: 600,
                    padding: '0.05rem 0.35rem',
                    borderRadius: '4px',
                    backgroundColor: 'rgba(10, 132, 255, 0.15)',
                    color: 'var(--color-info)',
                    border: '1px solid rgba(10, 132, 255, 0.3)'
                  }}
                >
                  無料体験
                </span>
              )}
            </div>
            <div className="sub-category-tag">
              <span>{category.name}</span>
              <span>•</span>
              <span style={{ color: daysInfo.isUrgent ? 'var(--color-danger)' : 'var(--text-subtle)' }}>
                {daysInfo.text}
              </span>
            </div>
          </div>
        </div>

        <div className="sub-price-block">
          <div className="sub-price-main">
            {formatCurrency(subscription.amount)}
          </div>
          <div className="sub-price-sub">
            {subscription.billingCycle === 'yearly' ? '年額' : '月額'}
            {subscription.billingCycle === 'yearly' && (
              <span> ({formatCurrency(subscription.monthlyEquivalent)}/月)</span>
            )}
          </div>
        </div>
      </div>

      {/* Cost Efficiency & Status Row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.4rem',
          padding: '0.35rem 0',
          borderTop: '1px solid var(--border-subtle)',
          borderBottom: '1px solid var(--border-subtle)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
          <span className={getBadgeClass()}>
            {getBadgeLabel()}
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            1回あたり <strong style={{ color: 'var(--text-main)', fontFamily: 'var(--font-mono)' }}>{formatCurrency(evaluation.costPerUse)}</strong>
          </span>
        </div>

        {subscription.cancelUrl && (
          <a
            href={subscription.cancelUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '0.725rem', padding: '0.2rem 0.45rem', borderRadius: '4px' }}
            onClick={(e) => e.stopPropagation()}
            title="公式解約ページを開く"
          >
            <span>解約ページ</span>
            <ExternalLink size={11} />
          </a>
        )}
      </div>

      {/* Usage Counter Row */}
      <div className="card-usage-row" onClick={(e) => e.stopPropagation()}>
        <div className="usage-counter-label">
          <span style={{ color: 'var(--text-subtle)' }}>今月の利用</span>
          <span className="usage-count-number">{evaluation.currentMonthUsage}</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>回</span>
          {evaluation.isZombie && (
            <span style={{ fontSize: '0.7rem', color: 'var(--color-danger)', fontWeight: 600 }}>
              (未利用)
            </span>
          )}
        </div>

        <div className="usage-btn-group">
          <button
            className="btn-icon btn-sm"
            onClick={() => onIncrementUsage(subscription.id, -1)}
            disabled={evaluation.currentMonthUsage <= 0}
            title="回数を減らす"
            aria-label="回数を1減らす"
            style={{ opacity: evaluation.currentMonthUsage <= 0 ? 0.3 : 1, padding: '0.25rem 0.4rem' }}
          >
            <Minus size={13} />
          </button>
          <button
            className="btn-count-plus"
            onClick={() => onIncrementUsage(subscription.id, 1)}
            title="利用を記録"
          >
            <Plus size={13} />
            <span>使った</span>
          </button>
        </div>
      </div>
    </div>
  );
};
