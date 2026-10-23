// ---------------------------------------------------------------------------
// Tiny hash router: URLs look like  #/analyze  or  #/simulator/bank-kyc
// Using the hash means the app works from any static host with no server
// configuration, and the browser Back button works.
// ---------------------------------------------------------------------------

import { useEffect, useState } from 'react';

export const PAGES = ['overview', 'analyze', 'xray', 'simulator', 'history', 'act', 'privacy'];
// Sign-in screens. These are shown instead of the app shell (see App.jsx).
export const AUTH_PAGES = ['login', 'signup', 'forgot'];

export function parseHash(hash) {
  const parts = String(hash || '')
    .slice(0, 200)
    .replace(/^#\/?/, '')
    .split('/')
    .filter(Boolean);
  const page = PAGES.includes(parts[0]) || AUTH_PAGES.includes(parts[0]) ? parts[0] : 'overview';
  const param = parts[1] && /^[A-Za-z0-9_-]{1,60}$/.test(parts[1]) ? parts[1] : null;
  return { page, param };
}

export function navigate(page, param) {
  const target = `#/${page}${param ? `/${param}` : ''}`;
  if (window.location.hash !== target) window.location.hash = target;
}

export function useHashRoute() {
  const [route, setRoute] = useState(() => parseHash(window.location.hash));
  useEffect(() => {
    const onChange = () => {
      setRoute(parseHash(window.location.hash));
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return route;
}
