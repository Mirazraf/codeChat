import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import useAuthStore from '../store/useAuthStore';
import useThemeStore from '../store/useThemeStore';
import { LogOut, User, Code2, MessageSquare, Menu, X, Moon, Sun, ChevronDown } from 'lucide-react';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
    navigate('/login');
  };

  return (
    <nav className={`border-b shadow-lg fixed top-0 left-0 right-0 z-50 ${
      theme === 'dark'
        ? 'bg-[#1e1e2d] border-gray-700'
        : 'bg-white border-gray-200'
    }`}>
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform ${
              theme === 'dark'
                ? 'bg-gradient-to-br from-purple-600 to-indigo-600'
                : 'bg-gradient-to-br from-teal-500 to-emerald-500'
            }`}>
              <Code2 className="w-6 h-6 text-white" />
            </div>
            <span className={`text-xl md:text-2xl font-bold ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              CodeChat
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <>
                {/* Dashboard Link */}
                <Link
                  to="/dashboard"
                  className={`px-4 py-2 rounded-lg transition ${
                    theme === 'dark'
                      ? 'text-gray-300 hover:text-white hover:bg-[#2d2d3d]'
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  Dashboard
                </Link>

                {/* Chat Link */}
                <Link
                  to="/chat"
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                    theme === 'dark'
                      ? 'text-gray-300 hover:text-white hover:bg-[#2d2d3d]'
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <MessageSquare className="w-5 h-5" />
                  <span>Chat</span>
                </Link>

                {/* Theme Toggle */}
                <button
                  onClick={toggleTheme}
                  className={`p-2 rounded-lg transition ${
                    theme === 'dark'
                      ? 'text-gray-300 hover:text-white hover:bg-[#2d2d3d]'
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                  title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                >
                  {theme === 'light' ? (
                    <Moon className="w-5 h-5" />
                  ) : (
                    <Sun className="w-5 h-5" />
                  )}
                </button>

                {/* User Menu */}
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                      theme === 'dark'
                        ? 'bg-[#2d2d3d] hover:bg-[#363644]'
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      theme === 'dark'
                        ? 'bg-gradient-to-br from-purple-600 to-indigo-600'
                        : 'bg-gradient-to-br from-teal-500 to-emerald-500'
                    }`}>
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-left hidden lg:block">
                      <div className={`text-sm font-medium ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>
                        {user?.username}
                      </div>
                      <div className={`text-xs capitalize ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        {user?.role}
                      </div>
                    </div>
                    <ChevronDown className={`w-4 h-4 transition-transform ${
                      userMenuOpen ? 'rotate-180' : ''
                    } ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
                  </button>

                  {/* Dropdown Menu */}
                  {userMenuOpen && (
                    <>
                      <div 
                        className="fixed inset-0 z-10" 
                        onClick={() => setUserMenuOpen(false)}
                      ></div>
                      <div className={`absolute right-0 mt-2 w-56 rounded-lg shadow-xl py-2 z-20 ${
                        theme === 'dark'
                          ? 'bg-[#2d2d3d] border border-gray-700'
                          : 'bg-white border border-gray-200'
                      }`}>
                        <div className={`px-4 py-3 border-b ${
                          theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
                        }`}>
                          <p className={`text-sm font-medium ${
                            theme === 'dark' ? 'text-white' : 'text-gray-900'
                          }`}>
                            {user?.username}
                          </p>
                          <p className={`text-xs ${
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            {user?.email}
                          </p>
                        </div>
                        {/* FIXED: Changed to="/profile" instead of to="/dashboard" */}
                        <Link
                          to="/profile"
                          onClick={() => setUserMenuOpen(false)}
                          className={`flex items-center gap-2 px-4 py-2 transition ${
                            theme === 'dark'
                              ? 'text-gray-300 hover:bg-[#363644] hover:text-white'
                              : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                          }`}
                        >
                          <User className="w-4 h-4" />
                          <span>Profile</span>
                        </Link>
                        <button
                          onClick={handleLogout}
                          className={`w-full flex items-center gap-2 px-4 py-2 transition ${
                            theme === 'dark'
                              ? 'text-red-400 hover:bg-[#363644] hover:text-red-300'
                              : 'text-red-600 hover:bg-red-50 hover:text-red-700'
                          }`}
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Logout</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <>
                {/* Theme Toggle */}
                <button
                  onClick={toggleTheme}
                  className={`p-2 rounded-lg transition ${
                    theme === 'dark'
                      ? 'text-gray-300 hover:text-white hover:bg-[#2d2d3d]'
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                  title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                >
                  {theme === 'light' ? (
                    <Moon className="w-5 h-5" />
                  ) : (
                    <Sun className="w-5 h-5" />
                  )}
                </button>

                {/* Login Button */}
                <Link
                  to="/login"
                  className={`px-4 py-2 rounded-lg transition ${
                    theme === 'dark'
                      ? 'text-gray-300 hover:text-white hover:bg-[#2d2d3d]'
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  Login
                </Link>

                {/* Register Button */}
                <Link
                  to="/register"
                  className={`px-6 py-2 font-semibold rounded-lg transition shadow-lg text-white ${
                    theme === 'dark'
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700'
                      : 'bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600'
                  }`}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`md:hidden p-2 rounded-lg transition ${
              theme === 'dark'
                ? 'text-gray-300 hover:text-white hover:bg-[#2d2d3d]'
                : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className={`md:hidden py-4 border-t ${
            theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
          }`}>
            {isAuthenticated ? (
              <div className="space-y-2">
                {/* User Info */}
                <div className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-4 ${
                  theme === 'dark' ? 'bg-[#2d2d3d]' : 'bg-gray-100'
                }`}>
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    theme === 'dark'
                      ? 'bg-gradient-to-br from-purple-600 to-indigo-600'
                      : 'bg-gradient-to-br from-teal-500 to-emerald-500'
                  }`}>
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className={`text-sm font-medium ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      {user?.username}
                    </div>
                    <div className={`text-xs capitalize ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {user?.role}
                    </div>
                  </div>
                </div>

                {/* ADDED: Profile Link for Mobile */}
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-lg transition ${
                    theme === 'dark'
                      ? 'text-gray-300 hover:text-white hover:bg-[#2d2d3d]'
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <User className="w-5 h-5" />
                  <span>Profile</span>
                </Link>

                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-4 py-3 rounded-lg transition ${
                    theme === 'dark'
                      ? 'text-gray-300 hover:text-white hover:bg-[#2d2d3d]'
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/chat"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-lg transition ${
                    theme === 'dark'
                      ? 'text-gray-300 hover:text-white hover:bg-[#2d2d3d]'
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <MessageSquare className="w-5 h-5" />
                  <span>Chat</span>
                </Link>
                <button
                  onClick={toggleTheme}
                  className={`w-full flex items-center gap-2 px-4 py-3 rounded-lg transition ${
                    theme === 'dark'
                      ? 'text-gray-300 hover:text-white hover:bg-[#2d2d3d]'
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  {theme === 'light' ? (
                    <>
                      <Moon className="w-5 h-5" />
                      <span>Dark Mode</span>
                    </>
                  ) : (
                    <>
                      <Sun className="w-5 h-5" />
                      <span>Light Mode</span>
                    </>
                  )}
                </button>
                <button
                  onClick={handleLogout}
                  className={`w-full flex items-center gap-2 px-4 py-3 rounded-lg transition ${
                    theme === 'dark'
                      ? 'text-red-400 hover:text-red-300 hover:bg-[#2d2d3d]'
                      : 'text-red-600 hover:text-red-700 hover:bg-red-50'
                  }`}
                >
                  <LogOut className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <button
                  onClick={toggleTheme}
                  className={`w-full flex items-center gap-2 px-4 py-3 rounded-lg transition ${
                    theme === 'dark'
                      ? 'text-gray-300 hover:text-white hover:bg-[#2d2d3d]'
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  {theme === 'light' ? (
                    <>
                      <Moon className="w-5 h-5" />
                      <span>Dark Mode</span>
                    </>
                  ) : (
                    <>
                      <Sun className="w-5 h-5" />
                      <span>Light Mode</span>
                    </>
                  )}
                </button>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-4 py-3 rounded-lg transition text-center ${
                    theme === 'dark'
                      ? 'text-gray-300 hover:text-white hover:bg-[#2d2d3d]'
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-4 py-3 font-semibold rounded-lg text-center shadow-lg text-white ${
                    theme === 'dark'
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600'
                      : 'bg-gradient-to-r from-teal-500 to-emerald-500'
                  }`}
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;