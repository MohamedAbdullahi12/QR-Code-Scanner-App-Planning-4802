import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useHistory } from '../contexts/HistoryContext';
import QRCode from 'qrcode';
import { 
  sanitizeContent, 
  isValidUrl, 
  isValidEmail, 
  isValidPhone 
} from '../utils/security';

const { 
  FiArrowLeft, 
  FiType, 
  FiLink, 
  FiPhone, 
  FiMail, 
  FiWifi, 
  FiDownload, 
  FiShare2, 
  FiCheck 
} = FiIcons;

const Generator = () => {
  const [selectedType, setSelectedType] = useState('text');
  const [formData, setFormData] = useState({
    text: '',
    url: '',
    phone: '',
    email: '',
    emailSubject: '',
    emailBody: '',
    ssid: '',
    password: '',
    encryption: 'WPA'
  });
  const [qrCode, setQrCode] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [validationError, setValidationError] = useState(null);
  const { addGeneratedItem } = useHistory();

  const qrTypes = [
    { id: 'text', label: 'Text', icon: FiType },
    { id: 'url', label: 'Website', icon: FiLink },
    { id: 'phone', label: 'Phone', icon: FiPhone },
    { id: 'email', label: 'Email', icon: FiMail },
    { id: 'wifi', label: 'WiFi', icon: FiWifi },
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setValidationError(null);
  };

  const validateForm = () => {
    switch (selectedType) {
      case 'text':
        return formData.text.trim() !== '';
      case 'url':
        if (formData.url.trim() === '') return false;
        const urlToCheck = formData.url.startsWith('http') ? 
          formData.url : `https://${formData.url}`;
        if (!isValidUrl(urlToCheck)) {
          setValidationError('Please enter a valid URL');
          return false;
        }
        return true;
      case 'phone':
        if (!isValidPhone(formData.phone)) {
          setValidationError('Please enter a valid phone number');
          return false;
        }
        return true;
      case 'email':
        if (!isValidEmail(formData.email)) {
          setValidationError('Please enter a valid email address');
          return false;
        }
        return true;
      case 'wifi':
        return formData.ssid.trim() !== '';
      default:
        return false;
    }
  };

  const generateQRContent = () => {
    switch (selectedType) {
      case 'text':
        return sanitizeContent(formData.text);
      case 'url':
        const cleanUrl = sanitizeContent(formData.url);
        return cleanUrl.startsWith('http') ? cleanUrl : `https://${cleanUrl}`;
      case 'phone':
        return `tel:${sanitizeContent(formData.phone)}`;
      case 'email':
        const email = sanitizeContent(formData.email);
        const subject = formData.emailSubject ? 
          `?subject=${encodeURIComponent(sanitizeContent(formData.emailSubject))}` : '';
        const body = formData.emailBody ? 
          `${subject ? '&' : '?'}body=${encodeURIComponent(sanitizeContent(formData.emailBody))}` : '';
        return `mailto:${email}${subject}${body}`;
      case 'wifi':
        return `WIFI:T:${sanitizeContent(formData.encryption)};S:${sanitizeContent(formData.ssid)};P:${sanitizeContent(formData.password)};;`;
      default:
        return '';
    }
  };

  const getQRTitle = () => {
    switch (selectedType) {
      case 'text':
        return formData.text.length > 30 ? formData.text.substring(0, 30) + '...' : formData.text;
      case 'url':
        return formData.url;
      case 'phone':
        return formData.phone;
      case 'email':
        return formData.email;
      case 'wifi':
        return formData.ssid;
      default:
        return 'QR Code';
    }
  };

  const generateQR = async () => {
    setValidationError(null);
    
    if (!validateForm()) return;
    
    setIsGenerating(true);
    try {
      const content = generateQRContent();
      
      // Set security options for QR code generation
      const qrDataUrl = await QRCode.toDataURL(content, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'H' // Highest error correction for better security
      });
      
      setQrCode(qrDataUrl);
      
      // Add to history with sanitized content
      addGeneratedItem({
        content,
        title: getQRTitle(),
        type: selectedType,
        qrCode: qrDataUrl
      });
    } catch (error) {
      console.error('Error generating QR code:', error);
      setValidationError('Failed to generate QR code');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadQR = () => {
    if (!qrCode) return;
    
    // Create a safe filename
    const safeType = selectedType.replace(/[^a-z0-9]/gi, '');
    const timestamp = Date.now();
    const filename = `quickqr-${safeType}-${timestamp}.png`;
    
    const link = document.createElement('a');
    link.download = filename;
    link.href = qrCode;
    link.click();
  };

  const shareQR = async () => {
    if (!qrCode) return;
    
    if (navigator.share) {
      try {
        // Convert data URL to blob
        const response = await fetch(qrCode);
        const blob = await response.blob();
        const file = new File([blob], `quickqr-${selectedType}.png`, {
          type: 'image/png'
        });
        
        // Use Web Share API
        await navigator.share({
          title: 'QuickQR Code',
          text: `QR Code for: ${sanitizeContent(getQRTitle())}`,
          files: [file]
        });
      } catch (error) {
        console.error('Error sharing:', error);
        downloadQR();
      }
    } else {
      downloadQR();
    }
  };

  // Rest of the component remains the same...
  // (Rendering forms, UI elements, etc.)

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
                <SafeIcon
                  icon={FiArrowLeft}
                  className="w-6 h-6 text-gray-600 dark:text-gray-300"
                />
              </motion.button>
            </Link>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
              Generate QR Code
            </h1>
            <div className="w-10" />
          </div>

          {/* QR Type Selection */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Select QR Type
            </h2>
            <div className="grid grid-cols-3 gap-3">
              {qrTypes.map((type) => (
                <motion.button
                  key={type.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedType(type.id)}
                  className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                    selectedType === type.id
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-gray-200 dark:border-dark-700 bg-white dark:bg-dark-800 hover:border-gray-300 dark:hover:border-dark-600'
                  }`}
                >
                  <div className="text-center">
                    <div
                      className={`p-2 rounded-full inline-block mb-2 ${
                        selectedType === type.id
                          ? 'bg-primary-100 dark:bg-primary-900'
                          : 'bg-gray-100 dark:bg-dark-700'
                      }`}
                    >
                      <SafeIcon
                        icon={type.icon}
                        className={`w-5 h-5 ${
                          selectedType === type.id
                            ? 'text-primary-600 dark:text-primary-400'
                            : 'text-gray-600 dark:text-gray-300'
                        }`}
                      />
                    </div>
                    <p
                      className={`text-sm font-medium ${
                        selectedType === type.id
                          ? 'text-primary-900 dark:text-primary-100'
                          : 'text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {type.label}
                    </p>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Form */}
          <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {qrTypes.find(t => t.id === selectedType)?.label} Details
            </h3>
            
            {/* Display validation errors */}
            {validationError && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm">
                {validationError}
              </div>
            )}
            
            {/* Form content rendered here */}
            {selectedType === 'text' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Text Content
                  </label>
                  <textarea
                    value={formData.text}
                    onChange={(e) => handleInputChange('text', e.target.value)}
                    placeholder="Enter your text here..."
                    className="w-full p-3 border border-gray-300 dark:border-dark-600 rounded-xl bg-white dark:bg-dark-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                    rows={4}
                  />
                </div>
              </div>
            )}
            
            {selectedType === 'url' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Website URL
                  </label>
                  <input
                    type="url"
                    value={formData.url}
                    onChange={(e) => handleInputChange('url', e.target.value)}
                    placeholder="example.com or https://example.com"
                    className="w-full p-3 border border-gray-300 dark:border-dark-600 rounded-xl bg-white dark:bg-dark-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>
            )}
            
            {selectedType === 'phone' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="+1234567890"
                    className="w-full p-3 border border-gray-300 dark:border-dark-600 rounded-xl bg-white dark:bg-dark-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>
            )}
            
            {selectedType === 'email' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="contact@example.com"
                    className="w-full p-3 border border-gray-300 dark:border-dark-600 rounded-xl bg-white dark:bg-dark-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Subject (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.emailSubject}
                    onChange={(e) => handleInputChange('emailSubject', e.target.value)}
                    placeholder="Email subject"
                    className="w-full p-3 border border-gray-300 dark:border-dark-600 rounded-xl bg-white dark:bg-dark-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Message (Optional)
                  </label>
                  <textarea
                    value={formData.emailBody}
                    onChange={(e) => handleInputChange('emailBody', e.target.value)}
                    placeholder="Email message"
                    className="w-full p-3 border border-gray-300 dark:border-dark-600 rounded-xl bg-white dark:bg-dark-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                    rows={3}
                  />
                </div>
              </div>
            )}
            
            {selectedType === 'wifi' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Network Name (SSID)
                  </label>
                  <input
                    type="text"
                    value={formData.ssid}
                    onChange={(e) => handleInputChange('ssid', e.target.value)}
                    placeholder="My WiFi Network"
                    className="w-full p-3 border border-gray-300 dark:border-dark-600 rounded-xl bg-white dark:bg-dark-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    placeholder="WiFi password"
                    className="w-full p-3 border border-gray-300 dark:border-dark-600 rounded-xl bg-white dark:bg-dark-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Security Type
                  </label>
                  <select
                    value={formData.encryption}
                    onChange={(e) => handleInputChange('encryption', e.target.value)}
                    className="w-full p-3 border border-gray-300 dark:border-dark-600 rounded-xl bg-white dark:bg-dark-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="WPA">WPA/WPA2</option>
                    <option value="WEP">WEP</option>
                    <option value="nopass">No Password</option>
                  </select>
                </div>
              </div>
            )}
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={generateQR}
              disabled={!validateForm() || isGenerating}
              className={`w-full mt-6 p-4 rounded-xl font-semibold transition-all duration-300 ${
                validateForm() && !isGenerating
                  ? 'bg-primary-600 hover:bg-primary-700 text-white'
                  : 'bg-gray-200 dark:bg-dark-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
              }`}
            >
              {isGenerating ? 'Generating...' : 'Generate QR Code'}
            </motion.button>
          </div>

          {/* Generated QR Code */}
          <AnimatePresence>
            {qrCode && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white dark:bg-dark-800 rounded-2xl shadow-lg p-6"
              >
                <div className="text-center mb-6">
                  <div className="bg-green-50 dark:bg-green-900/20 p-2 rounded-full inline-block mb-4">
                    <SafeIcon
                      icon={FiCheck}
                      className="w-6 h-6 text-green-600 dark:text-green-400"
                    />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    QR Code Generated!
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {getQRTitle()}
                  </p>
                </div>
                <div className="flex justify-center mb-6">
                  <div className="bg-white p-4 rounded-2xl shadow-md">
                    <img
                      src={qrCode}
                      alt="Generated QR Code"
                      className="qr-code-canvas"
                      style={{ width: '200px', height: '200px' }}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={downloadQR}
                    className="bg-primary-600 hover:bg-primary-700 text-white p-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors"
                  >
                    <SafeIcon icon={FiDownload} className="w-5 h-5" />
                    Save
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={shareQR}
                    className="bg-white dark:bg-dark-700 border border-gray-200 dark:border-dark-600 hover:bg-gray-50 dark:hover:bg-dark-600 text-gray-900 dark:text-white p-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors"
                  >
                    <SafeIcon icon={FiShare2} className="w-5 h-5" />
                    Share
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Generator;