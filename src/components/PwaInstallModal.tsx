import React, { useState, useEffect } from 'react';
import { X, Smartphone, Share, PlusSquare, Compass, CheckCircle2, AlertTriangle, Download, ArrowUpRight } from 'lucide-react';

interface PwaInstallModalProps {
  onClose: () => void;
  deferredPrompt: any; // BeforeInstallPromptEvent
  onInstalled?: () => void;
}

export const PwaInstallModal: React.FC<PwaInstallModalProps> = ({
  onClose,
  deferredPrompt,
  onInstalled
}) => {
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isInAppBrowser, setIsInAppBrowser] = useState(false);
  const [inAppName, setInAppName] = useState('');
  const [installSuccess, setInstallSuccess] = useState(false);

  useEffect(() => {
    // ユーザーエージェント解析
    const ua = window.navigator.userAgent.toLowerCase();

    // iOS判定
    const isIosDevice = /iphone|ipad|ipod/.test(ua);
    setIsIOS(isIosDevice);

    // スタンドアロン判定
    const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    setIsStandalone(isStandaloneMode);

    // アプリ内ブラウザ（In-App Browser）判定
    if (ua.includes('line')) {
      setIsInAppBrowser(true);
      setInAppName('LINE');
    } else if (ua.includes('twitter') || ua.includes('fban') || ua.includes('fbav') || ua.includes('instagram')) {
      setIsInAppBrowser(true);
      setInAppName('SNSアプリ');
    }
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setInstallSuccess(true);
        if (onInstalled) onInstalled();
      }
    } catch (err) {
      console.error('Install prompt error:', err);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content animate-slide-up" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
        {/* Modal Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-hover))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff'
              }}
            >
              <Smartphone size={20} />
            </div>
            <div>
              <h2 className="modal-title" style={{ fontSize: '1.05rem' }}>SubCut をホーム画面に追加</h2>
              <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>スマホアプリとして快適に使う</span>
            </div>
          </div>

          <button className="btn-icon" onClick={onClose} aria-label="閉じる">
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body" style={{ gap: '1rem' }}>
          {/* App Advantages */}
          <div
            style={{
              background: 'rgba(59, 130, 246, 0.08)',
              border: '1px solid rgba(59, 130, 246, 0.2)',
              borderRadius: 'var(--radius-sm)',
              padding: '0.75rem 0.85rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.35rem',
              fontSize: '0.8rem',
              color: 'var(--text-main)'
            }}
          >
            <div style={{ fontWeight: 700, color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <CheckCircle2 size={15} /> PWA（ホーム画面追加）のメリット:
            </div>
            <ul style={{ paddingLeft: '1.2rem', margin: 0, color: 'var(--text-muted)', lineHeight: 1.5 }}>
              <li>ブラウザの枠がなくなり、<strong>全画面でサクサク操作</strong></li>
              <li>地下鉄や圏外でも動く<strong>オフライン対応</strong></li>
              <li>更新日前のリマインダー通知を確実にキャッチ</li>
            </ul>
          </div>

          {/* Condition 1: In-App Browser Warning */}
          {isInAppBrowser && (
            <div
              style={{
                backgroundColor: 'var(--color-warning-bg)',
                border: '1px solid rgba(255, 159, 10, 0.3)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.85rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
                color: 'var(--color-warning)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontWeight: 700, fontSize: '0.85rem' }}>
                <AlertTriangle size={17} />
                <span>{inAppName} 内ブラウザで開かれています</span>
              </div>
              <p style={{ fontSize: '0.75rem', color: '#fff', lineHeight: 1.45 }}>
                このままではホーム画面に追加できません。画面右上のメニュー（<strong>「…」</strong>または共有ボタン）から<strong>「Safariで開く」</strong>または<strong>「Chromeで開く」</strong>を選択してください。
              </p>
            </div>
          )}

          {/* Condition 2: Already Installed */}
          {isStandalone || installSuccess ? (
            <div
              style={{
                backgroundColor: 'var(--color-success-bg)',
                border: '1px solid rgba(48, 209, 88, 0.3)',
                borderRadius: 'var(--radius-sm)',
                padding: '1rem',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <CheckCircle2 size={32} style={{ color: 'var(--color-success)' }} />
              <strong style={{ fontSize: '0.95rem', color: 'var(--color-success)' }}>すでにインストール済みです！</strong>
              <p style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>
                ホーム画面のアイコンから起動すると、アプリモードでご利用いただけます。
              </p>
            </div>
          ) : isIOS ? (
            /* Condition 3: iOS Safari Instructions */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Compass size={16} style={{ color: 'var(--accent-primary)' }} /> iPhone / iPad での追加手順
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                <div
                  style={{
                    background: 'var(--bg-card-secondary)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '0.65rem 0.8rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.65rem'
                  }}
                >
                  <div style={{ background: '#252528', padding: '0.4rem', borderRadius: '6px', color: 'var(--accent-primary)' }}>
                    <Share size={18} />
                  </div>
                  <div style={{ fontSize: '0.8rem' }}>
                    <strong>Step 1:</strong> Safari 画面下部の「<strong>共有ボタン</strong>」をタップ
                  </div>
                </div>

                <div
                  style={{
                    background: 'var(--bg-card-secondary)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '0.65rem 0.8rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.65rem'
                  }}
                >
                  <div style={{ background: '#252528', padding: '0.4rem', borderRadius: '6px', color: 'var(--color-success)' }}>
                    <PlusSquare size={18} />
                  </div>
                  <div style={{ fontSize: '0.8rem' }}>
                    <strong>Step 2:</strong> メニューを少しスクロールして「<strong>ホーム画面に追加</strong>」をタップ
                  </div>
                </div>

                <div
                  style={{
                    background: 'var(--bg-card-secondary)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '0.65rem 0.8rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.65rem'
                  }}
                >
                  <div style={{ background: '#252528', padding: '0.4rem', borderRadius: '6px', color: 'var(--color-warning)' }}>
                    <ArrowUpRight size={18} />
                  </div>
                  <div style={{ fontSize: '0.8rem' }}>
                    <strong>Step 3:</strong> 右上の「<strong>追加</strong>」をタップすると完了！
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Condition 4: Android / Chrome / PC */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Download size={16} style={{ color: 'var(--accent-primary)' }} /> ワンクリックでアプリをインストール
              </div>

              {deferredPrompt ? (
                <button
                  type="button"
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '0.75rem', justifyContent: 'center', fontSize: '0.9rem' }}
                  onClick={handleInstallClick}
                >
                  <Smartphone size={18} />
                  <span>アプリをインストールする</span>
                </button>
              ) : (
                <div style={{ background: 'var(--bg-card-secondary)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', fontSize: '0.775rem', color: 'var(--text-muted)', lineHeight: 1.45 }}>
                  ブラウザ右上のメニュー（<strong>⋮</strong>）から「<strong>アプリをインストール</strong>」または「<strong>ホーム画面に追加</strong>」を選択してください。
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          <button className="btn btn-secondary btn-sm" onClick={onClose} style={{ width: '100%' }}>
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
};
