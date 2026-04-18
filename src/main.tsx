import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import App from './App.tsx';
import './index.css';

// Global error handler to catch and identify the source of "supabaseUrl is required"
window.addEventListener('error', (event) => {
  if (event.message?.includes('supabaseUrl is required')) {
    console.group('CRITICAL ERROR CAUGHT: Supabase Initialization');
    console.error('An attempt was made to initialize Supabase with missing credentials.');
    console.log('Error Source:', event.filename, 'Line:', event.lineno);
    console.groupEnd();
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
);
