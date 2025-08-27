// Token encryption utilities using Web Crypto API
// This provides client-side encryption for GitHub tokens stored in localStorage

const ALGORITHM = 'AES-GCM';
const KEY_LENGTH = 256;
const IV_LENGTH = 12; // 96 bits for GCM

// Generate a key from a password using PBKDF2
async function generateKey(password) {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  );

  const salt = new Uint8Array(16);
  crypto.getRandomValues(salt);

  const key = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: ALGORITHM, length: KEY_LENGTH },
    false,
    ['encrypt', 'decrypt']
  );

  return { key, salt };
}

// Generate a deterministic key based on browser characteristics
async function generateBrowserKey() {
  // Create a deterministic seed based on browser characteristics
  const browserInfo = [
    navigator.userAgent,
    navigator.language,
    screen.width + 'x' + screen.height,
    new Date().getTimezoneOffset().toString(),
    'usedshoes-app-v1' // App-specific salt
  ].join('|');

  const encoder = new TextEncoder();
  const data = encoder.encode(browserInfo);
  
  // Hash the browser info to create a consistent seed
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  
  // Use the hash as key material
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    hashBuffer,
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  // Derive the actual encryption key
  const salt = new Uint8Array(16);
  salt.set(new Uint8Array(hashBuffer, 0, 16)); // Use part of hash as salt
  
  const key = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: ALGORITHM, length: KEY_LENGTH },
    false,
    ['encrypt', 'decrypt']
  );

  return key;
}

// Generate a simple key for basic encryption (fallback)
async function generateSimpleKey() {
  return await crypto.subtle.generateKey(
    {
      name: ALGORITHM,
      length: KEY_LENGTH
    },
    true,
    ['encrypt', 'decrypt']
  );
}

// Export key to raw format for storage
async function exportKey(key) {
  return await crypto.subtle.exportKey('raw', key);
}

// Import key from raw format
async function importKey(keyData) {
  return await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: ALGORITHM },
    false,
    ['encrypt', 'decrypt']
  );
}

// Encrypt a token with a deterministic key based on browser fingerprint
export async function encryptToken(token, password = null) {
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(token);

    let key;
    let salt = null;

    if (password) {
      const keyData = await generateKey(password);
      key = keyData.key;
      salt = keyData.salt;
    } else {
      // Use a deterministic key based on browser characteristics
      key = await generateBrowserKey();
    }

    const iv = new Uint8Array(IV_LENGTH);
    crypto.getRandomValues(iv);

    const encrypted = await crypto.subtle.encrypt(
      {
        name: ALGORITHM,
        iv: iv
      },
      key,
      data
    );

    // Combine salt (if exists), iv, and encrypted data
    const result = {
      iv: arrayBufferToBase64(iv),
      data: arrayBufferToBase64(encrypted),
      salt: salt ? arrayBufferToBase64(salt) : null,
      method: password ? 'password' : 'browser'
    };

    return btoa(JSON.stringify(result));
  } catch (error) {
    console.error('Encryption failed:', error);
    throw new Error('Failed to encrypt token');
  }
}

// Decrypt a token
export async function decryptToken(encryptedToken, password = null) {
  try {
    const encrypted = JSON.parse(atob(encryptedToken));
    const iv = base64ToArrayBuffer(encrypted.iv);
    const data = base64ToArrayBuffer(encrypted.data);
    
    let key;

    if (encrypted.method === 'password' && encrypted.salt) {
      // Password-based decryption
      if (!password) {
        throw new Error('Password required for decryption');
      }
      const salt = base64ToArrayBuffer(encrypted.salt);
      const encoder = new TextEncoder();
      const keyMaterial = await crypto.subtle.importKey(
        'raw',
        encoder.encode(password),
        { name: 'PBKDF2' },
        false,
        ['deriveKey']
      );

      key = await crypto.subtle.deriveKey(
        {
          name: 'PBKDF2',
          salt: salt,
          iterations: 100000,
          hash: 'SHA-256'
        },
        keyMaterial,
        { name: ALGORITHM, length: KEY_LENGTH },
        false,
        ['encrypt', 'decrypt']
      );
    } else {
      // Browser-based decryption (default method)
      key = await generateBrowserKey();
    }

    const decrypted = await crypto.subtle.decrypt(
      {
        name: ALGORITHM,
        iv: iv
      },
      key,
      data
    );

    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  } catch (error) {
    console.error('Decryption failed:', error);
    throw new Error('Failed to decrypt token');
  }
}

// Utility functions for base64 conversion
function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToArrayBuffer(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

// Token storage utilities
export function storeEncryptedToken(key, encryptedToken) {
  localStorage.setItem(`github_token_${key}`, encryptedToken);
}

export function getEncryptedToken(key) {
  return localStorage.getItem(`github_token_${key}`);
}

export function removeEncryptedToken(key) {
  localStorage.removeItem(`github_token_${key}`);
}

// No longer needed - using deterministic browser-based keys

// Validate token format (basic check)
export function isValidGitHubToken(token) {
  if (!token || typeof token !== 'string') {
    return false;
  }

  // GitHub tokens should be at least 40 characters
  if (token.length < 40) {
    return false;
  }

  // Should contain only alphanumeric characters and underscores
  const tokenRegex = /^[a-zA-Z0-9_]+$/;
  return tokenRegex.test(token);
}

// Generate a simple hash for token identification (not for security)
export function getTokenHash(token) {
  if (!token) return null;
  
  // Simple hash for identification purposes only
  let hash = 0;
  for (let i = 0; i < token.length; i++) {
    const char = token.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36);
}