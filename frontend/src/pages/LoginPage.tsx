import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import Button from '../components/Button';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../contexts/NotificationContext';
import { readSelectedTextOr, stopReading } from '../utils/immersiveReader';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { addNotification } = useNotifications();

  // Debug: log mount/unmount
  useEffect(() => {
    console.log('LoginPage mounted');
    return () => {
      console.log('LoginPage unmounted');
    };
  }, []);

  // Debug: test error rendering
  // Uncomment the next line to always show a test error
  // useEffect(() => { setError('Test error: This should always be visible above the form.'); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    console.log('Submitting login form');
    try {
      const loggedInUser = await login(email, password);
      console.log('Login success, user:', loggedInUser);
      // Redirect based on role
      if (loggedInUser?.role === 'hr') {
        navigate('/hr-dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (error: any) {
      setError(error?.message || 'Invalid email or password');
      console.error('Login failed:', error);
      console.log('Error state:', error?.message || error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-4/5 h-20 bg-white border-2 border-blue-400 rounded-xl shadow-lg mb-4 transition-transform duration-300 hover:scale-105 hover:shadow-2xl mx-auto">
              <img
                src="https://lloydstechnologycentre.com/assets/site/ltc-new-logo.svg"
                alt="Lloyds Technology Centre Logo"
                className="object-contain h-16 w-full"
                style={{ maxWidth: '100%' }}
              />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome !</h1>
            <p className="text-gray-600">Sign in to continue your onboarding journey</p>
          </div>

          {error && (
            <div className="mb-4 text-center text-red-600 text-sm font-medium border-2 border-red-400 bg-red-50 p-2 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-600">Remember me</span>
              </label>
              <a href="#" className="text-sm text-blue-600 hover:text-blue-500 transition-colors">
                Forgot password?
              </a>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full"
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          {/* <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              Demo Accounts:
            </p>
            <div className="mt-2 space-y-1 text-xs text-gray-500">
              <p>Candidate: candidate@example.com / password</p>
              <p>HR Manager: hr@company.com / password</p>
            </div>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;