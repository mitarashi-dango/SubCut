// Web Crypto APIを用いたクライアントサイド暗号化/復号ユーティリティ

const SALT_BYTE_LENGTH = 16;
const IV_BYTE_LENGTH = 12;
const PBKDF2_ITERATIONS = 100000;

/**
 * パスワードからAES-GCM暗号化キーを導出
 */
async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as unknown as BufferSource,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * 文字列データをパスワードで暗号化（Base64文字列を返す）
 */
export async function encryptData(dataString: string, password?: string): Promise<string> {
  if (!password) {
    // パスワードなしの場合は単なるBase64
    return btoa(unescape(encodeURIComponent(dataString)));
  }

  const salt = window.crypto.getRandomValues(new Uint8Array(SALT_BYTE_LENGTH));
  const iv = window.crypto.getRandomValues(new Uint8Array(IV_BYTE_LENGTH));
  const key = await deriveKey(password, salt);

  const enc = new TextEncoder();
  const encryptedContent = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv as unknown as BufferSource },
    key,
    enc.encode(dataString)
  );

  const combined = new Uint8Array(salt.length + iv.length + encryptedContent.byteLength);
  combined.set(salt, 0);
  combined.set(iv, salt.length);
  combined.set(new Uint8Array(encryptedContent), salt.length + iv.length);

  // Base64にエンコード
  let binary = '';
  for (let i = 0; i < combined.byteLength; i++) {
    binary += String.fromCharCode(combined[i]);
  }
  return btoa(binary);
}

/**
 * 暗号化されたBase64文字列を復号
 */
export async function decryptData(encryptedBase64: string, password?: string): Promise<string> {
  if (!password) {
    try {
      return decodeURIComponent(escape(atob(encryptedBase64)));
    } catch {
      throw new Error('データの形式が不正です。パスワードが必要なバックアップの可能性があります。');
    }
  }

  try {
    const binary = atob(encryptedBase64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }

    if (bytes.length < SALT_BYTE_LENGTH + IV_BYTE_LENGTH) {
      throw new Error('データ長が短すぎます');
    }

    const salt = bytes.slice(0, SALT_BYTE_LENGTH);
    const iv = bytes.slice(SALT_BYTE_LENGTH, SALT_BYTE_LENGTH + IV_BYTE_LENGTH);
    const data = bytes.slice(SALT_BYTE_LENGTH + IV_BYTE_LENGTH);

    const key = await deriveKey(password, salt);

    const decrypted = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: iv as unknown as BufferSource },
      key,
      data as unknown as BufferSource
    );

    const dec = new TextDecoder();
    return dec.decode(decrypted);
  } catch {
    throw new Error('復号に失敗しました。パスワードが間違っているか、ファイルが破損しています。');
  }
}
