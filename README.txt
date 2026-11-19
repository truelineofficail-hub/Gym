GYM · 90 Day Build  (offline PWA)

FILES
  index.html  style.css  app.js  manifest.json  sw.js  icons/

RUN IT
  A service worker needs https:// or localhost (it will not run from file://).
  Easiest local test:   python3 -m http.server 8000   ->  open http://localhost:8000
  Free hosting: drag the folder onto Netlify Drop, or push to GitHub Pages / Cloudflare Pages.

INSTALL ON PHONE
  Open the hosted link once while online (this caches everything), then
  Android Chrome: menu > Install app      iPhone Safari: Share > Add to Home Screen
  After that it opens and works with no internet.

FONTS
  Fonts load from Google Fonts on the first online visit and are cached for offline use.
  Before that (or if never loaded) the app falls back to Arial Black / Impact.

UPDATING
  If you change any file, bump VERSION in sw.js (e.g. gym-v2) so phones refresh the cache.

Your progress is saved on the device (localStorage).
