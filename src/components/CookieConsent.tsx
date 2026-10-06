import React, { useEffect, useState } from 'react';

const STORAGE_KEY = 'jel_cookie_consent';

export function CookieConsent() {
  const [choice, setChoice] = useState<string | null>(null);

  useEffect(() => {
    try { setChoice(localStorage.getItem(STORAGE_KEY)); } catch { setChoice('declined'); }
  }, []);

  const save = (value: 'accepted' | 'declined') => {
    try { localStorage.setItem(STORAGE_KEY, value); } catch {}
    setChoice(value);
    window.dispatchEvent(new CustomEvent('jel:cookie-consent', { detail: value }));
  };

  if (choice) return null;

  return (
    <div role="dialog" aria-label="Cookie preferences" className="fixed inset-x-4 bottom-4 z-[100] mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-slate-700">
          <strong className="text-slate-950">Cookie preferences</strong>
          <p className="mt-1 leading-6">
            We use essential browser storage to operate the site. With your permission, Meta Pixel may measure page visits and selected enquiry actions.
            {' '}<a className="font-semibold text-emerald-700 underline" href="/cookies/">Cookie Policy</a>
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <button onClick={() => save('declined')} className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700">Decline analytics</button>
          <button onClick={() => save('accepted')} className="rounded-xl bg-emerald-700 px-4 py-2 text-sm font-bold text-white">Accept analytics</button>
        </div>
      </div>
    </div>
  );
}
