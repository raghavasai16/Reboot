import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import { Link } from 'react-router-dom';
import { 
  User, 
  Bell, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  Home,
  FileText,
  Award
} from 'lucide-react';
import Button from './Button';
import { playNotification } from '../utils/audioFeedback';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: user?.role === 'hr' ? '/hr-dashboard' : '/dashboard', icon: Home },
    { name: 'Onboarding', href: '/onboarding', icon: FileText },
    // { name: 'Gamification', href: '/gamification', icon: Award },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 bg-white shadow-sm border-b border-gray-200 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center space-x-2">
              <div className="bg-green-900 rounded-lg inline-flex items-center justify-center px-3 py-1">
                <span className="text-white font-bold text-sm">Lloyds Technology Centre</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Onboarding</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6" role="navigation" aria-label="Main Navigation">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors"
              >
                <item.icon className="w-4 h-4" />
                <span className="text-sm font-medium">{item.name}</span>
              </Link>
            ))}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <div className="relative">
              <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>
            </div>

            {/* User Profile */}
            <div className="relative">
              <button
                onClick={() => {
                  setIsProfileOpen(!isProfileOpen);
                  playNotification();
                }}
                className="flex items-center space-x-3 text-gray-700 hover:text-gray-900 transition-colors"
                aria-label="Open user profile menu"
                aria-haspopup="true"
                aria-expanded={isProfileOpen}
              >
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5" />
                </div>
                <span className="hidden md:block text-sm font-medium">{user?.name}</span>
              </button>

              {/* Profile Dropdown */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                  <div className="px-4 py-2 text-sm text-gray-500 border-b border-gray-100">
                    {user?.email}
                  </div>
                  <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </button>
                  <button 
                    onClick={logout}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => {
                setIsMenuOpen(!isMenuOpen);
                playNotification();
              }}
              className="md:hidden p-2 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label={isMenuOpen ? 'Close mobile menu' : 'Open mobile menu'}
              aria-haspopup="true"
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <item.icon className="w-4 h-4" />
                <span className="text-sm font-medium">{item.name}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;