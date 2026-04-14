
import { createContext, useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/contexts/ToastContext';
import { serviceApi } from '@/lib/api/service';
import { getStoredClientName } from '@/lib/clientNameStorage';

interface ServiceContextType {
  isServiceEnabled: boolean;
  isConnected: boolean;
  clientName: string;
  toggleService: () => Promise<void>;
  setClientName: (name: string) => void;
  isTogglingService: boolean;
}

export const ServiceContext = createContext<ServiceContextType | undefined>(undefined);

const ENABLE_TIMEOUT_MS = 5000;

export function ServiceProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const { showToast } = useToast();

  const [isServiceEnabled, setIsServiceEnabled] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [clientName, setClientName] = useState('desktop-client');
  const [isTogglingService, setIsTogglingService] = useState(false);

  const enableTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isRegisteredRef = useRef(false);

  // Initialize: Load client name
  useEffect(() => {
    const initialize = async () => {
      if (window.electronAPI) {
        const result = await window.electronAPI.getClientName();
        if (result.success && result.clientName) {
          setClientName(result.clientName);
        }
      } else {
        const saved = getStoredClientName();
        if (saved) setClientName(saved);
      }
    };
    initialize();
  }, []);

  // Register client when authenticated
  useEffect(() => {
    if (isAuthLoading) return;
    if (!isAuthenticated) {
      setIsConnected(false);
      isRegisteredRef.current = false;
      return;
    }

    const registerClient = async () => {
      if (!clientName) return;
      if (!window.electronAPI) return;
      if (isRegisteredRef.current) return; // Already registered

      try {
        const webhookUrl = await window.electronAPI.getWebhookUrl();
        await serviceApi.registerClient(clientName, webhookUrl);
        await window.electronAPI.storeClientName(clientName);
        setIsConnected(true);
        isRegisteredRef.current = true;
        console.log(`Client ${clientName} registered`);
      } catch (error: any) {
        console.error('Failed to register client:', error);
        setIsConnected(false);
        isRegisteredRef.current = false;
      }
    };

    registerClient();
  }, [clientName, isAuthenticated, isAuthLoading]);

  // Cleanup: Deregister on unmount, logout, or window close
  useEffect(() => {
    if (!isAuthenticated || !isConnected) return;

    const deregisterClient = async () => {
      if (!isRegisteredRef.current) return;

      try {
        console.log(`Deregistering client ${clientName}...`);
        await serviceApi.deregisterClient(clientName);
        isRegisteredRef.current = false;
        console.log(`Client ${clientName} deregistered`);
      } catch (error) {
        console.error('Failed to deregister client:', error);
      }
    };

    // Handle page unload (refresh, close tab, navigate away)
    const handleBeforeUnload = () => {
      if (isRegisteredRef.current && window.electronAPI) {
        window.electronAPI.deregisterClient();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    // Cleanup on unmount (logout, component unmount)
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      deregisterClient();
    };
  }, [clientName, isAuthenticated, isConnected]);

  // Listen for service status changes via webhook
  useEffect(() => {
    if (!window.electronAPI) return;

    const handleServiceStatusChanged = (status: { enabled: boolean }) => {
      console.log('[Service] Status webhook:', status.enabled ? 'ENABLED' : 'DISABLED');

      if (enableTimeoutRef.current) {
        clearTimeout(enableTimeoutRef.current);
        enableTimeoutRef.current = null;
      }

      setIsServiceEnabled(status.enabled);
      setIsTogglingService(false);
    };

    const cleanup = window.electronAPI.onServiceStatusChanged(handleServiceStatusChanged);

    // Cleanup function to remove listener
    return () => {
      if (cleanup) cleanup();
    };
  }, []);

  const toggleService = useCallback(async () => {
    setIsTogglingService(true);

    try {
      if (isServiceEnabled) {
        await serviceApi.disable();
      } else {
        await serviceApi.enable();

        enableTimeoutRef.current = setTimeout(() => {
          console.error('[Service] Enable timeout - no webhook received');
          setIsTogglingService(false);
          showToast('Service failed to enable - no response from backend', 'error');
        }, ENABLE_TIMEOUT_MS);
      }
    } catch (error) {
      console.error('Failed to toggle service:', error);
      setIsTogglingService(false);
      showToast('Failed to communicate with backend', 'error');
    }
  }, [isServiceEnabled, showToast]);

  return (
    <ServiceContext.Provider
      value={{
        isServiceEnabled,
        isConnected,
        clientName,
        toggleService,
        setClientName,
        isTogglingService,
      }}
    >
      {children}
    </ServiceContext.Provider>
  );
}