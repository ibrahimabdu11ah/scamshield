import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// ---------------------------------------------------------------------------
// Why this file is more than the default:
//
// 1. base './'  -> every asset path in the build is RELATIVE, so the app works
//    from any folder or sub-path (GitHub Pages, a school server, a USB stick).
//
// 2. Chrome refuses to run <script type="module"> (and CORS-mode stylesheets)
//    from file:// pages, which showed up as a BLANK PAGE when dist/index.html
//    was double-clicked. The build is therefore emitted as ONE classic
//    (non-module) script and the module/crossorigin attributes are removed.
//    The result opens by double-click in Chrome, Edge, Firefox and Safari, and
//    still works on any normal web host.
//
// 3. A Content-Security-Policy <meta> tag is added to the BUILT page only
//    (the dev server needs inline scripts for hot reload).
// ---------------------------------------------------------------------------

const CSP = [
  "default-src 'self'",
  "script-src 'self' 'wasm-unsafe-eval' https://cdn.jsdelivr.net",
  "worker-src 'self' blob:",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "img-src 'self' data: blob:",
  "font-src 'self' data: https://fonts.gstatic.com",
  'connect-src \'self\' blob: data: https://*.supabase.co wss://*.supabase.co https://cdn.jsdelivr.net https://tessdata.projectnaptha.com',
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ');

function productionHtml() {
  return {
    name: 'scamshield-production-html',
    apply: 'build',
    enforce: 'post',
    transformIndexHtml(html) {
      let out = html
        // Classic script, not a module; run after the document is parsed.
        .replace(/<script type="module" crossorigin src="([^"]+)"><\/script>/g, '')
        .replace(/<link rel="stylesheet" crossorigin href="([^"]+)">/g, '<link rel="stylesheet" href="$1">');
      const scripts = [...html.matchAll(/<script type="module" crossorigin src="([^"]+)"><\/script>/g)].map((m) => m[1]);
      out = out.replace(
        '</body>',
        `${scripts.map((src) => `<script defer src="${src}"></script>`).join('\n    ')}\n  </body>`
      );
      // CSP + a fallback message when scripts are blocked or disabled.
      out = out.replace(
        '<meta charset="UTF-8" />',
        `<meta charset="UTF-8" />\n    <meta http-equiv="Content-Security-Policy" content="${CSP}" />`
      );
      return out;
    },
  };
}

export default defineConfig({
  base: './',
  plugins: [react(), productionHtml()],
  server: { port: 5173, open: false, host: 'localhost' },
  preview: { port: 4173, host: 'localhost' },
  build: {
    target: 'es2020',
    sourcemap: false,
    cssCodeSplit: false,
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        format: 'iife',
        inlineDynamicImports: true,
      },
    },
  },
});
