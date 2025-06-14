import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, 
  Lock, 
  Key, 
  Users, 
  FileText, 
  ChevronRight,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { validationUtils } from '../lib/api/sixvaultApi';

const LandingPage = () => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    nim_nip: '',
    password: '',
    nama: '',
    type: 'mahasiswa',
    prodi: 'teknik_informatika'
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const { login, register } = useAuth();

  const features = [
    {
      icon: Shield,
      title: 'Multi-Cryptographic Security',
      description: 'Advanced protection using AES encryption, RSA digital signatures, and Shamir\'s Secret Sharing'
    },
    {
      icon: Lock,
      title: 'Role-Based Access Control',
      description: 'Secure access management for students, academic advisors, and program heads'
    },
    {
      icon: Key,
      title: 'End-to-End Encryption',
      description: 'Your academic data is encrypted from source to destination with military-grade security'
    },
    {
      icon: Users,
      title: 'Collaborative Environment',
      description: 'Secure collaboration between students, advisors, and academic staff'
    }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.nim_nip.trim()) {
      newErrors.nim_nip = 'NIM/NIP is required';
    } else if (!validationUtils.validateNimNip(formData.nim_nip)) {
      newErrors.nim_nip = 'NIM/NIP must be 8-18 numeric characters';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (!validationUtils.validatePassword(formData.password)) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (!isLoginMode) {
      if (!formData.nama.trim()) {
        newErrors.nama = 'Full name is required';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    setMessage({ type: '', text: '' });
    
    try {
      let result;
      
      if (isLoginMode) {
        result = await login(
          formData.nim_nip,
          formData.password
        );
      } else {
        result = await register({
          nim_nip: formData.nim_nip,
          password: formData.password,
          nama: formData.nama,
          type: formData.type,
          prodi: formData.prodi
        });
      }
      
      if (result.success) {
        setMessage({
          type: 'success',
          text: `${isLoginMode ? 'Login' : 'Registration'} successful!`
        });
        
        // No need to reload, AuthContext will handle state change
      } else {
        setMessage({
          type: 'error',
          text: result.error || `${isLoginMode ? 'Login' : 'Registration'} failed`
        });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'An unexpected error occurred. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="relative z-10 bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <motion.div 
              className="flex items-center space-x-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Shield className="h-8 w-8 text-primary-600" />
              <span className="text-2xl font-bold gradient-text">Sixvault</span>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="hidden md:flex items-center space-x-4 text-sm text-gray-600">
                <span className="flex items-center space-x-1">
                  <Lock className="h-4 w-4" />
                  <span>Secure</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Key className="h-4 w-4" />
                  <span>Encrypted</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Shield className="h-4 w-4" />
                  <span>Trusted</span>
                </span>
              </div>
            </motion.div>
          </div>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row min-h-screen">
        {/* Left Section - Hero Content */}
        <div className="lg:w-1/2 flex items-center justify-center p-8 lg:p-12">
          <div className="max-w-md w-full">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-8"
            >
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                Secure Academic
                <span className="gradient-text block">Transcript Management</span>
              </h1>
              <p className="text-lg text-gray-600 leading-relaxed">
                Protecting student data with multi-cryptographic techniques including AES encryption, RSA signatures, and Shamir's Secret Sharing.
              </p>
            </motion.div>

            {/* Features Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="grid grid-cols-2 gap-4 mb-8"
            >
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.05 }}
                  className="bg-white/60 backdrop-blur-sm rounded-lg p-4 text-center border border-gray-200"
                >
                  <feature.icon className="h-8 w-8 text-primary-600 mx-auto mb-2" />
                  <h3 className="font-semibold text-sm text-gray-900 mb-1">{feature.title}</h3>
                  <p className="text-xs text-gray-600 leading-tight">{feature.description}</p>
                </motion.div>
              ))}
            </motion.div>

            {/* Security Badge */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex items-center justify-center space-x-2 text-sm text-gray-500"
            >
              <Shield className="h-4 w-4 text-green-500" />
              <span>Enterprise-grade security • End-to-end encryption</span>
            </motion.div>
          </div>
        </div>

        {/* Right Section - Login Form */}
        <div className="lg:w-1/2 flex items-center justify-center p-8 lg:p-12 bg-white/30 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="card max-w-md w-full"
          >
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {isLoginMode ? 'Welcome Back' : 'Create Account'}
              </h2>
              <p className="text-gray-600">
                {isLoginMode 
                  ? 'Sign in to access your secure academic records'
                  : 'Join the secure academic management system'
                }
              </p>
            </div>

            {/* Message Display */}
            {message.text && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`mb-4 p-3 rounded-lg flex items-center space-x-2 ${
                  message.type === 'success' 
                    ? 'bg-green-50 text-green-700 border border-green-200' 
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}
              >
                {message.type === 'success' ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                <span className="text-sm">{message.text}</span>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* NIM/NIP Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  NIM/NIP
                </label>
                <input
                  type="text"
                  name="nim_nip"
                  value={formData.nim_nip}
                  onChange={handleInputChange}
                  pattern="[0-9]*"
                  inputMode="numeric"
                  className={`input-field ${errors.nim_nip ? 'border-red-500' : ''}`}
                  placeholder="Enter your NIM or NIP (8-18 numbers only)"
                  disabled={isLoading}
                />
                {errors.nim_nip && (
                  <p className="text-red-500 text-xs mt-1">{errors.nim_nip}</p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`input-field pr-10 ${errors.password ? 'border-red-500' : ''}`}
                    placeholder="Enter your password"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                )}
              </div>

              {/* Name Field (Registration only) */}
              {!isLoginMode && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="nama"
                    value={formData.nama}
                    onChange={handleInputChange}
                    className={`input-field ${errors.nama ? 'border-red-500' : ''}`}
                    placeholder="Enter your full name"
                    disabled={isLoading}
                  />
                  {errors.nama && (
                    <p className="text-red-500 text-xs mt-1">{errors.nama}</p>
                  )}
                </motion.div>
              )}

              {/* User Type Field (Registration only) */}
              {!isLoginMode && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    User Type
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="input-field"
                    disabled={isLoading}
                  >
                    <option value="mahasiswa">Student (Mahasiswa)</option>
                    <option value="dosen_wali">Academic Advisor (Dosen Wali)</option>
                    <option value="kaprodi">Program Head (Kaprodi)</option>
                  </select>
                </div>
              )}

              {/* Program Study Field (Registration only) */}
              {!isLoginMode && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Program Study
                  </label>
                  <select
                    name="prodi"
                    value={formData.prodi}
                    onChange={handleInputChange}
                    className="input-field"
                    disabled={isLoading}
                  >
                    <option value="teknik_informatika">Teknik Informatika</option>
                    <option value="sistem_dan_teknologi_informasi">Sistem dan Teknologi Informasi</option>
                  </select>
                </div>
              )}

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={isLoading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full btn-primary py-3 flex items-center justify-center space-x-2 ${
                  isLoading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>{isLoginMode ? 'Signing In...' : 'Creating Account...'}</span>
                  </>
                ) : (
                  <>
                    <span>{isLoginMode ? 'Sign In' : 'Create Account'}</span>
                    <ChevronRight className="h-4 w-4" />
                  </>
                )}
              </motion.button>
            </form>

            {/* Toggle Mode */}
            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => {
                  setIsLoginMode(!isLoginMode);
                  setErrors({});
                  setMessage({ type: '', text: '' });
                  setFormData(prev => ({ ...prev, nama: '', password: '' }));
                }}
                className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                disabled={isLoading}
              >
                {isLoginMode 
                  ? "Don't have an account? Register here" 
                  : 'Already have an account? Sign in here'
                }
              </button>
            </div>

            {/* Security Notice */}
            <div className="mt-6 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-start space-x-2">
                <Shield className="h-4 w-4 text-blue-600 mt-0.5" />
                <p className="text-xs text-blue-700">
                  Your password is used as a seed to generate a unique RSA key pair. This ensures maximum security and your keys are deterministically recreated from your password.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage; 