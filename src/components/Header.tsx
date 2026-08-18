import React from 'react';
import { Scissors, Plus, Settings2, LayoutDashboard, List, Trophy, AlertCircle, Camera, Smartphone } from 'lucide-react';

export type ActiveTab = 'dashboard' | 'subscriptions' | 'savings' | 'zombies';

interface HeaderProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onOpenAddModal: () => void;
  onOpenScannerModal: () => void;
  onOpenSettingsModal: () => void;
  onOpenPwaModal?: () => void;
  zombieCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  onOpenAddModal,
  onOpenScannerModal,
  onOpenSettingsModal,
  onOpenPwaModal,
  zombieCount
}) => {
  return (
    <>
      <header className="app-header">
        <div className="header-inner">
          <div className="brand" role="banner">
            <div className="brand-icon-wrapper">
              <Scissors size={17} />
            </div>
            <span className="brand-title">SubCut</span>
            <span className="brand-badge">断捨離</span>
          </div>

          <nav className="nav-segmented" aria-label="メインナビゲーション">
            <button
              className={`segmented-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => onTabChange('dashboard')}
            >
              <LayoutDashboard size={14} />
              ダッシュボード
            </button>
            <button
              className={`segmented-btn ${activeTab === 'subscriptions' ? 'active' : ''}`}
              onClick={() => onTabChange('subscriptions')}
            >
              <List size={14} />
              サブスク一覧
            </button>
            <button
              className={`segmented-btn ${activeTab === 'zombies' ? 'active' : ''}`}
              onClick={() => onTabChange('zombies')}
              style={{ position: 'relative' }}
            >
              <AlertCircle size={14} />
              未利用
              {zombieCount > 0 && (
                <span
                  style={{
                    backgroundColor: 'var(--color-danger)',
                    color: '#fff',
                    fontSize: '0.625rem',
                    padding: '0.05rem 0.35rem',
                    borderRadius: '9999px',
                    fontWeight: 700,
                    marginLeft: '2px'
                  }}
                >
                  {zombieCount}
                </span>
              )}
            </button>
            <button
              className={`segmented-btn ${activeTab === 'savings' ? 'active' : ''}`}
              onClick={() => onTabChange('savings')}
            >
              <Trophy size={14} />
              解約・節約実績
            </button>
          </nav>

          <div className="header-actions">
            {onOpenPwaModal && (
              <button
                className="btn btn-secondary btn-icon"
                onClick={onOpenPwaModal}
                title="ホーム画面に追加（PWAインストール）"
                aria-label="PWAアプリインストール"
              >
                <Smartphone size={16} style={{ color: 'var(--accent-primary)' }} />
              </button>
            )}
            <button
              className="btn btn-secondary btn-sm"
              onClick={onOpenScannerModal}
              title="クレカ明細スクショから自動スキャン"
            >
              <Camera size={14} style={{ color: 'var(--accent-primary)' }} />
              <span>明細スキャン</span>
            </button>
            <button
              className="btn btn-primary btn-sm"
              onClick={onOpenAddModal}
              id="btn-add-subscription"
            >
              <Plus size={14} />
              <span>手動追加</span>
            </button>
            <button
              className="btn btn-secondary btn-icon"
              onClick={onOpenSettingsModal}
              title="データ管理・設定"
              aria-label="データ管理・設定"
            >
              <Settings2 size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation */}
      <nav className="mobile-nav-bar" aria-label="モバイルナビゲーション">
        <button
          className={`mobile-nav-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => onTabChange('dashboard')}
        >
          <LayoutDashboard size={18} />
          <span>ホーム</span>
        </button>
        <button
          className={`mobile-nav-btn ${activeTab === 'subscriptions' ? 'active' : ''}`}
          onClick={() => onTabChange('subscriptions')}
        >
          <List size={18} />
          <span>一覧</span>
        </button>
        <button
          className={`mobile-nav-btn ${activeTab === 'zombies' ? 'active' : ''}`}
          onClick={() => onTabChange('zombies')}
          style={{ position: 'relative' }}
        >
          <AlertCircle size={18} />
          <span>未利用</span>
          {zombieCount > 0 && (
            <span
              style={{
                position: 'absolute',
                top: '2px',
                right: '18px',
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-danger)'
              }}
            />
          )}
        </button>
        <button
          className={`mobile-nav-btn ${activeTab === 'savings' ? 'active' : ''}`}
          onClick={() => onTabChange('savings')}
        >
          <Trophy size={18} />
          <span>節約実績</span>
        </button>
      </nav>
    </>
  );
};
