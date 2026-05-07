import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export const NOTICE_DISMISSED_KEY = 'sixvault_domain_notice_dismissed';

const DomainNoticePopup = ({ onDismiss }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
  >
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 10 }}
      transition={{ duration: 0.2 }}
      className="card max-w-lg w-full relative"
    >
      <button
        onClick={onDismiss}
        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        aria-label="Dismiss notice"
      >
        <X className="h-5 w-5" />
      </button>

      <div className="flex items-center space-x-2 mb-4">
        <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
          <span className="text-base">📢</span>
        </div>
        <h3 className="text-lg font-bold text-gray-900">Domain &amp; Email Migration Notice</h3>
      </div>

      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 mb-4 text-sm text-gray-700 leading-relaxed">
        <p className="mb-3">
          From <strong>June 7th, 2026</strong>, Sixvault will transition to new domains as{' '}
          <code className="bg-blue-100 text-blue-800 px-1 py-0.5 rounded text-xs font-mono">sixvault.xyz</code>{' '}
          will not be renewed:
        </p>
        <ul className="space-y-2">
          <li>
            🌐 <strong>Website:</strong>{' '}
            <a href="https://sixvault.faizath.com" className="text-primary-600 hover:text-primary-700 underline">
              sixvault.faizath.com
            </a>{' '}
            <span className="text-gray-500">(formerly <em>sixvault.xyz</em>)</span>
          </li>
          <li>
            ⚙️ <strong>API:</strong>{' '}
            <a href="https://sixvault-api.faizath.com" className="text-primary-600 hover:text-primary-700 underline">
              sixvault-api.faizath.com
            </a>{' '}
            <span className="text-gray-500">(formerly <em>api.sixvault.xyz</em>)</span>
          </li>
          <li>
            📧 <strong>Email:</strong>{' '}
            <a href="mailto:contact@sixvault.faizath.com" className="text-primary-600 hover:text-primary-700 underline">
              contact@sixvault.faizath.com
            </a>{' '}
            <span className="text-gray-500">(formerly <em>contact@sixvault.xyz</em>)</span>
          </li>
          <li>
            🛰️ <strong>CDN:</strong>{' '}
            <span className="text-gray-700">sixvault-cdn.faizath.com</span>{' '}
            <span className="text-gray-500">(formerly <em>cdn.sixvault.xyz</em>)</span>
          </li>
          <li>
            📈 <strong>Status Pages:</strong>{' '}
            <a href="https://status.faizath.com/status/sixvault" className="text-primary-600 hover:text-primary-700 underline">
              status.faizath.com/status/sixvault
            </a>{' '}
            <span className="text-gray-500">(formerly <em>status.sixvault.xyz</em>)</span>
          </li>
        </ul>
      </div>

      <button
        onClick={onDismiss}
        className="w-full btn-primary py-2 text-sm"
      >
        Got it, dismiss
      </button>
    </motion.div>
  </motion.div>
);

export const useDomainNotice = () => {
  const [noticeVisible, setNoticeVisible] = useState(
    () => !localStorage.getItem(NOTICE_DISMISSED_KEY)
  );

  const dismissNotice = () => {
    localStorage.setItem(NOTICE_DISMISSED_KEY, '1');
    setNoticeVisible(false);
  };

  const NoticeWrapper = () => (
    <AnimatePresence>
      {noticeVisible && <DomainNoticePopup onDismiss={dismissNotice} />}
    </AnimatePresence>
  );

  return { NoticeWrapper };
};

export default DomainNoticePopup;
