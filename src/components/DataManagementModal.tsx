import React, { useState, useEffect } from 'react';
import { 
  X, 
  Download, 
  Upload, 
  RotateCcw, 
  Trash2, 
  CheckCircle2, 
  AlertTriangle,
  FileJson,
  ShieldCheck,
  Bell,
  BellRing,
  Smartphone
} from 'lucide-react';
import { AchievementBadge, AppBackupData, Subscription } from '../types';
import { encryptData, decryptData } from '../utils/crypto';
import { getNotificationPermission, requestNotificationPermission, checkAndTriggerBillingReminders } from '../utils/notifications';

interface DataManagementModalProps {
  subscriptions: Subscription[];
  badges: AchievementBadge[];
  onClose: () => void;
  onImport: (subs: Subscription[], badges?: AchievementBadge[]) => void;
  onResetSample: () => void;
  onClearAll: () => void;
  onOpenPwaModal?: () => void;
}

export const DataManagementModal: React.FC<DataManagementModalProps> = ({
  subscriptions,
  badges,
  onClose,
  onImport,
  onResetSample,
  onClearAll,
  onOpenPwaModal
}) => {
  const [exportPassword, setExportPassword] = useState('');
  const [importPassword, setImportPassword] = useState('');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const [notificationState, setNotificationState] = useState<string>('default');

  useEffect(() => {
    setNotificationState(getNotificationPermission());
  }, []);

  const handleRequestNotification = async () => {
    const granted = await requestNotificationPermission();
    setNotificationState(getNotificationPermission());
    if (granted) {
      setStatusMessage({
        type: 'success',
        text: '更新リマインダー通知が有効になりました！更新3日前・前日に自動通知されます。'
      });
      // 直ちにチェック
      checkAndTriggerBillingReminders(subscriptions);
    } else {
      setStatusMessage({
        type: 'error',
        text: '通知がブロックされました。ブラウザの設定から通知を許可してください。'
      });
    }
  };

  // バックアップエクスポート
  const handleExport = async () => {
    try {
      const backupData: AppBackupData = {
        version: '1.0.0',
        exportedAt: new Date().toISOString(),
        subscriptions,
        badges,
        notes: 'SubCut Backup'
      };

      const jsonStr = JSON.stringify(backupData, null, 2);
      let fileData: string;
      let fileName: string;
      let mimeType: string;

      if (exportPassword.trim()) {
        const encrypted = await encryptData(jsonStr, exportPassword.trim());
        fileData = encrypted;
        fileName = `subcut-backup-encrypted-${new Date().toISOString().split('T')[0]}.subcut`;
        mimeType = 'text/plain';
      } else {
        fileData = jsonStr;
        fileName = `subcut-backup-${new Date().toISOString().split('T')[0]}.json`;
        mimeType = 'application/json';
      }

      const blob = new Blob([fileData], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setStatusMessage({ type: 'success', text: `バックアップファイルを書き出しました（${fileName}）` });
    } catch (err) {
      console.error(err);
      setStatusMessage({ type: 'error', text: 'エクスポートに失敗しました。' });
    }
  };

  // バックアップインポート
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const content = await file.text();
      let parsedJson: AppBackupData;

      if (file.name.endsWith('.subcut') || (!content.trim().startsWith('{') && !content.trim().startsWith('['))) {
        if (!importPassword.trim()) {
          setStatusMessage({
            type: 'error',
            text: '暗号化されたバックアップです。上記にパスワードを入力してからファイルを選択してください。'
          });
          return;
        }
        const decryptedStr = await decryptData(content.trim(), importPassword.trim());
        parsedJson = JSON.parse(decryptedStr);
      } else {
        parsedJson = JSON.parse(content);
      }

      if (parsedJson.subscriptions && Array.isArray(parsedJson.subscriptions)) {
        onImport(parsedJson.subscriptions, parsedJson.badges);
        setStatusMessage({
          type: 'success',
          text: `復元に成功しました！ サブスク ${parsedJson.subscriptions.length} 件をインポートしました。`
        });
      } else if (Array.isArray(parsedJson)) {
        onImport(parsedJson as unknown as Subscription[]);
        setStatusMessage({
          type: 'success',
          text: `復元に成功しました！ サブスク ${(parsedJson as any[]).length} 件をインポートしました。`
        });
      } else {
        throw new Error('サブスクデータが見つかりません');
      }
    } catch (err: any) {
      console.error(err);
      setStatusMessage({
        type: 'error',
        text: err.message || 'ファイルの読み込み・復元に失敗しました。パスワードまたはファイル形式をご確認ください。'
      });
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content animate-slide-up" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <FileJson size={20} style={{ color: 'var(--accent-primary)' }} />
            <h2 className="modal-title">アプリ設定・データ管理</h2>
          </div>
          <button className="btn-icon" onClick={onClose} aria-label="閉じる">
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {statusMessage && (
            <div
              style={{
                backgroundColor: statusMessage.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'var(--color-danger-bg)',
                border: `1px solid ${statusMessage.type === 'success' ? 'rgba(16, 185, 129, 0.35)' : 'rgba(239, 68, 68, 0.35)'}`,
                borderRadius: 'var(--radius-sm)',
                padding: '0.75rem 1rem',
                fontSize: '0.85rem',
                color: statusMessage.type === 'success' ? '#34d399' : '#f87171',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              {statusMessage.type === 'success' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* Privacy Note */}
          <div
            style={{
              background: 'rgba(59, 130, 246, 0.1)',
              border: '1px solid rgba(59, 130, 246, 0.25)',
              borderRadius: 'var(--radius-md)',
              padding: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem'
            }}
          >
            <ShieldCheck size={24} style={{ color: '#60a5fa', flexShrink: 0 }} />
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              SubCutは<strong>完全ローカルファースト</strong>です。データはブラウザ内にのみ保存され、外部サーバーに送信されることは一切ありません。
            </div>
          </div>

          {/* Notification & Reminders Setting */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <BellRing size={16} style={{ color: 'var(--color-warning)' }} /> 更新日・解約期限リマインダー通知
            </h3>
            <p style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>
              次回更新日や無料体験終了日の3日前・前日に、ブラウザプッシュ通知で解約忘れを防止します。
            </p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-card-secondary)', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.825rem' }}>
                通知ステータス: <strong>{notificationState === 'granted' ? '✅ 有効（受信中）' : notificationState === 'denied' ? '❌ ブロック中' : '⚠️ 未設定'}</strong>
              </div>
              {notificationState !== 'granted' && (
                <button className="btn btn-primary btn-sm" onClick={handleRequestNotification}>
                  <Bell size={14} />
                  <span>通知を有効化</span>
                </button>
              )}
            </div>
          </div>

          {/* PWA App Installation Guide */}
          {onOpenPwaModal && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Smartphone size={16} style={{ color: 'var(--accent-primary)' }} /> スマホ・ホーム画面アプリ追加 (PWA)
              </h3>
              <p style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>
                スマホのホーム画面に追加すると、全画面でネイティブアプリのように使え、オフラインでも軽快に動作します。
              </p>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  onClose();
                  onOpenPwaModal();
                }}
                style={{ alignSelf: 'flex-start' }}
              >
                <Smartphone size={14} />
                <span>インストール・ホーム画面追加ガイドを開く</span>
              </button>
            </div>
          )}

          <div style={{ borderTop: '1px solid var(--border-subtle)', margin: '0.2rem 0' }} />

          {/* Export Section */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Download size={16} /> バックアップのエクスポート
            </h3>
            <p style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>
              現在の登録サブスクおよび節約実績データをJSONまたは暗号化ファイルでダウンロードします。
            </p>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="password"
                className="form-input"
                placeholder="暗号化パスワード（任意）"
                style={{ flex: 1 }}
                value={exportPassword}
                onChange={(e) => setExportPassword(e.target.value)}
              />
              <button className="btn btn-primary btn-sm" onClick={handleExport}>
                <Download size={15} />
                <span>保存</span>
              </button>
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--border-subtle)', margin: '0.2rem 0' }} />

          {/* Import Section */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Upload size={16} /> バックアップの復元（インポート）
            </h3>
            <p style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>
              以前エクスポートしたバックアップファイルを選択して復元します。
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <input
                type="password"
                className="form-input"
                placeholder="暗号化されている場合のパスワード"
                value={importPassword}
                onChange={(e) => setImportPassword(e.target.value)}
              />
              <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer', textAlign: 'center' }}>
                <Upload size={15} />
                <span>ファイルを選択してインポート</span>
                <input
                  type="file"
                  accept=".json,.subcut,text/plain"
                  style={{ display: 'none' }}
                  onChange={handleFileUpload}
                />
              </label>
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--border-subtle)', margin: '0.2rem 0' }} />

          {/* Sample Data & Reset Section */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>メンテナンス・デモ</h3>
            <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  onResetSample();
                  setStatusMessage({ type: 'success', text: '初期サンプルデータを再読み込みしました。' });
                }}
              >
                <RotateCcw size={14} />
                <span>デモサンプルを再読込</span>
              </button>

              {confirmClear ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => {
                      onClearAll();
                      setConfirmClear(false);
                      setStatusMessage({ type: 'success', text: 'すべてのデータを削除しました。' });
                    }}
                  >
                    本当に全消去する
                  </button>
                  <button className="btn btn-secondary btn-sm" onClick={() => setConfirmClear(false)}>
                    中止
                  </button>
                </div>
              ) : (
                <button
                  className="btn btn-danger-outline btn-sm"
                  onClick={() => setConfirmClear(true)}
                >
                  <Trash2 size={14} />
                  <span>全データを初期化</span>
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
};
