import { useState } from 'react';
import { Lock, KeyRound } from 'lucide-react';
import { ACCESS_GATE_ENABLED, ACCESS_CODE_HASH } from '../config.js';
import { trackEvent } from '../lib/analytics.js';

// Persisted unlock flag. Once unlocked on a device, the gate stays open.
const UNLOCK_KEY = 'bmsMasteryUnlocked';

/** SHA-256 of a string as lowercase hex (matches scripts/make-access-code.mjs). */
async function sha256Hex(text) {
  const buf = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(text),
  );
  return [...new Uint8Array(buf)]
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Shared access-code lock. While ACCESS_GATE_ENABLED is true, the app is
 * hidden behind a code screen until the visitor enters the correct code
 * (verified against a SHA-256 hash). The unlock is remembered on the device.
 */
export function AccessGate({ children }) {
  const [unlocked, setUnlocked] = useState(
    () =>
      !ACCESS_GATE_ENABLED || localStorage.getItem(UNLOCK_KEY) === 'true',
  );
  const [code, setCode] = useState('');
  const [error, setError] = useState(false);
  const [checking, setChecking] = useState(false);

  if (unlocked) return <>{children}</>;

  const submit = async (e) => {
    e.preventDefault();
    const value = code.trim();
    if (!value || checking) return;
    setChecking(true);
    setError(false);
    const hash = await sha256Hex(value);
    if (hash === ACCESS_CODE_HASH) {
      localStorage.setItem(UNLOCK_KEY, 'true');
      trackEvent('access-attempt-success');
      setUnlocked(true);
    } else {
      trackEvent('access-attempt-failed');
      setError(true);
      setChecking(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-5">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-7 shadow-2xl">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500 text-slate-950">
          <Lock size={22} />
        </div>
        <h1 className="mt-4 text-center text-lg font-extrabold tracking-tight text-white">
          <span className="text-cyan-400">BMS</span> Mastery
        </h1>
        <p className="mt-1 text-center text-sm text-slate-400">
          This is a private preview. Enter your access code to continue.
        </p>

        <form onSubmit={submit} className="mt-5">
          <div className="relative">
            <KeyRound
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
            />
            <input
              type="password"
              autoFocus
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
                setError(false);
              }}
              placeholder="Access code"
              className={`w-full rounded-lg border bg-slate-950 py-2.5 pl-9 pr-3 text-sm text-slate-100 outline-none focus:ring-2 ${
                error
                  ? 'border-rose-500 focus:ring-rose-500/30'
                  : 'border-slate-700 focus:border-cyan-500 focus:ring-cyan-500/30'
              }`}
            />
          </div>
          {error && (
            <p className="mt-2 text-xs font-medium text-rose-400">
              That code is not correct. Please check and try again.
            </p>
          )}
          <button
            type="submit"
            disabled={checking || !code.trim()}
            className="mt-3 w-full rounded-lg bg-cyan-500 py-2.5 text-sm font-bold text-slate-950 hover:bg-cyan-400 disabled:opacity-50 transition"
          >
            {checking ? 'Checking…' : 'Unlock'}
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-slate-600">
          Need a code? Contact the BMS Mastery team.
        </p>
      </div>
    </div>
  );
}
