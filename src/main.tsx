import React from 'react';
import ReactDOM from 'react-dom/client';
import { MainApp } from './App';
import { ResumeProvider } from './context/ResumeContext';
import { ToastProvider } from './components/common/Toast';
import { ThemeProvider } from './context/ThemeContext';
import { AdminGatekeeper } from './components/auth/AdminGatekeeper';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <ToastProvider>
        <AdminGatekeeper>
          <ResumeProvider>
            <MainApp />
          </ResumeProvider>
        </AdminGatekeeper>
      </ToastProvider>
    </ThemeProvider>
  </React.StrictMode>
);
