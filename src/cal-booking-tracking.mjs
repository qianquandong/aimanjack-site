// Kept self-contained so the exact browser installer can also run in a local, network-free test harness.
// Cal's V2 event omits the deprecated event's attendee data. Treat postMessage as untrusted anyway.
export function installCalBookingTracking(win) {
  const frame = win.document.getElementById('cal-booking-frame');
  if (!frame) return;
  const fallback = win.document.getElementById('cal-booking-link');
  const calOrigin = 'https://cal.com';
  const calPath = '/aimanjack/ai-workflow-call';
  const storageKey = 'amj_cal_booking_complete_v1';
  const maxSeen = 100;
  const seen = new Set();

  function analyticsAllowed() {
    if (!['aimanjack.com', 'www.aimanjack.com'].includes(win.location.hostname)) return false;
    if (win.navigator.globalPrivacyControl === true) return false;
    try { if (win.localStorage.getItem('amj_analytics_off') === '1') return false; } catch (_) {}
    return true;
  }

  // Only campaign tags cross into the iframe/fallback Cal URLs; never forward the page query, manage tokens or form fields.
  // Restricted values also discard email addresses, URLs, control characters and phone-like digit sequences.
  function campaignValue(value) {
    if (typeof value !== 'string') return '';
    if (/[\u0000-\u001f\u007f]/.test(value)) return '';
    value = value.trim();
    if (!/^[\p{L}\p{N}][\p{L}\p{N} _.-]{0,119}$/u.test(value) || /(?:\d[\s().-]*){10,}/.test(value)) return '';
    return value;
  }
  try {
    if (analyticsAllowed()) {
      let firstTouch = {};
      try { firstTouch = JSON.parse(win.sessionStorage.getItem('amj_ft') || '{}') || {}; } catch (_) {}
      const query = new win.URLSearchParams(win.location.search);
      for (const [element, attribute] of [[frame, 'src'], [fallback, 'href']]) {
        if (!element) continue;
        const url = new win.URL(element.getAttribute(attribute));
        if (url.origin !== calOrigin || url.pathname !== calPath) continue;
        let changed = false;
        for (const key of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term']) {
          const value = campaignValue(firstTouch[key]) || campaignValue(query.get(key));
          if (value) { url.searchParams.set(key, value); changed = true; }
        }
        if (changed) element.setAttribute(attribute, url.href);
      }
    }
  } catch (_) {}

  function storedHashes() {
    try {
      const values = JSON.parse(win.sessionStorage.getItem(storageKey) || '[]');
      return Array.isArray(values) ? values.filter((value) => typeof value === 'string' && /^[a-f0-9]{64}$/.test(value)).slice(-maxSeen) : [];
    } catch (_) { return []; }
  }
  storedHashes().forEach((value) => seen.add(value));

  async function trackCompletion(uid) {
    // Hash only for local deduplication. Neither this hash nor the booking UID goes to analytics.
    const bytes = await win.crypto.subtle.digest('SHA-256', new win.TextEncoder().encode(`cal-booking:${uid}`));
    const hash = Array.from(new Uint8Array(bytes), (value) => value.toString(16).padStart(2, '0')).join('');
    if (!analyticsAllowed() || typeof win.amjTrack !== 'function') return;
    // Re-read after the asynchronous digest, including any earlier message in this document.
    storedHashes().forEach((value) => seen.add(value));
    if (seen.has(hash)) return;
    seen.add(hash);
    while (seen.size > maxSeen) seen.delete(seen.values().next().value);
    try { win.sessionStorage.setItem(storageKey, JSON.stringify(Array.from(seen))); } catch (_) {}
    win.amjTrack('booking_complete', {
      booking_provider: 'calcom', event_type: 'ai_workflow_call', location_type: 'phone',
    });
  }

  win.addEventListener('message', (event) => {
    if (!analyticsAllowed() || event.isTrusted !== true || event.origin !== calOrigin || !frame.contentWindow || event.source !== frame.contentWindow) return;
    const message = event.data;
    if (!message || typeof message !== 'object' || Array.isArray(message) ||
        message.originator !== 'CAL' || message.type !== 'bookingSuccessfulV2' ||
        message.namespace !== 'true' || message.fullType !== 'CAL:true:bookingSuccessfulV2') return;
    const booking = message.data;
    if (!booking || typeof booking !== 'object' || Array.isArray(booking) ||
        booking.eventTypeId !== 7521172 || typeof booking.status !== 'string' ||
        booking.status.toUpperCase() !== 'ACCEPTED' || booking.paymentRequired !== false ||
        typeof booking.uid !== 'string' || !/^[A-Za-z0-9_-]{1,128}$/.test(booking.uid)) return;
    trackCompletion(booking.uid).catch(() => {});
  });
}

export const calBookingTrackingScript = `<script>(${installCalBookingTracking.toString()})(window);</script>`;
