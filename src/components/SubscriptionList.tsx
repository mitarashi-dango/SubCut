import React, { useState, useMemo } from 'react';
import { Search, ArrowUpDown, Plus } from 'lucide-react';
import { Subscription } from '../types';
import { CATEGORY_LIST } from '../constants/categories';
import { evaluateCostEfficiency, getCurrentMonthKey, getDaysUntilDate } from '../utils/calculation';
import { SubscriptionCard } from './SubscriptionCard';

interface SubscriptionListProps {
  subscriptions: Subscription[];
  onIncrementUsage: (id: string, delta: number) => void;
  onSelectSubscription: (sub: Subscription) => void;
  onOpenAddModal: () => void;
  filterMode?: 'all' | 'zombies';
}

type SortOption = 'price_desc' | 'price_asc' | 'cost_per_use_desc' | 'billing_date_asc' | 'name_asc';

export const SubscriptionList: React.FC<SubscriptionListProps> = ({
  subscriptions,
  onIncrementUsage,
  onSelectSubscription,
  onOpenAddModal,
  filterMode = 'all'
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'zombie' | 'trial' | 'good'>(filterMode === 'zombies' ? 'zombie' : 'all');
  const [sortBy, setSortBy] = useState<SortOption>('price_desc');

  const currentMonth = getCurrentMonthKey();

  // フィルタとソート処理
  const filteredSubscriptions = useMemo(() => {
    let list = subscriptions.filter((s) => s.status === 'active');

    // 検索
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          (s.notes && s.notes.toLowerCase().includes(q)) ||
          (s.paymentMethod && s.paymentMethod.toLowerCase().includes(q))
      );
    }

    // カテゴリ絞り込み
    if (selectedCategory !== 'all') {
      list = list.filter((s) => s.categoryId === selectedCategory);
    }

    // ステータス絞り込み
    if (selectedFilter === 'zombie') {
      list = list.filter((s) => evaluateCostEfficiency(s, currentMonth).isZombie);
    } else if (selectedFilter === 'trial') {
      list = list.filter((s) => s.isTrial);
    } else if (selectedFilter === 'good') {
      list = list.filter((s) => {
        const evalRes = evaluateCostEfficiency(s, currentMonth);
        return evalRes.level === 'excellent' || evalRes.level === 'good';
      });
    }

    // ソート
    return list.sort((a, b) => {
      switch (sortBy) {
        case 'price_desc':
          return b.monthlyEquivalent - a.monthlyEquivalent;
        case 'price_asc':
          return a.monthlyEquivalent - b.monthlyEquivalent;
        case 'cost_per_use_desc': {
          const evalA = evaluateCostEfficiency(a, currentMonth);
          const evalB = evaluateCostEfficiency(b, currentMonth);
          return evalB.costPerUse - evalA.costPerUse;
        }
        case 'billing_date_asc':
          return getDaysUntilDate(a.nextBillingDate) - getDaysUntilDate(b.nextBillingDate);
        case 'name_asc':
          return a.name.localeCompare(b.name, 'ja');
        default:
          return 0;
      }
    });
  }, [subscriptions, searchQuery, selectedCategory, selectedFilter, sortBy, currentMonth]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Search & Filter Header Bar */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.65rem',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-card)',
          borderRadius: 'var(--radius-md)',
          padding: '0.85rem'
        }}
      >
        {/* Search row & Sort select */}
        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '180px' }}>
            <Search
              size={15}
              style={{
                position: 'absolute',
                left: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-subtle)'
              }}
            />
            <input
              type="text"
              className="form-input"
              placeholder="サブスクを検索..."
              style={{ paddingLeft: '2.2rem', width: '100%', padding: '0.45rem 0.65rem 0.45rem 2.2rem' }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <ArrowUpDown size={14} style={{ color: 'var(--text-subtle)' }} />
            <select
              className="form-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              style={{ minWidth: '130px', padding: '0.45rem 0.65rem', fontSize: '0.8rem' }}
            >
              <option value="price_desc">金額が高い順</option>
              <option value="price_asc">金額が安い順</option>
              <option value="cost_per_use_desc">1回あたり割高順</option>
              <option value="billing_date_asc">更新日が近い順</option>
              <option value="name_asc">名前順</option>
            </select>
          </div>
        </div>

        {/* Filter Chips */}
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <button
            className={`btn btn-sm ${selectedFilter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setSelectedFilter('all')}
          >
            すべて ({subscriptions.filter((s) => s.status === 'active').length})
          </button>
          <button
            className={`btn btn-sm ${selectedFilter === 'zombie' ? 'btn-danger' : 'btn-secondary'}`}
            onClick={() => setSelectedFilter('zombie')}
          >
            未利用 ({subscriptions.filter((s) => s.status === 'active' && evaluateCostEfficiency(s, currentMonth).isZombie).length})
          </button>
          <button
            className={`btn btn-sm ${selectedFilter === 'trial' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setSelectedFilter('trial')}
          >
            無料体験 ({subscriptions.filter((s) => s.status === 'active' && s.isTrial).length})
          </button>
          <button
            className={`btn btn-sm ${selectedFilter === 'good' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setSelectedFilter('good')}
          >
            適正利用
          </button>

          {/* Category Dropdown */}
          <select
            className="form-select"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{ marginLeft: 'auto', padding: '0.3rem 0.55rem', fontSize: '0.785rem' }}
          >
            <option value="all">すべてのカテゴリ</option>
            {CATEGORY_LIST.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Subscription Cards Grid */}
      {filteredSubscriptions.length > 0 ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
            gap: '0.75rem'
          }}
        >
          {filteredSubscriptions.map((sub) => (
            <SubscriptionCard
              key={sub.id}
              subscription={sub}
              onIncrementUsage={onIncrementUsage}
              onSelect={onSelectSubscription}
            />
          ))}
        </div>
      ) : (
        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px dashed var(--border-card)',
            borderRadius: 'var(--radius-md)',
            padding: '2.5rem 1rem',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.85rem'
          }}
        >
          <div>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.2rem' }}>
              {subscriptions.length === 0 ? '登録されているサブスクがありません' : '該当するサブスクがありません'}
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {subscriptions.length === 0
                ? '「サブスクを追加」または右上の「明細スキャン」から登録を始めましょう。'
                : '条件を変更するか、新しいサブスクを追加してください。'}
            </p>
          </div>
          <button className="btn btn-primary btn-sm" onClick={onOpenAddModal}>
            <Plus size={14} />
            <span>サブスクを追加</span>
          </button>
        </div>
      )}
    </div>
  );
};
