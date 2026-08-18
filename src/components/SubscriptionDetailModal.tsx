import React, { useState } from 'react';
import { 
  X, 
  ExternalLink, 
  Trash2, 
  CheckCircle2, 
  Scissors, 
  Calendar, 
  CreditCard, 
  AlertCircle,
  RotateCcw,
  ShieldAlert,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Subscription } from '../types';
import { CATEGORIES } from '../constants/categories';
import { PRESET_SERVICES } from '../constants/presets';
import { CARRIER_CANCEL_GUIDES } from '../constants/carrierLinks';
import { evaluateCostEfficiency, getCurrentMonthKey, getDaysUntilDate } from '../utils/calculation';
import { formatCurrency, formatDate, formatDaysRemaining } from '../utils/formatters';
import { CategoryIcon } from './CategoryIcon';

interface SubscriptionDetailModalProps {
  subscription: Subscription;
  onClose: () => void;
  onCancelSub: (id: string) => void;
  onReactivateSub: (id: string) => void;
  onDeleteSub: (id: string) => void;
  onUpdateSub: (id: string, updates: Partial<Subscription>) => void;
}

export const SubscriptionDetailModal: React.FC<SubscriptionDetailModalProps> = ({
  subscription,
  onClose,
  onCancelSub,
  onReactivateSub,
  onDeleteSub
}) => {
  const currentMonth = getCurrentMonthKey();
  const evaluation = evaluateCostEfficiency(subscription, currentMonth);
  const category = CATEGORIES[subscription.categoryId] || CATEGORIES.other;
  const preset = PRESET_SERVICES.find((p) => p.name.toLowerCase() === subscription.name.toLowerCase() || p.id === subscription.id);

  const daysUntilNext = getDaysUntilDate(subscription.nextBillingDate);
  const daysInfo = formatDaysRemaining(daysUntilNext);

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [showCarrierSection, setShowCarrierSection] = useState(false);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content animate-slide-up" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div
              className="sub-icon"
              style={{
                backgroundColor: '#232326',
                color: subscription.color || category.color,
                border: '1px solid rgba(255, 255, 255, 0.08)',
                width: '34px',
                height: '34px'
              }}
            >
              <CategoryIcon name={subscription.icon || category.icon} size={17} />
            </div>
            <div>
              <h2 className="modal-title">{subscription.name}</h2>
              <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>{category.name}</span>
            </div>
          </div>

          <button className="btn-icon" onClick={onClose} aria-label="閉じる">
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body">
          {/* Status Alert if Canceled or Zombie */}
          {subscription.status === 'canceled' ? (
            <div
              style={{
                backgroundColor: 'var(--color-success-bg)',
                border: '1px solid rgba(48, 209, 88, 0.25)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.75rem 0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                color: 'var(--color-success)'
              }}
            >
              <CheckCircle2 size={20} />
              <div>
                <strong style={{ fontSize: '0.875rem', display: 'block' }}>解約済み（固定費断捨離成功）</strong>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  年間 {formatCurrency(subscription.yearlyEquivalent)} の削減実績に計上されています。
                </span>
              </div>
            </div>
          ) : evaluation.isZombie ? (
            <div
              style={{
                backgroundColor: 'var(--color-danger-bg)',
                border: '1px solid var(--color-danger-subtle)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.75rem 0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                color: 'var(--color-danger)'
              }}
            >
              <AlertCircle size={20} />
              <div>
                <strong style={{ fontSize: '0.875rem', display: 'block' }}>未利用アラート（ゾンビ課金）</strong>
                <span style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.8)' }}>
                  今月の利用回数が少なく、1回あたり {formatCurrency(evaluation.costPerUse)} と割高です。
                </span>
              </div>
            </div>
          ) : null}

          {/* Pricing & Cost Efficiency Overview Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '0.5rem' }}>
            <div className="kpi-card" style={{ padding: '0.75rem' }}>
              <span className="kpi-label">請求金額</span>
              <span className="kpi-amount" style={{ fontSize: '1.15rem' }}>
                {formatCurrency(subscription.amount)}
              </span>
              <span className="kpi-subtext">
                {subscription.billingCycle === 'yearly' ? '年額払い' : '月額払い'}
              </span>
            </div>

            <div className="kpi-card" style={{ padding: '0.75rem' }}>
              <span className="kpi-label">今月の利用</span>
              <span className="kpi-amount" style={{ fontSize: '1.15rem' }}>
                {evaluation.currentMonthUsage} <span style={{ fontSize: '0.75rem' }}>回</span>
              </span>
              <span className="kpi-subtext">実績</span>
            </div>

            <div className="kpi-card" style={{ padding: '0.75rem' }}>
              <span className="kpi-label">1回あたり</span>
              <span className="kpi-amount" style={{ fontSize: '1.15rem', color: evaluation.isZombie ? 'var(--color-danger)' : 'var(--text-main)' }}>
                {formatCurrency(evaluation.costPerUse)}
              </span>
              <span className="kpi-subtext">月額 ÷ 回数</span>
            </div>

            <div className="kpi-card" style={{ padding: '0.75rem' }}>
              <span className="kpi-label">年間換算</span>
              <span className="kpi-amount" style={{ fontSize: '1.15rem' }}>
                {formatCurrency(subscription.yearlyEquivalent)}
              </span>
              <span className="kpi-subtext">年額</span>
            </div>
          </div>

          {/* Billing & Date Details */}
          <div
            style={{
              background: 'var(--bg-card-secondary)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              padding: '0.85rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.825rem' }}>
              <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Calendar size={14} /> 次回更新日
              </span>
              <span style={{ fontWeight: 500 }}>
                {formatDate(subscription.nextBillingDate)} ({daysInfo.text})
              </span>
            </div>

            {subscription.isTrial && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.825rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>無料体験終了日</span>
                <span style={{ fontWeight: 600, color: 'var(--color-warning)' }}>
                  {formatDate(subscription.trialEndDate || subscription.nextBillingDate)}
                </span>
              </div>
            )}

            {subscription.paymentMethod && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.825rem' }}>
                <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <CreditCard size={14} /> 支払方法
                </span>
                <span>{subscription.paymentMethod}</span>
              </div>
            )}

            {subscription.notes && (
              <div style={{ marginTop: '0.2rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: '0.725rem', color: 'var(--text-subtle)', display: 'block', marginBottom: '0.15rem' }}>
                  メモ
                </span>
                <p style={{ fontSize: '0.825rem', color: 'var(--text-main)' }}>{subscription.notes}</p>
              </div>
            )}
          </div>

          {/* Cancellation Direct Support & Dark Pattern Defense */}
          <div
            style={{
              background: '#1d1516',
              border: '1px solid rgba(255, 69, 58, 0.25)',
              borderRadius: 'var(--radius-sm)',
              padding: '0.85rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.65rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, fontSize: '0.85rem', color: '#ff6961' }}>
              <Scissors size={15} />
              <span>ダークパターン撃破！解約直通サポート</span>
            </div>

            {preset?.tipsForCanceling && (
              <p style={{ fontSize: '0.785rem', color: '#ffffff', lineHeight: 1.45, background: 'rgba(0,0,0,0.3)', padding: '0.5rem', borderRadius: '4px' }}>
                💡 <strong>解約の注意点:</strong> {preset.tipsForCanceling}
              </p>
            )}

            {subscription.cancelUrl && (
              <a
                href={subscription.cancelUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-cancel-direct btn-sm"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                <ExternalLink size={14} />
                <span>公式解約手続きページを開く</span>
              </a>
            )}

            {/* Carrier / Bundled Subscriptions Escape Hatch (回線・キャリア抱き合わせの罠回避) */}
            <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '0.5rem', marginTop: '0.2rem' }}>
              <button
                type="button"
                onClick={() => setShowCarrierSection(!showCarrierSection)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '0.75rem',
                  color: 'var(--color-warning)',
                  fontWeight: 600
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <ShieldAlert size={14} />
                  ※スマホ回線や光回線とセットで契約させられた場合（docomo/au/SoftBank等）
                </span>
                {showCarrierSection ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>

              {showCarrierSection && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.6rem' }}>
                  <p style={{ fontSize: '0.725rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                    回線契約時にセット加入させられた場合、公式サイトから解約できず、<strong>各キャリアのマイページから解約する必要があります</strong>：
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    {CARRIER_CANCEL_GUIDES.map((guide) => (
                      <div
                        key={guide.badge}
                        style={{
                          background: '#161618',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: '4px',
                          padding: '0.5rem 0.65rem',
                          fontSize: '0.725rem'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                          <strong style={{ color: '#ffffff' }}>{guide.carrierName}</strong>
                          <a
                            href={guide.cancelUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: 'var(--color-info)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.2rem' }}
                          >
                            <span>マイページへ</span>
                            <ExternalLink size={10} />
                          </a>
                        </div>
                        <p style={{ color: 'var(--text-subtle)', lineHeight: 1.35 }}>{guide.howToCancel}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer: Action Buttons */}
        <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
          {confirmDelete ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <button
                className="btn btn-danger btn-sm"
                onClick={() => {
                  onDeleteSub(subscription.id);
                  onClose();
                }}
              >
                削除する
              </button>
              <button className="btn btn-secondary btn-sm" onClick={() => setConfirmDelete(false)}>
                中止
              </button>
            </div>
          ) : (
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setConfirmDelete(true)}
              style={{ color: 'var(--color-danger)' }}
              title="サブスクを完全削除"
            >
              <Trash2 size={14} />
              <span>削除</span>
            </button>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {subscription.status === 'active' ? (
              <button
                className="btn btn-primary btn-sm"
                onClick={() => {
                  onCancelSub(subscription.id);
                  onClose();
                }}
              >
                <Scissors size={14} />
                <span>解約完了（年間 {formatCurrency(subscription.yearlyEquivalent)} 節約）</span>
              </button>
            ) : (
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  onReactivateSub(subscription.id);
                  onClose();
                }}
              >
                <RotateCcw size={14} />
                <span>再開する</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
