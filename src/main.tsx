import React from 'react';
import ReactDOM from 'react-dom/client';
import { MainApp } from './App';
import { ResumeProvider } from './context/ResumeContext';
import { ToastProvider } from './components/common/Toast';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ToastProvider>
      <ResumeProvider>
        <MainApp />
      </ResumeProvider>
    </ToastProvider>
  </React.StrictMode>
);
