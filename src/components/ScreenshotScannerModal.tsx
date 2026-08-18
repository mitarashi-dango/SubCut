import React, { useState } from 'react';
import { 
  X, 
  Camera, 
  Upload, 
  Sparkles, 
  Scissors, 
  ArrowRight, 
  ShieldCheck, 
  Smartphone, 
  AlertTriangle,
  FileImage
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { 
  ScannedSubscriptionCandidate, 
  performOcrOnImage, 
  analyzeExtractedText, 
  SAMPLE_STATEMENT_TEXT, 
  convertCandidatesToSubscriptions 
} from '../utils/screenshotScanner';
import { Subscription } from '../types';
import { formatCurrency } from '../utils/formatters';
import { CategoryIcon } from './CategoryIcon';

interface ScreenshotScannerModalProps {
  onClose: () => void;
  onImportSubscriptions: (newSubs: Subscription[]) => void;
}

export const ScreenshotScannerModal: React.FC<ScreenshotScannerModalProps> = ({
  onClose,
  onImportSubscriptions
}) => {
  const [scanStep, setScanStep] = useState<'upload' | 'scanning' | 'results'>('upload');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [scanProgress, setScanProgress] = useState(0);
  const [statusText, setStatusText] = useState('準備中...');
  const [candidates, setCandidates] = useState<ScannedSubscriptionCandidate[]>([]);
  const [phoneType, setPhoneType] = useState<'iphone_new' | 'iphone_old' | 'android'>('iphone_new');

  // ファイル選択ハンドラー
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newFiles = Array.from(files);
    setSelectedFiles((prev) => [...prev, ...newFiles]);

    const newUrls = newFiles.map((f) => URL.createObjectURL(f));
    setPreviewUrls((prev) => [...prev, ...newUrls]);
  };

  // 画像削除
  const handleRemoveImage = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  // スキャン実行（画像OCR）
  const handleStartScan = async () => {
    if (selectedFiles.length === 0) return;

    setScanStep('scanning');
    setScanProgress(10);
    setStatusText('OCRエンジンを起動中...');

    try {
      let combinedText = '';
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        setStatusText(`スクショ ${i + 1}/${selectedFiles.length} 枚目を解析中...`);
        const text = await performOcrOnImage(file, (p, textStatus) => {
          const overallProgress = Math.round(((i + p / 100) / selectedFiles.length) * 90);
          setScanProgress(overallProgress);
          setStatusText(textStatus);
        });
        combinedText += '\n' + text;
      }

      setScanProgress(95);
      setStatusText('3ヶ月の定期課金を照合中...');

      const detected = analyzeExtractedText(combinedText);
      setCandidates(detected);
      setScanProgress(100);
      setScanStep('results');
    } catch (err) {
      console.error(err);
      alert('画像の文字認識に失敗しました。画像が鮮明かご確認いただくか、サンプルでお試しください。');
      setScanStep('upload');
    }
  };

  // サンプルデータで即時スキャン体験
  const handleUseSample = () => {
    setScanStep('scanning');
    setScanProgress(30);
    setStatusText('デモ用3ヶ月明細を読み込み中...');

    setTimeout(() => {
      setScanProgress(70);
      setStatusText('定期課金（サブスク）を検出中...');

      setTimeout(() => {
        const detected = analyzeExtractedText(SAMPLE_STATEMENT_TEXT);
        setCandidates(detected);
        setScanProgress(100);
        setScanStep('results');
      }, 500);
    }, 400);
  };

  // チェックボックス切り替え
  const handleToggleCandidate = (id: string) => {
    setCandidates((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isSelected: !c.isSelected } : c))
    );
  };

  // 一括登録完了（スクショ結果）
  const handleImportScanned = () => {
    const selected = candidates.filter((c) => c.isSelected);
    if (selected.length === 0) return;

    const newSubs = convertCandidatesToSubscriptions(selected);
    onImportSubscriptions(newSubs);

    try {
      confetti({
        particleCount: 100,
        spread: 90,
        origin: { y: 0.6 },
        colors: ['#30D158', '#0A84FF', '#FFD60A', '#FFFFFF']
      });
    } catch {
      // ignore
    }

    onClose();
  };

  const selectedCount = candidates.filter((c) => c.isSelected).length;
  const totalMonthlyAmount = candidates
    .filter((c) => c.isSelected)
    .reduce((sum, c) => sum + c.amount, 0);
  const total3MonthsPaid = candidates
    .filter((c) => c.isSelected)
    .reduce((sum, c) => sum + c.totalPaid3Months, 0);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content animate-slide-up" style={{ maxWidth: '580px' }} onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Camera size={18} style={{ color: 'var(--color-danger)' }} />
            <h2 className="modal-title">クレカ明細スクショ診断（3ヶ月分）</h2>
          </div>
          <button className="btn-icon" onClick={onClose} aria-label="閉じる">
            <X size={18} />
          </button>
        </div>

        {/* Step 1: Upload Screenshots & Phone Instructions */}
        {scanStep === 'upload' && (
          <div className="modal-body" style={{ gap: '0.85rem' }}>
            {/* Core Mission Banner */}
            <div
              style={{
                background: 'linear-gradient(135deg, rgba(255, 69, 58, 0.12) 0%, rgba(28, 28, 30, 0.95) 100%)',
                border: '1px solid rgba(255, 69, 58, 0.3)',
                borderRadius: 'var(--radius-md)',
                padding: '0.75rem 0.95rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.65rem'
              }}
            >
              <AlertTriangle size={18} style={{ color: 'var(--color-danger)', flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong style={{ fontSize: '0.825rem', color: '#ffffff', display: 'block' }}>
                  記憶に頼ると、忘れている幽霊サブスクを見逃します！
                </strong>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem', lineHeight: 1.4 }}>
                  過去3ヶ月の利用明細スクショから、<strong>実際に引き落とされている定期課金</strong>を機械が客観的に暴き出します。
                </p>
              </div>
            </div>

            {/* How to take screenshot guide (Always Visible & Tabbed by Phone) */}
            <div
              style={{
                background: 'var(--bg-card-secondary)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '0.75rem 0.85rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.775rem', fontWeight: 600, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Smartphone size={14} style={{ color: 'var(--accent-primary)' }} />
                  スマホのスクショの撮り方
                </span>
                
                {/* Phone Selector Pills */}
                <div style={{ display: 'flex', gap: '2px', background: '#1c1c1e', padding: '2px', borderRadius: '6px' }}>
                  <button
                    type="button"
                    onClick={() => setPhoneType('iphone_new')}
                    style={{
                      fontSize: '0.685rem',
                      padding: '0.2rem 0.45rem',
                      borderRadius: '4px',
                      color: phoneType === 'iphone_new' ? '#fff' : 'var(--text-muted)',
                      background: phoneType === 'iphone_new' ? '#3a3a3c' : 'transparent',
                      fontWeight: phoneType === 'iphone_new' ? 600 : 400
                    }}
                  >
                    iPhone (最新)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPhoneType('iphone_old')}
                    style={{
                      fontSize: '0.685rem',
                      padding: '0.2rem 0.45rem',
                      borderRadius: '4px',
                      color: phoneType === 'iphone_old' ? '#fff' : 'var(--text-muted)',
                      background: phoneType === 'iphone_old' ? '#3a3a3c' : 'transparent',
                      fontWeight: phoneType === 'iphone_old' ? 600 : 400
                    }}
                  >
                    iPhone (ボタン有)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPhoneType('android')}
                    style={{
                      fontSize: '0.685rem',
                      padding: '0.2rem 0.45rem',
                      borderRadius: '4px',
                      color: phoneType === 'android' ? '#fff' : 'var(--text-muted)',
                      background: phoneType === 'android' ? '#3a3a3c' : 'transparent',
                      fontWeight: phoneType === 'android' ? 600 : 400
                    }}
                  >
                    Android
                  </button>
                </div>
              </div>

              {/* Guide Content */}
              <div
                style={{
                  background: '#161618',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.6rem 0.75rem',
                  fontSize: '0.785rem',
                  color: 'var(--text-main)',
                  lineHeight: 1.45,
                  border: '1px solid var(--border-subtle)'
                }}
              >
                {phoneType === 'iphone_new' && (
                  <div>
                    🍎 <strong>「音量を上げるボタン（左）」</strong> と <strong>「電源ボタン（右）」</strong> を <strong>同時にカチッと押す</strong>
                  </div>
                )}
                {phoneType === 'iphone_old' && (
                  <div>
                    🍎 <strong>「丸いホームボタン（下）」</strong> と <strong>「電源ボタン」</strong> を <strong>同時にカチッと押す</strong>
                  </div>
                )}
                {phoneType === 'android' && (
                  <div>
                    🤖 <strong>「音量を下げるボタン」</strong> と <strong>「電源ボタン」</strong> を <strong>同時に1秒間長押し</strong>
                  </div>
                )}
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  👉 クレカアプリで<strong>過去3ヶ月の明細画面</strong>を開いてカシャッと撮ってください（1〜3枚）。
                </div>
              </div>
            </div>

            {/* Action Buttons: Choose Photos & Camera */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <label
                style={{
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.1rem 0.75rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem',
                  cursor: 'pointer',
                  background: 'var(--bg-elevated)',
                  transition: 'all 0.15s ease'
                }}
              >
                <Upload size={20} style={{ color: 'var(--accent-primary)' }} />
                <div style={{ textAlign: 'center' }}>
                  <strong style={{ fontSize: '0.825rem', display: 'block', color: '#ffffff' }}>
                    写真からスクショ選択
                  </strong>
                  <span style={{ fontSize: '0.675rem', color: 'var(--text-muted)' }}>
                    1〜3枚まとめて選択
                  </span>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  style={{ display: 'none' }}
                  onChange={handleFileSelect}
                />
              </label>

              <label
                style={{
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.1rem 0.75rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem',
                  cursor: 'pointer',
                  background: 'var(--bg-elevated)',
                  transition: 'all 0.15s ease'
                }}
              >
                <Camera size={20} style={{ color: 'var(--color-success)' }} />
                <div style={{ textAlign: 'center' }}>
                  <strong style={{ fontSize: '0.825rem', display: 'block', color: '#ffffff' }}>
                    カメラで撮影する
                  </strong>
                  <span style={{ fontSize: '0.675rem', color: 'var(--text-muted)' }}>
                    PC画面や紙の明細を撮影
                  </span>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  style={{ display: 'none' }}
                  onChange={handleFileSelect}
                />
              </label>
            </div>

            {/* Selected Images Preview List */}
            {previewUrls.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <span style={{ fontSize: '0.725rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                  選択されたスクショ（{previewUrls.length}枚）
                </span>
                <div style={{ display: 'flex', gap: '0.4rem', overflowX: 'auto', paddingBottom: '0.2rem' }}>
                  {previewUrls.map((url, idx) => (
                    <div
                      key={idx}
                      style={{
                        position: 'relative',
                        width: '64px',
                        height: '80px',
                        borderRadius: 'var(--radius-sm)',
                        overflow: 'hidden',
                        border: '1px solid var(--border-subtle)',
                        flexShrink: 0
                      }}
                    >
                      <img
                        src={url}
                        alt={`スクショ ${idx + 1}`}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      <button
                        className="btn-icon"
                        onClick={(e) => {
                          e.preventDefault();
                          handleRemoveImage(idx);
                        }}
                        style={{
                          position: 'absolute',
                          top: '2px',
                          right: '2px',
                          padding: '0.15rem',
                          background: 'rgba(0, 0, 0, 0.75)',
                          color: '#fff',
                          borderRadius: '3px'
                        }}
                        title="削除"
                      >
                        <X size={11} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Privacy & Safe Note */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.7rem', color: 'var(--text-subtle)' }}>
              <ShieldCheck size={13} style={{ color: 'var(--color-success)' }} />
              <span>スクショは端末内（ブラウザ）でのみ安全に解析され、外部には送信されません。</span>
            </div>

            {/* Action Row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.4rem' }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={handleUseSample}
                style={{ fontSize: '0.785rem' }}
              >
                <Sparkles size={13} style={{ color: 'var(--color-gold)' }} />
                <span>お試しサンプルで体験</span>
              </button>

              <button
                type="button"
                className="btn btn-primary btn-sm"
                disabled={selectedFiles.length === 0}
                onClick={handleStartScan}
                style={{ opacity: selectedFiles.length === 0 ? 0.4 : 1 }}
              >
                <span>3ヶ月スキャン開始 ({selectedFiles.length}枚)</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Scanning Progress */}
        {scanStep === 'scanning' && (
          <div className="modal-body" style={{ padding: '3rem 1.5rem', textAlign: 'center' }}>
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: 'rgba(10, 132, 255, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem',
                color: 'var(--color-info)'
              }}
            >
              <Camera size={26} className="subtle-pulse" />
            </div>

            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.35rem' }}>
              スクショ明細を解析中...
            </h3>
            <p style={{ fontSize: '0.785rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              {statusText}
            </p>

            <div style={{ width: '100%', maxWidth: '280px', height: '5px', backgroundColor: 'rgba(255, 255, 255, 0.08)', borderRadius: '3px', margin: '0 auto', overflow: 'hidden' }}>
              <div
                style={{
                  width: `${scanProgress}%`,
                  height: '100%',
                  backgroundColor: 'var(--color-info)',
                  borderRadius: '3px',
                  transition: 'width 0.3s ease'
                }}
              />
            </div>
          </div>
        )}

        {/* Step 3: Scan Results & Import Confirmation */}
        {scanStep === 'results' && (
          <div className="modal-body" style={{ gap: '0.75rem' }}>
            <div
              style={{
                background: '#1c1b14',
                border: '1px solid rgba(255, 214, 10, 0.3)',
                borderRadius: 'var(--radius-md)',
                padding: '0.75rem 0.95rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '0.65rem'
              }}
            >
              <div>
                <span style={{ fontSize: '0.725rem', fontWeight: 600, color: 'var(--color-gold)' }}>
                  🎉 定期課金を {candidates.length} 件 検出しました！
                </span>
                <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff', fontFamily: 'var(--font-mono)' }}>
                  月額 {formatCurrency(totalMonthlyAmount)}
                  <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', fontWeight: 400, marginLeft: '0.35rem' }}>
                    (3ヶ月累計: {formatCurrency(total3MonthsPaid)})
                  </span>
                </div>
              </div>
              <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                {selectedCount} 件 選択
              </span>
            </div>

            <p style={{ fontSize: '0.785rem', color: 'var(--text-muted)' }}>
              登録したいサブスクにチェックを入れてください（自動で台帳にセットされます）：
            </p>

            {/* Candidates List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', maxHeight: '40vh', overflowY: 'auto', paddingRight: '0.2rem' }}>
              {candidates.map((cand) => (
                <div
                  key={cand.id}
                  onClick={() => handleToggleCandidate(cand.id)}
                  style={{
                    background: cand.isSelected ? 'var(--bg-elevated)' : 'var(--bg-card-secondary)',
                    border: `1px solid ${cand.isSelected ? 'rgba(10, 132, 255, 0.4)' : 'var(--border-subtle)'}`,
                    borderRadius: 'var(--radius-sm)',
                    padding: '0.55rem 0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                    <input
                      type="checkbox"
                      checked={cand.isSelected}
                      onChange={() => {}}
                      style={{ width: '15px', height: '15px', accentColor: 'var(--accent-primary)', cursor: 'pointer' }}
                    />
                    <div
                      className="sub-icon"
                      style={{
                        backgroundColor: '#1c1c1e',
                        color: cand.color || '#fff',
                        width: '28px',
                        height: '28px'
                      }}
                    >
                      <CategoryIcon name={cand.icon || 'Tv'} size={14} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.825rem', color: '#ffffff' }}>
                        {cand.normalizedName}
                      </div>
                      <div style={{ fontSize: '0.675rem', color: 'var(--text-muted)' }}>
                        3ヶ月中 {cand.occurrences}回 検出 • 累計 {formatCurrency(cand.totalPaid3Months)}
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.9rem', color: '#ffffff' }}>
                      {formatCurrency(cand.amount)}
                      <span style={{ fontSize: '0.675rem', color: 'var(--text-subtle)', fontWeight: 400 }}>/月</span>
                    </div>
                    {cand.cancelUrl && (
                      <span style={{ fontSize: '0.65rem', color: 'var(--color-success)', fontWeight: 600 }}>
                        解約URLあり
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setScanStep('upload')}
              >
                戻る
              </button>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                disabled={selectedCount === 0}
                onClick={handleImportScanned}
                style={{ opacity: selectedCount === 0 ? 0.4 : 1 }}
              >
                <Scissors size={14} />
                <span>{selectedCount} 件を一括登録して断捨離開始</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
