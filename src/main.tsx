import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Supabase password-recovery emails may return to the configured Site URL (/)
// with credentials in the URL fragment. Route that recovery session to the
// CRM before App chooses its initial view, while preserving the fragment so
// the Supabase client can exchange it for the recovery session.
const recoveryHash = new URLSearchParams(window.location.hash.replace(/^#/, ''));
if (recoveryHash.get('type') === 'recovery' && window.location.pathname !== '/admin') {
  window.history.replaceState(null, '', `/admin${window.location.search}${window.location.hash}`);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
