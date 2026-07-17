/*
 * Diffle cross-domain stats migration — OLD SITE transfer script.
 *
 * Diffle moved to diffle.com. localStorage is origin-scoped, so the new
 * site can't read a returning player's saved stats directly. This script reads
 * them here, bundles them into a base64url URL fragment, and redirects to
 * diffle.com, which decodes and merges them.
 *
 * Loaded by two pages on this origin:
 *   - index.html    — the SEO landing page; a normal visit (an old bookmark) is
 *                     a "push". The script runs first in <head> and navigates
 *                     before the meta-refresh fallback matters.
 *   - transfer.html — a JS-only page the NEW site navigates to (?dfpull=1) when
 *                     it wants the data for a returning player. No meta tag, so
 *                     nothing competes with this script — the "sure thing" pull.
 *
 * For LOCAL TESTING ONLY, a page may set window.__DF_TARGET__ before this loads
 * to override the destination origin. In production it's never set, so we
 * always target the real new site.
 */
(function () {
  'use strict';

  var TARGET =
    (typeof window !== 'undefined' && window.__DF_TARGET__) ||
    'https://diffle.com/';

  // Keys the legacy site persists. diffle_play travels too so today's
  // in-progress (or completed) game carries over — the daily answer is
  // derived identically on both sites, so the new site can adopt it.
  var KEYS = ['diffle_play', 'diffle_stats'];

  function base64url(str) {
    // Plain btoa, symmetric with the new site's decoder (atob + JSON.parse).
    // Payload is JSON over Diffle's ASCII stats keys/lowercase words, so btoa
    // is safe; then make it URL-fragment safe.
    return btoa(str)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  }

  function buildPayload() {
    var payload = {};
    for (var i = 0; i < KEYS.length; i++) {
      var key = KEYS[i];
      try {
        var raw = window.localStorage.getItem(key);
        if (raw === null) continue;
        // Both keys hold JSON objects. Parse so the new site receives real
        // values, not strings; ship raw as a fallback if somehow unparsable.
        try {
          payload[key === 'diffle_play' ? 'play' : 'stats'] = JSON.parse(raw);
        } catch (e) {
          payload[key === 'diffle_play' ? 'play' : 'stats'] = raw;
        }
      } catch (e) {
        // localStorage unavailable (private mode, blocked) — skip this key.
      }
    }
    return payload;
  }

  function go() {
    var url = TARGET;
    try {
      var payload = buildPayload();
      // Only attach a fragment if we actually have something to carry.
      if (Object.keys(payload).length > 0) {
        url = TARGET + '#dftransfer=' + base64url(JSON.stringify(payload));
      }
    } catch (e) {
      // Any failure: still send the player to the new site, just without data.
    }
    // replace() so the old URL isn't left in history (no back-button trap).
    window.location.replace(url);
  }

  // An explicit pull (the new site sent the player here via ?dfpull=1) must
  // ALWAYS bundle and return the data, even if this origin was already visited
  // this session.
  var isPull = window.location.search.indexOf('dfpull=1') !== -1;
  // For a normal (push) visit, guard against a pathological redirect loop
  // within a session. Normal flow leaves this origin entirely, so this never
  // trips; the pull path skips it so a deliberate request always gets its data.
  if (!isPull) {
    try {
      if (window.sessionStorage.getItem('dfRedirected')) {
        window.location.replace(TARGET);
        return;
      }
      window.sessionStorage.setItem('dfRedirected', '1');
    } catch (e) {
      // sessionStorage unavailable — proceed anyway.
    }
  }

  go();
})();
