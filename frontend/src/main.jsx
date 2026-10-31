import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="top-right"
        gutter={8}
        toastOptions={{
          duration: 3500,
          style: {
            background: '#111d40',
            color: '#f0f4ff',
            border: '1px solid rgba(255,255,255,0.10)',
            borderRadius: '12px',
            fontSize: '0.875rem',
            fontFamily: 'Inter, sans-serif',
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
            padding: '12px 16px'
          },
          success: {
            iconTheme: { primary: '#34d399', secondary: '#111d40' }
          },
          error: {
            iconTheme: { primary: '#fb7185', secondary: '#111d40' }
          }
        }}
      />
    </BrowserRouter>
  </React.StrictMode>
);
