/**
 * GLP-1 France — A/B Testing Engine (client-side)
 *
 * Inclus dans <head> pour eviter le flicker.
 * Assigne les visiteurs de maniere deterministe via FNV-1a hash.
 * Tracke impressions + conversions vers Supabase REST API.
 */
(function() {
  'use strict';

  var SB_URL = 'https://ywekaivgjzsmdocchvum.supabase.co';
  var SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl3ZWthaXZnanpzbWRvY2NodnVtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUzNjQ0MDcsImV4cCI6MjA3MDk0MDQwN30.f2Mo-77InzZHnK1o7bMNs1ZC3DyX7EkPl964ksQTafY';

  // --- Session ID (persistent cookie, 90 days) ---
  function getSessionId() {
    var match = document.cookie.match(/(?:^|; )ab_uid=([^;]*)/);
    if (match) return match[1];
    var uid = 'ab_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
    document.cookie = 'ab_uid=' + uid + '; path=/; max-age=' + (90 * 86400) + '; SameSite=Lax';
    return uid;
  }

  // --- FNV-1a hash for deterministic assignment ---
  function fnv1a(str) {
    var hash = 0x811c9dc5;
    for (var i = 0; i < str.length; i++) {
      hash ^= str.charCodeAt(i);
      hash = (hash * 0x01000193) >>> 0;
    }
    return hash;
  }

  // --- Assign variant based on weights ---
  function assignVariant(sessionId, test) {
    var bucket = fnv1a(sessionId + ':' + test.id) % 10000;
    var variants = test.variants || [];
    var cumulative = 0;
    for (var i = 0; i < variants.length; i++) {
      cumulative += (variants[i].weight || 0) * 100; // weight is 0-100, scale to 0-10000
      if (bucket < cumulative) return variants[i].id;
    }
    return variants.length > 0 ? variants[variants.length - 1].id : 'control';
  }

  // --- Supabase REST helper ---
  function sbPost(table, body) {
    try {
      var payload = JSON.stringify(body);
      // Use sendBeacon for non-blocking, or fallback to fetch
      if (navigator.sendBeacon) {
        var blob = new Blob([payload], { type: 'application/json' });
        // sendBeacon doesn't support custom headers, use fetch instead
      }
      fetch(SB_URL + '/rest/v1/' + table, {
        method: 'POST',
        headers: {
          'apikey': SB_KEY,
          'Authorization': 'Bearer ' + SB_KEY,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: payload,
        keepalive: true
      }).catch(function() {}); // Silent fail — never block user experience
    } catch(e) {}
  }

  // --- Cache active tests in sessionStorage (5 min) ---
  function getCachedTests() {
    try {
      var cached = sessionStorage.getItem('ab_tests');
      if (cached) {
        var data = JSON.parse(cached);
        if (data.ts && Date.now() - data.ts < 300000) return data.tests;
      }
    } catch(e) {}
    return null;
  }

  function setCachedTests(tests) {
    try {
      sessionStorage.setItem('ab_tests', JSON.stringify({ ts: Date.now(), tests: tests }));
    } catch(e) {}
  }

  // --- Stored assignments (cookie-based for stickiness) ---
  function getAssignments() {
    try {
      var match = document.cookie.match(/(?:^|; )ab_assign=([^;]*)/);
      if (match) return JSON.parse(decodeURIComponent(match[1]));
    } catch(e) {}
    return {};
  }

  function saveAssignments(assignments) {
    try {
      document.cookie = 'ab_assign=' + encodeURIComponent(JSON.stringify(assignments)) + '; path=/; max-age=' + (90 * 86400) + '; SameSite=Lax';
    } catch(e) {}
  }

  // --- Main engine ---
  var sessionId = getSessionId();
  var assignments = getAssignments();
  var activeTests = []; // populated after fetch

  function matchesPage(pageTarget) {
    var path = window.location.pathname;
    if (pageTarget === '/') return path === '/' || path === '/index.html';
    if (pageTarget.endsWith('*')) {
      return path.startsWith(pageTarget.slice(0, -1));
    }
    return path === pageTarget || path === pageTarget + '/' || path === pageTarget + '/index.html';
  }

  function applyVariants(tests) {
    var path = window.location.pathname;
    var dirty = false;

    for (var i = 0; i < tests.length; i++) {
      var test = tests[i];
      if (test.status !== 'running') continue;
      if (!matchesPage(test.page_target)) continue;

      // Determine variant
      var variantId;
      if (assignments[test.id]) {
        variantId = assignments[test.id];
      } else {
        variantId = assignVariant(sessionId, test);
        assignments[test.id] = variantId;
        dirty = true;
      }

      // Store test info for later use
      activeTests.push({ test: test, variant: variantId });

      // Track impression (deduplicated server-side via unique index)
      sbPost('ab_impressions', {
        test_id: test.id,
        variant_id: variantId,
        session_id: sessionId,
        page_url: path
      });

      // Set data attributes on body for CSS-based variants
      document.documentElement.setAttribute('data-ab-' + test.name, variantId);
    }

    if (dirty) saveAssignments(assignments);
  }

  // --- Public API for tracking conversions ---
  window.abTrack = function(metricName, metadata) {
    for (var i = 0; i < activeTests.length; i++) {
      var at = activeTests[i];
      var test = at.test;
      // Track if this metric matches primary or secondary
      var isRelevant = test.primary_metric === metricName ||
        (test.secondary_metrics && test.secondary_metrics.indexOf(metricName) !== -1);
      if (isRelevant) {
        sbPost('ab_conversions', {
          test_id: test.id,
          variant_id: at.variant,
          session_id: sessionId,
          metric_name: metricName,
          metadata: metadata || {}
        });
      }
    }
  };

  // --- Get current variant for a test (for JS-based DOM changes) ---
  window.abGetVariant = function(testName) {
    for (var i = 0; i < activeTests.length; i++) {
      if (activeTests[i].test.name === testName) return activeTests[i].variant;
    }
    return null;
  };

  // --- Auto-track common conversion events ---
  function setupAutoTracking() {
    // Coach IA open
    var coachToggle = document.getElementById('coach-toggle');
    if (coachToggle) {
      coachToggle.addEventListener('click', function() {
        window.abTrack('coach_open');
      });
    }

    // Newsletter signup — listen for form submissions within newsletter components
    document.addEventListener('submit', function(e) {
      var form = e.target;
      if (form && form.closest && form.closest('.newsletter-capture, .newsletter-form, [data-newsletter]')) {
        window.abTrack('newsletter_signup');
      }
    });

    // Affiliate clicks
    document.addEventListener('click', function(e) {
      var link = e.target.closest ? e.target.closest('a[href]') : null;
      if (!link) return;
      var href = link.getAttribute('href') || '';
      // Track external affiliate links
      if (href.includes('affiliate') || href.includes('aff=') || href.includes('partner') ||
          link.dataset.affiliate || link.classList.contains('affiliate-link')) {
        window.abTrack('affiliate_click', { href: href });
      }
      // Track CTA clicks with data-ab-cta attribute
      if (link.dataset.abCta) {
        window.abTrack('cta_click', { cta: link.dataset.abCta });
      }
    });

    // Track tarifs page visits (premium intent)
    if (window.location.pathname.startsWith('/tarifs')) {
      window.abTrack('tarifs_visit');
    }
  }

  // --- Fetch and apply ---
  var cached = getCachedTests();
  if (cached) {
    applyVariants(cached);
    document.addEventListener('DOMContentLoaded', setupAutoTracking);
  } else {
    fetch(SB_URL + '/rest/v1/ab_tests?status=eq.running&select=*', {
      headers: { 'apikey': SB_KEY, 'Authorization': 'Bearer ' + SB_KEY }
    })
    .then(function(r) { return r.json(); })
    .then(function(tests) {
      setCachedTests(tests);
      applyVariants(tests);
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setupAutoTracking);
      } else {
        setupAutoTracking();
      }
    })
    .catch(function() {}); // Silent fail
  }

})();
