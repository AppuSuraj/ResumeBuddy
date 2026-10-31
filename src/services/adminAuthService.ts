// Secure Client-Side Admin Authentication Service using Web Crypto API SHA-256

const ADMIN_HASH_KEY = 'resumebuddy_admin_hash_v1';
const ADMIN_SESSION_KEY = 'resumebuddy_admin_auth_token_v1';
const ADMIN_REMEMBER_KEY = 'resumebuddy_admin_remember_token_v1';

/**
 * Computes a cryptographic SHA-256 hex digest for a given plaintext string.
 */
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password.trim());
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Checks whether an admin master password has been configured on this browser.
 */
export function isMasterPasswordConfigured(): boolean {
  return Boolean(localStorage.getItem(ADMIN_HASH_KEY));
}

/**
 * Sets the initial master password hash.
 */
export async function setMasterPassword(password: string): Promise<void> {
  const hash = await hashPassword(password);
  localStorage.setItem(ADMIN_HASH_KEY, hash);
}

/**
 * Verifies if the entered password matches the stored SHA-256 hash.
 */
export async function verifyMasterPassword(password: string): Promise<boolean> {
  const storedHash = localStorage.getItem(ADMIN_HASH_KEY);
  if (!storedHash) return false;
  const inputHash = await hashPassword(password);
  return storedHash === inputHash;
}

/**
 * Changes the master password if current password verification succeeds.
 */
export async function changeMasterPassword(
  currentPass: string,
  newPass: string
): Promise<{ success: boolean; message: string }> {
  const isMatch = await verifyMasterPassword(currentPass);
  if (!isMatch) {
    return { success: false, message: 'Current master password is incorrect.' };
  }
  if (!newPass || newPass.trim().length < 4) {
    return { success: false, message: 'New password must be at least 4 characters.' };
  }
  const newHash = await hashPassword(newPass);
  localStorage.setItem(ADMIN_HASH_KEY, newHash);
  return { success: true, message: 'Master admin password updated successfully.' };
}

/**
 * Checks if the current admin session is actively authenticated.
 */
export function isAdminAuthenticated(): boolean {
  // Check session storage (active browser tab session)
  const sessionToken = sessionStorage.getItem(ADMIN_SESSION_KEY);
  if (sessionToken === 'authenticated') return true;

  // Check persistent remember token in local storage (valid for 30 days)
  const rememberToken = localStorage.getItem(ADMIN_REMEMBER_KEY);
  if (rememberToken) {
    try {
      const parsed = JSON.parse(rememberToken);
      if (parsed && parsed.expiry && Date.now() < parsed.expiry) {
        return true;
      } else {
        localStorage.removeItem(ADMIN_REMEMBER_KEY);
      }
    } catch {
      localStorage.removeItem(ADMIN_REMEMBER_KEY);
    }
  }

  return false;
}

/**
 * Notifies the app of admin auth state changes.
 */
export function notifyAuthChange(): void {
  const isAuthed = isAdminAuthenticated();
  window.dispatchEvent(
    new CustomEvent('resumebuddy_admin_auth_changed', {
      detail: { isAuthenticated: isAuthed },
    })
  );
}

/**
 * Subscribes to admin auth state changes.
 */
export function onAdminAuthChange(callback: (isAuthed: boolean) => void): () => void {
  const handler = () => {
    callback(isAdminAuthenticated());
  };
  window.addEventListener('resumebuddy_admin_auth_changed', handler);
  return () => {
    window.removeEventListener('resumebuddy_admin_auth_changed', handler);
  };
}

/**
 * Records an active authenticated session.
 */
export function setAdminAuthenticated(rememberDevice: boolean): void {
  sessionStorage.setItem(ADMIN_SESSION_KEY, 'authenticated');

  if (rememberDevice) {
    const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
    const rememberData = {
      authenticated: true,
      expiry: Date.now() + thirtyDaysMs,
    };
    localStorage.setItem(ADMIN_REMEMBER_KEY, JSON.stringify(rememberData));
  } else {
    localStorage.removeItem(ADMIN_REMEMBER_KEY);
  }
  notifyAuthChange();
}

/**
 * Locks the workspace by clearing active session and persistent credentials.
 */
export function logoutAdmin(): void {
  sessionStorage.removeItem(ADMIN_SESSION_KEY);
  localStorage.removeItem(ADMIN_REMEMBER_KEY);
  notifyAuthChange();
}
