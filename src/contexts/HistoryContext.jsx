import React, { createContext, useContext, useState, useEffect } from 'react';
import { sanitizeContent, safeStoreData, safeGetData } from '../utils/security';

const HistoryContext = createContext();

export const useHistory = () => {
  const context = useContext(HistoryContext);
  if (!context) {
    throw new Error('useHistory must be used within a HistoryProvider');
  }
  return context;
};

export const HistoryProvider = ({ children }) => {
  const [scannedHistory, setScannedHistory] = useState(() => {
    return safeGetData('quickqr-scanned', []);
  });

  const [generatedHistory, setGeneratedHistory] = useState(() => {
    return safeGetData('quickqr-generated', []);
  });

  useEffect(() => {
    safeStoreData('quickqr-scanned', scannedHistory);
  }, [scannedHistory]);

  useEffect(() => {
    safeStoreData('quickqr-generated', generatedHistory);
  }, [generatedHistory]);

  const addScannedItem = (item) => {
    // Sanitize content before storing
    const sanitizedItem = {
      id: `scan_${Date.now()}`,
      timestamp: new Date().toISOString(),
      content: sanitizeContent(item.content || ''),
      title: sanitizeContent(item.title || ''),
      type: item.type || 'text'
    };
    
    // Limit history size to prevent localStorage abuse
    setScannedHistory(prev => [sanitizedItem, ...prev].slice(0, 50));
  };

  const addGeneratedItem = (item) => {
    // Sanitize content before storing
    const sanitizedItem = {
      id: `gen_${Date.now()}`,
      timestamp: new Date().toISOString(),
      content: sanitizeContent(item.content || ''),
      title: sanitizeContent(item.title || ''),
      type: item.type || 'text',
      qrCode: item.qrCode // QR code data URL is safe as it's generated client-side
    };
    
    // Limit history size to prevent localStorage abuse
    setGeneratedHistory(prev => [sanitizedItem, ...prev].slice(0, 50));
  };

  const deleteScannedItem = (id) => {
    setScannedHistory(prev => prev.filter(item => item.id !== id));
  };

  const deleteGeneratedItem = (id) => {
    setGeneratedHistory(prev => prev.filter(item => item.id !== id));
  };

  const clearScannedHistory = () => {
    setScannedHistory([]);
  };

  const clearGeneratedHistory = () => {
    setGeneratedHistory([]);
  };

  return (
    <HistoryContext.Provider
      value={{
        scannedHistory,
        generatedHistory,
        addScannedItem,
        addGeneratedItem,
        deleteScannedItem,
        deleteGeneratedItem,
        clearScannedHistory,
        clearGeneratedHistory
      }}
    >
      {children}
    </HistoryContext.Provider>
  );
};