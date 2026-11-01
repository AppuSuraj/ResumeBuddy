import React, { useState, useEffect } from 'react';
import { isAdminAuthenticated, onAdminAuthChange } from '../../services/adminAuthService';
import { useGuestAuth } from '../../hooks/useGuestAuth';
import { GuestGatekeeperModal } from './GuestGatekeeperModal';

interface Props {
  children: React.ReactNode;
}

export const AdminGatekeeper: React.FC<Props> = ({ children }) => {
  const [isAdminAuthed, setIsAdminAuthed] = useState<boolean>(isAdminAuthenticated());
  const { session, loading } = useGuestAuth();

  useEffect(() => {
    setIsAdminAuthed(isAdminAuthenticated());
    const unsubscribe = onAdminAuthChange((authedState) => {
      setIsAdminAuthed(authedState);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // If already authenticated via Admin Master Passcode or Supabase Guest Session, display main application
  if (isAdminAuthed || Boolean(session)) {
    return <>{children}</>;
  }

  // Display unauthenticated gatekeeper modal
  return <GuestGatekeeperModal onBypassDev={() => setIsAdminAuthed(true)} />;
};