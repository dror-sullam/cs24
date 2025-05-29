import sha256 from 'crypto-js/sha256';
import { supabase } from '../lib/supabase';

/**
 * Generate a fingerprint string from device/browser properties
 */
export function generateFingerprint() {
  const props = [
    navigator.userAgent,
    navigator.language,
    navigator.platform,
    navigator.hardwareConcurrency || 'unknown',
    window.screen.width,
    window.screen.height,
    new Date().getTimezoneOffset(),
    navigator.cookieEnabled ? 'cookies-enabled' : 'cookies-disabled',
    navigator.doNotTrack || 'unknown'
  ];
  return sha256(props.join('|')).toString();
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
export function getDevicePayload() {
  return {
    fingerprint: generateFingerprint(),
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