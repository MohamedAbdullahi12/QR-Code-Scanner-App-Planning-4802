import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useHistory } from '../contexts/HistoryContext';
import { format } from 'date-fns';

const { FiArrowLeft, FiTrash2, FiCopy, FiShare2, FiExternalLink, FiAlertCircle } = FiIcons;

const History = () => {
  const [activeTab, setActiveTab] = useState('scanned');
  const [copied, setCopied] = useState(null);
  const { 
    scannedHistory, 
    generatedHistory, 
    deleteScannedItem, 
    deleteGeneratedItem,
    clearScannedHistory,
    clearGeneratedHistory 
  } = useHistory();

  const handleCopy = async (content, id) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(id);
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleShare = async (item) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'QuickQR',
          text: item.content,
        });
      } catch (err) {
        console.error('Failed to share:', err);
      }
    } else {
      handleCopy(item.content, item.id);
    }
  };

  const handleOpen = (item) => {
    if (item.type === 'url') {
      window.open(item.content, '_blank');
    } else if (item.type === 'email') {
      window.location.href = item.content;
    } else if (item.type === 'phone') {
      window.location.href = item.content;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'url':
        return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200';
      case 'email':
        return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200';
      case 'phone':
        return 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200';
      case 'wifi':
        return 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200';
      default:
        return 'bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200';
    }
  };

  const renderHistoryItem = (item, isGenerated = false) => (
    <motion.div
      key={item.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white dark:bg-dark-800 rounded-xl shadow-md border border-gray-100 dark:border-dark-700 p-4 mb-4"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className={`text-xs px-2 py-1 rounded-full ${getTypeColor(item.type)}`}>
              {item.type?.toUpperCase() || 'TEXT'}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {format(new Date(item.timestamp), 'MMM d, yyyy HH:mm')}
            </span>
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1 truncate">
            {item.title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
            {item.content}
          </p>
        </div>
        <button
          onClick={() => isGenerated ? deleteGeneratedItem(item.id) : deleteScannedItem(item.id)}
          className="ml-3 p-2 text-gray-400 hover:text-red-500 transition-colors"
        >
          <SafeIcon icon={FiTrash2} className="w-4 h-4" />
        </button>
      </div>

      {/* QR Code Preview for Generated Items */}
      {isGenerated && item.qrCode && (
        <div className="mb-4 flex justify-center">
          <div className="bg-white p-2 rounded-lg shadow-sm">
            <img 
              src={item.qrCode} 
              alt="Generated QR Code" 
              className="w-16 h-16 object-contain"
            />
          </div>
        </div>
      )}

      <div className="flex items-center gap-2">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleCopy(item.content, item.id)}
          className="flex-1 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 px-3 py-2 rounded-lg text-sm font-medium hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors flex items-center justify-center gap-2"
        >
          <SafeIcon icon={FiCopy} className="w-4 h-4" />
          {copied === item.id ? 'Copied!' : 'Copy'}
        </motion.button>

        {(item.type === 'url' || item.type === 'email' || item.type === 'phone') && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleOpen(item)}
            className="flex-1 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 px-3 py-2 rounded-lg text-sm font-medium hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors flex items-center justify-center gap-2"
          >
            <SafeIcon icon={FiExternalLink} className="w-4 h-4" />
            Open
          </motion.button>
        )}

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleShare(item)}
          className="flex-1 bg-gray-50 dark:bg-dark-700 text-gray-700 dark:text-gray-300 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 dark:hover:bg-dark-600 transition-colors flex items-center justify-center gap-2"
        >
          <SafeIcon icon={FiShare2} className="w-4 h-4" />
          Share
        </motion.button>
      </div>
    </motion.div>
  );

  const currentHistory = activeTab === 'scanned' ? scannedHistory : generatedHistory;
  const clearFunction = activeTab === 'scanned' ? clearScannedHistory : clearGeneratedHistory;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <Link to="/">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 rounded-full bg-white dark:bg-dark-800 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <SafeIcon icon={FiArrowLeft} className="w-6 h-6 text-gray-600 dark:text-gray-300" />
              </motion.button>
            </Link>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
              History
            </h1>
            {currentHistory.length > 0 && (
              <button
                onClick={clearFunction}
                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
              >
                <SafeIcon icon={FiTrash2} className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Tab Navigation */}
          <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-lg p-2 mb-6">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setActiveTab('scanned')}
                className={`p-3 rounded-xl font-semibold transition-all duration-300 ${
                  activeTab === 'scanned'
                    ? 'bg-primary-600 text-white shadow-md'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-700'
                }`}
              >
                Scanned ({scannedHistory.length})
              </button>
              <button
                onClick={() => setActiveTab('generated')}
                className={`p-3 rounded-xl font-semibold transition-all duration-300 ${
                  activeTab === 'generated'
                    ? 'bg-primary-600 text-white shadow-md'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-700'
                }`}
              >
                Generated ({generatedHistory.length})
              </button>
            </div>
          </div>

          {/* History Content */}
          <AnimatePresence mode="wait">
            {currentHistory.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center py-12"
              >
                <div className="bg-gray-100 dark:bg-dark-800 p-6 rounded-full inline-block mb-4">
                  <SafeIcon icon={FiAlertCircle} className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  No {activeTab} history
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  {activeTab === 'scanned' 
                    ? 'Scan your first QR code to see it here'
                    : 'Generate your first QR code to see it here'
                  }
                </p>
                <Link
                  to={activeTab === 'scanned' ? '/scan' : '/generate'}
                  className="inline-block bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
                >
                  {activeTab === 'scanned' ? 'Start Scanning' : 'Create QR Code'}
                </Link>
              </motion.div>
            ) : (
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: activeTab === 'scanned' ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: activeTab === 'scanned' ? 20 : -20 }}
                className="space-y-0"
              >
                {currentHistory.map((item) => 
                  renderHistoryItem(item, activeTab === 'generated')
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default History;