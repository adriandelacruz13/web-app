import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import { initTrackingSdk } from './utils/tracking.js'

/**
 * Load Google Fonts non-blocking so the render-blocking stylesheet never
 * delays First Contentful Paint. The stylesheet activates on load/error
 * and relies on display=swap (already in the Google Fonts URL) so text
 * renders in the system fallback first, then swaps in the webfont.
 */
function loadWebFonts() {
  if (typeof document === 'undefined') return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href =
    'https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap';
  link.media = 'print'; // non-blocking while fetching
  link.onload = () => {
    link.media = 'all';
  };
  document.head.appendChild(link);
}

// Start the font + tracking SDks off the critical path (non-blocking).
loadWebFonts();
initTrackingSdk();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)