declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
    _fbq?: unknown;
  }
}

const VERIFIED_JEL_META_PIXEL_ID = '1420574480184897';
const pixelId = (import.meta as any).env?.VITE_META_PIXEL_ID?.trim?.() || VERIFIED_JEL_META_PIXEL_ID;

export function initMetaPixel() {
  if (!pixelId || typeof window === 'undefined' || typeof document === 'undefined') return false;
  if (window.fbq) return true;

  const fbq: any = function (...args: any[]) {
    fbq.callMethod ? fbq.callMethod(...args) : fbq.queue.push(args);
  };
  fbq.push = fbq;
  fbq.loaded = true;
  fbq.version = '2.0';
  fbq.queue = [];
  window.fbq = fbq;

  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://connect.facebook.net/en_US/fbevents.js';
  document.head.appendChild(script);

  window.fbq('init', pixelId);
  return true;
}

export function trackMetaPageView() {
  if (initMetaPixel()) window.fbq?.('track', 'PageView');
}

export function trackMetaContact(channel: 'whatsapp' | 'phone' | 'email' | 'form' | 'facebook' | 'instagram' | 'youtube' | 'linkedin') {
  if (!initMetaPixel()) return;
  if (['whatsapp', 'phone', 'email', 'form'].includes(channel)) {
    window.fbq?.('track', 'Contact', { channel });
  } else {
    window.fbq?.('trackCustom', 'SocialOutboundClick', { channel });
  }
}

export function installMetaOutboundTracking() {
  if (typeof document === 'undefined') return () => {};
  const handler = (event: MouseEvent) => {
    const target = event.target as Element | null;
    const anchor = target?.closest?.('a[href]') as HTMLAnchorElement | null;
    if (!anchor) return;
    const href = anchor.href.toLowerCase();
    if (href.includes('wa.me/') || href.includes('whatsapp.com/')) return trackMetaContact('whatsapp');
    if (href.startsWith('tel:')) return trackMetaContact('phone');
    if (href.startsWith('mailto:')) return trackMetaContact('email');
    if (href.includes('facebook.com/')) return trackMetaContact('facebook');
    if (href.includes('instagram.com/')) return trackMetaContact('instagram');
    if (href.includes('youtube.com/')) return trackMetaContact('youtube');
    if (href.includes('linkedin.com/')) return trackMetaContact('linkedin');
  };
  document.addEventListener('click', handler, { capture: true });
  return () => document.removeEventListener('click', handler, { capture: true } as any);
}


export function trackMetaLead(source: 'consultation' | 'student_application' | 'contact_form') {
  if (initMetaPixel()) window.fbq?.('track', 'Lead', { source });
}
