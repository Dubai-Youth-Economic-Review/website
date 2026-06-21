/* =============================================================
   Dubai Youth Economics Review — shared site script
   - Injects the shared header + footer into placeholders so the
     chrome lives in ONE place (this file).
   - Wires the mobile menu, announcement ticker and back-to-top.
   Loaded synchronously in <head>; each page calls DYER.header()
   and DYER.footer() inline right after their placeholder elements
   so the chrome is injected during parse (no flash, no layout shift).
   ============================================================= */
(function (window, document) {
  'use strict';

  /* Work out which nav item should be marked active from the path. */
  function activePage() {
    var path = window.location.pathname.replace(/\/+$/, '').replace(/\.html$/, '');
    var seg = path.substring(path.lastIndexOf('/') + 1).toLowerCase();
    if (seg === '' || seg === 'index') return 'home';
    if (seg === 'article') {
      return new URLSearchParams(window.location.search).has('legacy') ? 'legacy' : 'articles';
    }
    return seg; // articles | legacy | about
  }

  function navLink(href, key, label, active) {
    return '<a href="' + href + '"' + (key === active ? ' class="active"' : '') + '>' + label + '</a>';
  }

  function headerHTML(active) {
    return '' +
      '<div class="announce-bar">' +
        '<span class="ticker-item ticker-active">Student Publication &middot; Est. 2021</span>' +
        '<span class="ticker-item">New articles regularly</span>' +
        '<span class="ticker-item">dubaiyoutheconomicsreview@gmail.com</span>' +
      '</div>' +
      '<div class="container top">' +
        '<div class="brand">' +
          '<a href="/" class="brand-badge">D</a>' +
          '<div class="brand-text">' +
            '<span class="mast">Dubai Youth Economics Review</span>' +
            '<span class="tagline">Est. 2021 &middot; Student Publication</span>' +
          '</div>' +
        '</div>' +
        '<button id="menuToggle" class="menu-toggle" aria-expanded="false" aria-label="Toggle menu">&#9776;</button>' +
        '<nav id="siteNav" aria-label="Main navigation">' +
          navLink('/', 'home', 'Home', active) +
          navLink('/articles', 'articles', 'Articles', active) +
          navLink('/legacy', 'legacy', 'Legacy', active) +
          navLink('/about', 'about', 'About', active) +
        '</nav>' +
      '</div>';
  }

  function footerHTML() {
    return '' +
      '<div class="container footer-top">' +
        '<section class="footer-about" aria-label="About the publication">' +
          '<h3>Dubai Youth Economics Review</h3>' +
          '<p>Student-led economic journalism &mdash; researched, written, and edited entirely by students since 2021. Independent, curious, and committed to the truth.</p>' +
          '<div class="footer-badge">' +
            '<div class="footer-badge-icon" style="background:#C1121F;font-family:\'Merriweather\',Georgia,serif;font-weight:900;font-size:16px;color:#fff;display:flex;align-items:center;justify-content:center;border-radius:3px;width:32px;height:32px;flex-shrink:0;">D</div>' +
            '<span>Student Publication&ensp;&middot;&ensp;Est. 2021</span>' +
          '</div>' +
        '</section>' +
        '<nav class="footer-nav" aria-label="Footer navigation">' +
          '<h3>Quick Links</h3>' +
          '<div class="footer-nav-lists">' +
            '<div>' +
              '<h4>Sections</h4>' +
              '<ul>' +
                '<li><a href="/">Home</a></li>' +
                '<li><a href="/articles">Articles</a></li>' +
                '<li><a href="/legacy">Legacy</a></li>' +
                '<li><a href="/about">About</a></li>' +
              '</ul>' +
            '</div>' +
            '<div>' +
              '<h4>Resources</h4>' +
              '<ul>' +
                '<li><a href="/legacy">Archive</a></li>' +
                '<li><a href="/about">Masthead</a></li>' +
                '<li><a href="/about#contactForm">Contact</a></li>' +
              '</ul>' +
            '</div>' +
          '</div>' +
        '</nav>' +
      '</div>' +
      '<div class="footer-bottom">' +
        '<div class="container footer-bottom-inner">' +
          '<div class="footer-contact">' +
            '<span>&#128231; dubaiyoutheconomicsreview@gmail.com</span>' +
          '</div>' +
          '<div class="footer-policies">' +
            '<a href="/sitemap.xml">Sitemap</a>' +
          '</div>' +
          '<div class="footer-copyright">' +
            '&copy; 2026 Dubai Youth Economics Review. All rights reserved.' +
          '</div>' +
        '</div>' +
      '</div>';
  }

  /* Build a slug-based article URL with a graceful fallback to the
     legacy index-based scheme when an entry has no slug yet. */
  function articleHref(entry, idx, isLegacy) {
    if (entry && entry.slug) {
      return '/article?slug=' + encodeURIComponent(entry.slug) + (isLegacy ? '&legacy=1' : '');
    }
    return '/article?' + (isLegacy ? 'legacy=' : 'id=') + idx;
  }

  var DYER = {
    header: function (active) {
      var el = document.getElementById('siteHeader');
      if (el) el.innerHTML = headerHTML(active || activePage());
    },
    footer: function () {
      var el = document.getElementById('siteFooter');
      if (el) el.innerHTML = footerHTML();
    },
    articleHref: articleHref
  };
  window.DYER = DYER;

  /* Shared behaviours — run once the DOM (incl. injected chrome) is ready. */
  document.addEventListener('DOMContentLoaded', function () {
    // Mobile menu toggle
    var menuToggle = document.getElementById('menuToggle');
    var siteNav = document.getElementById('siteNav');
    if (menuToggle && siteNav) {
      menuToggle.addEventListener('click', function () {
        var expanded = menuToggle.getAttribute('aria-expanded') === 'true';
        menuToggle.setAttribute('aria-expanded', String(!expanded));
        siteNav.classList.toggle('nav-open');
        menuToggle.innerHTML = expanded ? '&#9776;' : '&#10005;';
      });
      siteNav.querySelectorAll('a').forEach(function (link) {
        link.addEventListener('click', function () {
          siteNav.classList.remove('nav-open');
          menuToggle.setAttribute('aria-expanded', 'false');
          menuToggle.innerHTML = '&#9776;';
        });
      });
      document.addEventListener('click', function (e) {
        if (!siteNav.contains(e.target) && !menuToggle.contains(e.target) && siteNav.classList.contains('nav-open')) {
          siteNav.classList.remove('nav-open');
          menuToggle.setAttribute('aria-expanded', 'false');
          menuToggle.innerHTML = '&#9776;';
        }
      });
    }

    // Announcement ticker rotation
    (function () {
      var items = document.querySelectorAll('.ticker-item');
      var i = 0;
      if (items.length > 1) {
        setInterval(function () {
          items[i].classList.remove('ticker-active');
          i = (i + 1) % items.length;
          items[i].classList.add('ticker-active');
        }, 3000);
      }
    })();

    // Back-to-top button (create if a page hasn't supplied one)
    var backToTop = document.getElementById('backToTop');
    if (!backToTop) {
      backToTop = document.createElement('button');
      backToTop.id = 'backToTop';
      backToTop.setAttribute('aria-label', 'Back to top');
      backToTop.innerHTML = '&uarr;';
      document.body.appendChild(backToTop);
    }
    window.addEventListener('scroll', function () {
      backToTop.style.opacity = window.scrollY > 400 ? '1' : '0';
    }, { passive: true });
    backToTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });
})(window, document);
