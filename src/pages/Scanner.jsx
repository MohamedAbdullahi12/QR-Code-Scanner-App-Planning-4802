import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useHistory } from '../contexts/HistoryContext';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { sanitizeContent, isValidUrl } from '../utils/security';

const { FiArrowLeft, FiCopy, FiExternalLink, FiShare2, FiCheck, FiX, FiCamera, FiAlertCircle } = FiIcons;

const Scanner = () => {
  const [scanResult, setScanResult] = useState(null);
  const [isScanning, setIsScanning] = useState(true);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(null);
  const [cameraPermission, setCameraPermission] = useState(null);
  const { addScannedItem } = useHistory();
  const html5QrcodeScanner = useRef(null);
  const scannerInitialized = useRef(false);

  useEffect(() => {
    const initializeScanner = async () => {
      try {
        // Request camera permission first
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            facingMode: 'environment' // Use back camera by default
          } 
        });
        
        // Stop the stream immediately after getting permission
        stream.getTracks().forEach(track => track.stop());
        setCameraPermission(true);
        
        // Initialize scanner only if not already initialized
        if (!scannerInitialized.current) {
          html5QrcodeScanner.current = new Html5QrcodeScanner(
            "qr-reader",
            {
              fps: 10,
              qrbox: { width: 250, height: 250 },
              aspectRatio: 1.0,
              showTorchButtonIfSupported: true,
              showZoomSliderIfSupported: true,
              defaultZoomValueIfSupported: 1.0,
              rememberLastUsedCamera: true,
              supportedScanTypes: [
                Html5QrcodeScanner.SCAN_TYPE_CAMERA,
                Html5QrcodeScanner.SCAN_TYPE_FILE
              ]
            },
            false
          );

          const onScanSuccess = (decodedText, decodedResult) => {
            console.log("Scan success:", decodedText);
            
            // Sanitize the scanned content
            const sanitizedText = sanitizeContent(decodedText);
            const type = getContentType(sanitizedText);
            const title = getContentTitle(sanitizedText);

            // Validate URL if it's a URL type
            if (type === 'url' && !isValidUrl(sanitizedText)) {
              setError("The scanned QR code contains an invalid URL");
              return;
            }

            const result = {
              content: sanitizedText,
              title: title,
              type: type
            };

            setScanResult(result);
            setIsScanning(false);
            addScannedItem(result);

            // Stop scanning
            if (html5QrcodeScanner.current) {
              html5QrcodeScanner.current.clear().catch(console.error);
            }
          };

          const onScanFailure = (error) => {
            // Handle scan failure silently - don't show errors for normal scanning attempts
            console.log("Scan attempt:", error);
          };

          html5QrcodeScanner.current.render(onScanSuccess, onScanFailure);
          scannerInitialized.current = true;
        }
      } catch (error) {
        console.error('Camera permission error:', error);
        setCameraPermission(false);
        setError('Camera permission is required to scan QR codes. Please allow camera access and refresh the page.');
      }
    };

    if (isScanning && !scannerInitialized.current) {
      initializeScanner();
    }

    return () => {
      if (html5QrcodeScanner.current) {
        html5QrcodeScanner.current.clear().catch(console.error);
      }
    };
  }, [isScanning, addScannedItem]);

  const getContentType = (content) => {
    if (content.startsWith('http://') || content.startsWith('https://')) {
      return 'url';
    }
    if (content.startsWith('mailto:')) {
      return 'email';
    }
    if (content.startsWith('tel:')) {
      return 'phone';
    }
    if (content.startsWith('WIFI:')) {
      return 'wifi';
    }
    return 'text';
  };

  const getContentTitle = (content) => {
    const type = getContentType(content);
    switch (type) {
      case 'url':
        try {
          return new URL(content).hostname;
        } catch {
          return 'Website URL';
        }
      case 'email':
        return content.replace('mailto:', '');
      case 'phone':
        return content.replace('tel:', '');
      case 'wifi':
        return 'WiFi Network';
      default:
        return content.length > 30 ? content.substring(0, 30) + '...' : content;
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(scanResult.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      setError('Failed to copy text');
    }
  };

  const handleOpen = () => {
    try {
      if (scanResult.type === 'url') {
        // Validate URL before opening
        if (isValidUrl(scanResult.content)) {
          window.open(scanResult.content, '_blank');
        } else {
          setError('Cannot open invalid URL');
        }
      } else if (scanResult.type === 'email') {
        window.location.href = scanResult.content;
      } else if (scanResult.type === 'phone') {
        window.location.href = scanResult.content;
      }
    } catch (err) {
      console.error('Failed to open content:', err);
      setError('Failed to open content');
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'QuickQR Scan Result',
          text: scanResult.content,
        });
      } catch (err) {
        console.error('Failed to share:', err);
        handleCopy();
      }
    } else {
      handleCopy();
    }
  };

  const startNewScan = () => {
    setScanResult(null);
    setIsScanning(true);
    setError(null);
    scannerInitialized.current = false;
  };

  // Show camera permission error
  if (cameraPermission === false) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-lg p-8">
            <div className="bg-red-100 dark:bg-red-900/20 p-4 rounded-full inline-block mb-4">
              <SafeIcon icon={FiAlertCircle} className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Camera Access Required
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Please allow camera access to scan QR codes. Check your browser settings and refresh the page.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-primary-600 hover:bg-primary-700 text-white p-3 rounded-xl font-semibold transition-colors"
              >
                Refresh Page
              </button>
              <Link
                to="/"
                className="block w-full bg-gray-100 dark:bg-dark-700 hover:bg-gray-200 dark:hover:bg-dark-600 text-gray-900 dark:text-white p-3 rounded-xl font-semibold transition-colors"
              >
                Go Back
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex items-center justify-between p-4 pt-8">
          <Link to="/">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white/20 backdrop-blur-sm p-3 rounded-full"
            >
              <SafeIcon icon={FiArrowLeft} className="w-6 h-6 text-white" />
            </motion.button>
          </Link>
          <h1 className="text-xl font-semibold text-white">Scan QR Code</h1>
          <div className="w-12" />
        </div>
      </div>

      {/* Scanner */}
      {isScanning && (
        <div className="absolute inset-0">
          <div id="qr-reader" className="w-full h-full" />
          
          {/* Scanning Instructions */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 pb-8">
            <div className="text-center">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="bg-white/20 backdrop-blur-sm p-4 rounded-full inline-block mb-4"
              >
                <SafeIcon icon={FiCamera} className="w-8 h-8 text-white" />
              </motion.div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Position QR code in frame
              </h3>
              <p className="text-white/80 text-sm">
                Hold your device steady and point the camera at the QR code
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ y: '-100%' }}
            animate={{ y: 0 }}
            exit={{ y: '-100%' }}
            className="absolute top-0 left-0 right-0 z-50 bg-red-500 p-4 text-white"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <SafeIcon icon={FiAlertCircle} className="w-5 h-5 mr-2" />
                <p>{error}</p>
              </div>
              <button onClick={() => setError(null)}>
                <SafeIcon icon={FiX} className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scan Result */}
      <AnimatePresence>
        {scanResult && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            className="absolute inset-0 bg-white dark:bg-dark-900 z-30"
          >
            <div className="p-6 pt-16">
              <div className="flex items-center justify-between mb-6">
                <button
                  onClick={startNewScan}
                  className="p-2 rounded-full bg-gray-100 dark:bg-dark-800 hover:bg-gray-200 dark:hover:bg-dark-700 transition-colors"
                >
                  <SafeIcon icon={FiArrowLeft} className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                </button>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Scan Result
                </h2>
                <div className="w-10" />
              </div>

              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl p-6 mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-green-100 dark:bg-green-900 p-2 rounded-full">
                    <SafeIcon icon={FiCheck} className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <span className="text-sm font-medium text-green-800 dark:text-green-200">
                    Successfully Scanned
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {scanResult.title}
                </h3>
                <div className="bg-white dark:bg-dark-800 rounded-xl p-4 border border-gray-200 dark:border-dark-700">
                  <p className="text-sm text-gray-600 dark:text-gray-300 break-all">
                    {scanResult.content}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCopy}
                  className="w-full bg-primary-600 hover:bg-primary-700 text-white p-4 rounded-xl font-semibold flex items-center justify-center gap-3 transition-colors"
                >
                  <SafeIcon icon={copied ? FiCheck : FiCopy} className="w-5 h-5" />
                  {copied ? 'Copied!' : 'Copy to Clipboard'}
                </motion.button>

                {(scanResult.type === 'url' || scanResult.type === 'email' || scanResult.type === 'phone') && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleOpen}
                    className="w-full bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700 hover:bg-gray-50 dark:hover:bg-dark-700 text-gray-900 dark:text-white p-4 rounded-xl font-semibold flex items-center justify-center gap-3 transition-colors"
                  >
                    <SafeIcon icon={FiExternalLink} className="w-5 h-5" />
                    {scanResult.type === 'url' ? 'Open Website' : 
                     scanResult.type === 'email' ? 'Send Email' : 'Call Number'}
                  </motion.button>
                )}

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleShare}
                  className="w-full bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700 hover:bg-gray-50 dark:hover:bg-dark-700 text-gray-900 dark:text-white p-4 rounded-xl font-semibold flex items-center justify-center gap-3 transition-colors"
                >
                  <SafeIcon icon={FiShare2} className="w-5 h-5" />
                  Share
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={startNewScan}
                  className="w-full bg-gray-100 dark:bg-dark-800 hover:bg-gray-200 dark:hover:bg-dark-700 text-gray-900 dark:text-white p-4 rounded-xl font-semibold transition-colors"
                >
                  Scan Another Code
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Scanner;