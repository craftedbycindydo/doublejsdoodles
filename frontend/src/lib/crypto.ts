import CryptoJS from 'crypto-js';

const APP_SALT = process.env.REACT_APP_AUTH_SALT;

if (!APP_SALT) {
  throw new Error('REACT_APP_AUTH_SALT environment variable is required but not set');
}

// Now APP_SALT is guaranteed to be a string, we can use it directly
export function hashPassword(password: string): string {
  const saltedPassword = password + APP_SALT;
  return CryptoJS.SHA256(saltedPassword).toString(CryptoJS.enc.Hex);
}

export function generateAuthHash(username: string, password: string): string {
  // Simple approach: just return the hashed password
  // Backend will verify username and password separately
  return hashPassword(password);
}

export function generateSecureToken(): string {
  return CryptoJS.lib.WordArray.random(32).toString();
}

export function encryptToken(token: string): string {
  // Simple base64 encoding for basic token storage security
  return CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(token + APP_SALT));
}

export function decryptToken(encryptedToken: string): string {
  // Simple base64 decoding
  const decoded = CryptoJS.enc.Base64.parse(encryptedToken).toString(CryptoJS.enc.Utf8);
  return decoded.replace(APP_SALT as string, '');
}