import FingerprintJS from '@fingerprintjs/fingerprintjs';
import { supabase } from '../lib/supabase';

/**
 * Generate a stable fingerprint using FingerprintJS and store it in localStorage
 */
export async function getOrCreateFingerprint() {
  const stored = localStorage.getItem('fingerprint');
  if (stored) return stored;

  const fp = await FingerprintJS.load();
  const result = await fp.get();
  const id = result.visitorId;

  localStorage.setItem('fingerprint', id);
  return id;
}

/**
 * Return a persistent deviceId (UUIDv4), stored in localStorage
 */
export function getOrCreateDeviceId() {
  let id = localStorage.getItem('deviceId');
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem('deviceId', id);
  }
  return id;
}

/**
 * Returns a stable fingerprint + device ID payload for use in any API
 */
export async function getDevicePayload() {
  return {
    fingerprint: await getOrCreateFingerprint(),
    deviceId: getOrCreateDeviceId()
  };
}

/**
 * Get the user's current auth token (session-based)
 */
export async function getAuthToken() {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error || !session) throw new Error("Not authenticated");
  return session.access_token;
}
