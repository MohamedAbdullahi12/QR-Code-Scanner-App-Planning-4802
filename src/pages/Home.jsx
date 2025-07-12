import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useHistory } from '../contexts/HistoryContext';
import { useTheme } from '../contexts/ThemeContext';
import { format } from 'date-fns';

const { FiCamera, FiPlus, FiHistory, FiSettings, FiSun, FiMoon } = FiIcons;

const Home = () => {
  const { scannedHistory, generatedHistory } = useHistory();
  const { isDark, toggleTheme } = useTheme();

  const recentItems = [
    ...scannedHistory.slice(0, 3).map(item => ({
      ...item,
      type: 'scanned'
    })),
    ...generatedHistory.slice(0, 3).map(item => ({
      ...item,
      type: 'generated'
    }))
  ]
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 5);

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-100 dark:from-dark-900 dark:to-dark-800">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-md mx-auto"
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="text-center mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex-1" />
              <div className="bg-white dark:bg-dark-800 p-4 rounded-full shadow-lg">
                <SafeIcon
                  icon={FiCamera}
                  className="w-8 h-8 text-primary-600 dark:text-primary-400"
                />
              </div>
              <div className="flex-1 flex justify-end">
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-full bg-white dark:bg-dark-800 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <SafeIcon
                    icon={isDark ? FiSun : FiMoon}
                    className="w-5 h-5 text-gray-600 dark:text-gray-300"
                  />
                </button>
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              QuickQR
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Fast & Simple QR Code Scanner
            </p>
          </motion.div>

          {/* Main Actions */}
          <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4 mb-8">
            <Link to="/scan">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white dark:bg-dark-800 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-dark-700"
              >
                <div className="text-center">
                  <div className="bg-primary-100 dark:bg-primary-900 p-4 rounded-full inline-block mb-4">
                    <SafeIcon
                      icon={FiCamera}
                      className="w-8 h-8 text-primary-600 dark:text-primary-400"
                    />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Scan QR
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Use camera to scan codes
                  </p>
                </div>
              </motion.div>
            </Link>
            <Link to="/generate">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white dark:bg-dark-800 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-dark-700"
              >
                <div className="text-center">
                  <div className="bg-green-100 dark:bg-green-900 p-4 rounded-full inline-block mb-4">
                    <SafeIcon
                      icon={FiPlus}
                      className="w-8 h-8 text-green-600 dark:text-green-400"
                    />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Create QR
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Generate QR codes
                  </p>
                </div>
              </motion.div>
            </Link>
          </motion.div>

          {/* Recent Activity */}
          {recentItems.length > 0 && (
            <motion.div variants={itemVariants} className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Recent Activity
              </h2>
              <div className="space-y-3">
                {recentItems.map((item) => (
                  <motion.div
                    key={item.id}
                    whileHover={{ scale: 1.02 }}
                    className="bg-white dark:bg-dark-800 p-4 rounded-xl shadow-md border border-gray-100 dark:border-dark-700"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              item.type === 'scanned'
                                ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                                : 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                            }`}
                          >
                            {item.type === 'scanned' ? 'Scanned' : 'Generated'}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {format(new Date(item.timestamp), 'MMM d, HH:mm')}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {item.title || item.content}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {item.content.substring(0, 50)}...
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Bottom Navigation */}
          <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4">
            <Link to="/history">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white dark:bg-dark-800 p-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-dark-700"
              >
                <div className="flex items-center justify-center gap-3">
                  <SafeIcon
                    icon={FiHistory}
                    className="w-5 h-5 text-gray-600 dark:text-gray-300"
                  />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    History
                  </span>
                </div>
              </motion.div>
            </Link>
            <Link to="/settings">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white dark:bg-dark-800 p-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-dark-700"
              >
                <div className="flex items-center justify-center gap-3">
                  <SafeIcon
                    icon={FiSettings}
                    className="w-5 h-5 text-gray-600 dark:text-gray-300"
                  />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    Settings
                  </span>
                </div>
              </motion.div>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Home;