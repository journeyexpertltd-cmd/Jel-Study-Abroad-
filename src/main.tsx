import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Admin recovery emails may still return to the Supabase Site URL (/).
// Route only root recovery sessions to /admin before React chooses its view.
// Student recovery links explicitly target /student-portal and must remain there.
const recoveryHash = new URLSearchParams(window.location.hash.replace(/^#/, ''));
if (recoveryHash.get('type') === 'recovery' && window.location.pathname === '/') {
  window.history.replaceState(null, '', `/admin${window.location.search}${window.location.hash}`);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
