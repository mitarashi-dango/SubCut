import { useState } from 'react';
import { useSubscriptions } from './hooks/useSubscriptions';
import { Header, ActiveTab } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { SubscriptionList } from './components/SubscriptionList';
import { SavingsView } from './components/SavingsView';
import { AddSubscriptionModal } from './components/AddSubscriptionModal';
import { SubscriptionDetailModal } from './components/SubscriptionDetailModal';
import { DataManagementModal } from './components/DataManagementModal';
import { ScreenshotScannerModal } from './components/ScreenshotScannerModal';
import { Subscription } from './types';
import { evaluateCostEfficiency, getCurrentMonthKey } from './utils/calculation';

export function App() {
  const {
    subscriptions,
    badges,
    isLoaded,
    addSubscription,
    updateSubscription,
    incrementUsage,
    cancelSubscription,
    reactivateSubscription,
    deleteSubscription,
    resetToSampleData,
    clearAll,
    importBackupData
  } = useSubscriptions();

  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isScannerModalOpen, setIsScannerModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);

  const currentMonth = getCurrentMonthKey();
  const zombieCount = subscriptions.filter(
    (s) => s.status === 'active' && evaluateCostEfficiency(s, currentMonth).isZombie
  ).length;

  // スキャン結果の一括追加ハンドラー
  const handleBatchImportScanned = (newSubs: Subscription[]) => {
    // 既存サブスクと重複チェックしつつマージ
    const existingNames = new Set(subscriptions.map((s) => s.name.toLowerCase()));
    const nonDuplicates = newSubs.filter((s) => !existingNames.has(s.name.toLowerCase()));
    
    // 重複分も含めてインポートするか確認（新規のみ追加）
    const merged = [...nonDuplicates, ...subscriptions];
    importBackupData(merged);
  };

  if (!isLoaded) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          color: 'var(--text-muted)',
          fontSize: '0.875rem'
        }}
      >
        SubCut を読み込み中...
      </div>
    );
  }

  const activeSelectedSub = selectedSubscription
    ? subscriptions.find((s) => s.id === selectedSubscription.id) || null
    : null;

  return (
    <div className="app-root">
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onOpenScannerModal={() => setIsScannerModalOpen(true)}
        onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
        zombieCount={zombieCount}
      />

      <main className="app-container">
        {activeTab === 'dashboard' && (
          <Dashboard
            subscriptions={subscriptions}
            onSelectSubscription={setSelectedSubscription}
            onOpenAddModal={() => setIsAddModalOpen(true)}
            onOpenScannerModal={() => setIsScannerModalOpen(true)}
            onNavigateToTab={(tab) => setActiveTab(tab as ActiveTab)}
          />
        )}

        {activeTab === 'subscriptions' && (
          <SubscriptionList
            subscriptions={subscriptions}
            onIncrementUsage={incrementUsage}
            onSelectSubscription={setSelectedSubscription}
            onOpenAddModal={() => setIsAddModalOpen(true)}
            filterMode="all"
          />
        )}

        {activeTab === 'zombies' && (
          <div>
            <div style={{ marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <span>⚠️</span> 未利用サブスク（見直し対象）
              </h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                今月ほとんど使われていないサービスです。直通リンクから解約して固定費を削減できます。
              </p>
            </div>

            <SubscriptionList
              subscriptions={subscriptions}
              onIncrementUsage={incrementUsage}
              onSelectSubscription={setSelectedSubscription}
              onOpenAddModal={() => setIsAddModalOpen(true)}
              filterMode="zombies"
            />
          </div>
        )}

        {activeTab === 'savings' && (
          <SavingsView
            subscriptions={subscriptions}
            badges={badges}
            onReactivateSub={reactivateSubscription}
            onSelectSub={setSelectedSubscription}
          />
        )}
      </main>

      {/* Add Subscription Modal */}
      {isAddModalOpen && (
        <AddSubscriptionModal
          onClose={() => setIsAddModalOpen(false)}
          onAdd={addSubscription}
        />
      )}

      {/* Screenshot Scanner Modal */}
      {isScannerModalOpen && (
        <ScreenshotScannerModal
          onClose={() => setIsScannerModalOpen(false)}
          onImportSubscriptions={handleBatchImportScanned}
        />
      )}

      {/* Subscription Detail Modal */}
      {activeSelectedSub && (
        <SubscriptionDetailModal
          subscription={activeSelectedSub}
          onClose={() => setSelectedSubscription(null)}
          onCancelSub={cancelSubscription}
          onReactivateSub={reactivateSubscription}
          onDeleteSub={deleteSubscription}
          onUpdateSub={updateSubscription}
        />
      )}

      {/* Settings & Data Management Modal */}
      {isSettingsModalOpen && (
        <DataManagementModal
          subscriptions={subscriptions}
          badges={badges}
          onClose={() => setIsSettingsModalOpen(false)}
          onImport={importBackupData}
          onResetSample={resetToSampleData}
          onClearAll={clearAll}
        />
      )}
    </div>
  );
}
export default App;
