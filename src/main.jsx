import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { LangProvider } from './utils/lang.jsx';
import { AuthProvider } from './auth/AuthProvider.jsx';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <LangProvider>
        <App />
      </LangProvider>
    </AuthProvider>
  </StrictMode>
);
