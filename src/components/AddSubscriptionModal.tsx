import React, { useState } from 'react';
import { X, Search, Sparkles, Plus } from 'lucide-react';
import { BillingCycle, CategoryId, Subscription } from '../types';
import { CATEGORY_LIST } from '../constants/categories';
import { PRESET_SERVICES } from '../constants/presets';
import { formatCurrency } from '../utils/formatters';
import { CategoryIcon } from './CategoryIcon';

interface AddSubscriptionModalProps {
  onClose: () => void;
  onAdd: (sub: Omit<Subscription, 'id' | 'createdAt' | 'usageLogs' | 'monthlyEquivalent' | 'yearlyEquivalent'>) => void;
}

export const AddSubscriptionModal: React.FC<AddSubscriptionModalProps> = ({ onClose, onAdd }) => {
  const [activeTab, setActiveTab] = useState<'preset' | 'custom'>('preset');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // フォームステート
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState<CategoryId>('video');
  const [amount, setAmount] = useState<number>(1000);
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');
  const [customDays, setCustomDays] = useState<number>(30);
  const [nextBillingDate, setNextBillingDate] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 1);
    return d.toISOString().split('T')[0];
  });
  const [isTrial, setIsTrial] = useState(false);
  const [trialEndDate, setTrialEndDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().split('T')[0];
  });
  const [cancelUrl, setCancelUrl] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('クレジットカード');
  const [notes, setNotes] = useState('');
  const [brandColor, setBrandColor] = useState('#3b82f6');
  const [brandIcon, setBrandIcon] = useState('Tv');

  // プリセット選択時の自動設定
  const handleSelectPreset = (preset: PresetService) => {
    setName(preset.name);
    setCategoryId(preset.categoryId);
    setAmount(preset.defaultAmount);
    setBillingCycle(preset.defaultCycle);
    setCancelUrl(preset.cancelUrl);
    setBrandColor(preset.color);
    setBrandIcon(preset.icon);
    setActiveTab('custom'); // 詳細確認へ遷移
  };

  // フィルタリングされたプリセット
  const filteredPresets = PRESET_SERVICES.filter((preset) => {
    const matchesSearch = preset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      preset.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'all' || preset.categoryId === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAdd({
      name: name.trim(),
      categoryId,
      amount: Number(amount) || 0,
      billingCycle,
      customDays: billingCycle === 'custom_days' ? Number(customDays) : undefined,
      nextBillingDate,
      isTrial,
      trialEndDate: isTrial ? trialEndDate : undefined,
      cancelUrl: cancelUrl.trim() || undefined,
      status: 'active',
      paymentMethod: paymentMethod.trim() || undefined,
      notes: notes.trim() || undefined,
      color: brandColor,
      icon: brandIcon
    });

    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content animate-slide-up" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <h2 className="modal-title">サブスクの追加</h2>
          <button className="btn-icon" onClick={onClose} aria-label="閉じる">
            <X size={20} />
          </button>
        </div>

        {/* Tab Switcher: Preset vs Custom */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-card-secondary)' }}>
          <button
            style={{
              flex: 1,
              padding: '0.85rem',
              fontWeight: 700,
              fontSize: '0.9rem',
              color: activeTab === 'preset' ? 'var(--accent-primary)' : 'var(--text-muted)',
              borderBottom: activeTab === 'preset' ? '2px solid var(--accent-primary)' : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem'
            }}
            onClick={() => setActiveTab('preset')}
          >
            <Sparkles size={16} />
            人気プリセットから選ぶ
          </button>
          <button
            style={{
              flex: 1,
              padding: '0.85rem',
              fontWeight: 700,
              fontSize: '0.9rem',
              color: activeTab === 'custom' ? 'var(--accent-primary)' : 'var(--text-muted)',
              borderBottom: activeTab === 'custom' ? '2px solid var(--accent-primary)' : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem'
            }}
            onClick={() => setActiveTab('custom')}
          >
            <Plus size={16} />
            手動で登録・編集
          </button>
        </div>

        {/* Modal Body */}
        {activeTab === 'preset' ? (
          <div className="modal-body" style={{ gap: '1rem' }}>
            {/* Search Bar & Category Filter */}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', flex: 1, minWidth: '160px' }}>
                <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }} />
                <input
                  type="text"
                  placeholder="サービス名を検索 (Netflix, ChatGPT...)"
                  className="form-input"
                  style={{ paddingLeft: '2.2rem', width: '100%' }}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <select
                className="form-select"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                style={{ width: 'auto' }}
              >
                <option value="all">すべてのカテゴリ</option>
                {CATEGORY_LIST.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Preset Grid */}
            <div className="preset-grid">
              {filteredPresets.map((preset) => (
                <button
                  key={preset.id}
                  className="preset-chip"
                  onClick={() => handleSelectPreset(preset)}
                >
                  <div
                    className="sub-icon"
                    style={{
                      backgroundColor: `${preset.color}25`,
                      color: preset.color,
                      border: `1px solid ${preset.color}40`,
                      width: '36px',
                      height: '36px'
                    }}
                  >
                    <CategoryIcon name={preset.icon} size={18} />
                  </div>
                  <span className="preset-name">{preset.name}</span>
                  <span className="preset-price">{formatCurrency(preset.defaultAmount)}/月</span>
                </button>
              ))}
            </div>

            <div style={{ textAlign: 'center', paddingTop: '0.5rem' }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setActiveTab('custom')}
              >
                一覧にないサービスを手動登録する ➔
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="modal-body" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
              {/* Service Name & Category */}
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">サービス名 *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder="例: Netflix, ジム会費"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">カテゴリ</label>
                  <select
                    className="form-select"
                    value={categoryId}
                    onChange={(e) => {
                      const newCat = e.target.value as CategoryId;
                      setCategoryId(newCat);
                      setBrandIcon(CATEGORIES[newCat].icon);
                    }}
                  >
                    {CATEGORY_LIST.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Amount & Billing Cycle */}
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">請求金額（円） *</label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    required
                    className="form-input"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">請求サイクル</label>
                  <select
                    className="form-select"
                    value={billingCycle}
                    onChange={(e) => setBillingCycle(e.target.value as BillingCycle)}
                  >
                    <option value="monthly">月額払い</option>
                    <option value="yearly">年額払い</option>
                    <option value="custom_days">カスタム周期（日数）</option>
                  </select>
                </div>
              </div>

              {billingCycle === 'custom_days' && (
                <div className="form-group">
                  <label className="form-label">周期（日数）</label>
                  <input
                    type="number"
                    min="1"
                    className="form-input"
                    value={customDays}
                    onChange={(e) => setCustomDays(Number(e.target.value))}
                  />
                </div>
              )}

              {/* Next Billing Date & Trial Option */}
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">次回更新日</label>
                  <input
                    type="date"
                    required
                    className="form-input"
                    value={nextBillingDate}
                    onChange={(e) => setNextBillingDate(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">支払方法（任意）</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="例: クレジットカード, PayPay"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                </div>
              </div>

              {/* Trial Switch */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: 'var(--bg-card-secondary)',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                <div>
                  <span style={{ fontWeight: 600, fontSize: '0.875rem', display: 'block' }}>無料体験・トライアル中</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>
                    期限前の解約忘れ防止アラートが有効になります
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={isTrial}
                  onChange={(e) => setIsTrial(e.target.checked)}
                  style={{ width: '18px', height: '18px', accentColor: 'var(--accent-primary)' }}
                />
              </div>

              {isTrial && (
                <div className="form-group">
                  <label className="form-label">無料体験終了日</label>
                  <input
                    type="date"
                    required
                    className="form-input"
                    value={trialEndDate}
                    onChange={(e) => setTrialEndDate(e.target.value)}
                  />
                </div>
              )}

              {/* Cancellation Direct URL (Dark Pattern Crusher) */}
              <div className="form-group">
                <label className="form-label">解約手続き直通URL（ダークパターン撃破）</label>
                <input
                  type="url"
                  className="form-input"
                  placeholder="https://..."
                  value={cancelUrl}
                  onChange={(e) => setCancelUrl(e.target.value)}
                />
                <span style={{ fontSize: '0.725rem', color: 'var(--text-subtle)' }}>
                  設定しておくと、解約したくなった時に1クリックで公式解約ページが開きます。
                </span>
              </div>

              {/* Notes */}
              <div className="form-group">
                <label className="form-label">メモ・利用目的（任意）</label>
                <textarea
                  rows={2}
                  className="form-textarea"
                  placeholder="例: ファミリープランで共有中、夏の間だけ利用など"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                キャンセル
              </button>
              <button type="submit" className="btn btn-primary">
                <Plus size={16} />
                <span>サブスクを登録する</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
