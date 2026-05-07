import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDomainNotice } from './DomainNoticePopup';

const NotFound = () => {
  const navigate = useNavigate();
  const { NoticeWrapper } = useDomainNotice();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex flex-col">
      <NoticeWrapper />

      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-6">
            <motion.div
              className="flex items-center space-x-2 cursor-pointer"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              onClick={() => navigate('/')}
            >
              <Shield className="h-8 w-8 text-primary-600" />
              <span className="text-2xl font-bold gradient-text">Sixvault</span>
            </motion.div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="card max-w-md w-full text-center"
        >
          <div className="text-8xl font-bold gradient-text mb-4">404</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Page Not Found</h1>
          <p className="text-gray-600 mb-8">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/')}
            className="btn-primary py-3 px-6 inline-flex items-center space-x-2"
          >
            <Home className="h-4 w-4" />
            <span>Back to Home</span>
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
};

export default NotFound;
