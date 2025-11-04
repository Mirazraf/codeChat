import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import useAuthStore from '../store/useAuthStore';
import useThemeStore from '../store/useThemeStore';
import { LogOut, User, Code2, MessageSquare, Menu, X, Moon, Sun } from 'lucide-react';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    setMobileMenuOpen(false);
    navigate('/login');
  };

  return (
    <nav className="bg-dark dark:bg-gray-900 text-white shadow-lg fixed top-0 left-0 right-0 z-50 border-b border-gray-700">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <Code2 className="w-8 h-8 text-primary" />
            <span className="text-xl md:text-2xl font-bold">CodeChat</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className="hover:text-primary transition"
                >
                  Dashboard
                </Link>
                <Link
                  to="/chat"
                  className="flex items-center space-x-1 hover:text-primary transition"
                >
                  <MessageSquare className="w-5 h-5" />
                  <span>Chat</span>
                </Link>
                <div className="flex items-center space-x-2">
                  <User className="w-5 h-5" />
                  <span className="hidden lg:inline">{user?.username}</span>
                  <span className="text-xs bg-primary px-2 py-1 rounded">
                    {user?.role}
                  </span>
                </div>
                
                {/* Theme Toggle */}
                <button
                  onClick={toggleTheme}
                  className="p-2 hover:bg-gray-700 rounded-lg transition"
                  title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                >
                  {theme === 'light' ? (
                    <Moon className="w-5 h-5" />
                  ) : (
                    <Sun className="w-5 h-5" />
                  )}
                </button>
                
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 bg-red-600 hover:bg-red-700 px-4 py-2 rounded transition"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden lg:inline">Logout</span>
                </button>
              </>
            ) : (
              <>
                {/* Theme Toggle for non-authenticated users */}
                <button
                  onClick={toggleTheme}
                  className="p-2 hover:bg-gray-700 rounded-lg transition"
                  title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                >
                  {theme === 'light' ? (
                    <Moon className="w-5 h-5" />
                  ) : (
                    <Sun className="w-5 h-5" />
                  )}
                </button>
                
                <Link
                  to="/login"
                  className="hover:text-primary transition"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-primary hover:bg-blue-600 px-4 py-2 rounded transition"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 hover:bg-gray-700 rounded"
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
          <div className="md:hidden py-4 border-t border-gray-700">
            {isAuthenticated ? (
              <div className="space-y-3">
                <div className="flex items-center space-x-2 px-4 py-2">
                  <User className="w-5 h-5" />
                  <span>{user?.username}</span>
                  <span className="text-xs bg-primary px-2 py-1 rounded">
                    {user?.role}
                  </span>
                </div>
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-2 hover:bg-gray-700 transition"
                >
                  Dashboard
                </Link>
                <Link
                  to="/chat"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-700 transition"
                >
                  <MessageSquare className="w-5 h-5" />
                  <span>Chat</span>
                </Link>
                
                {/* Theme Toggle */}
                <button
                  onClick={() => {
                    toggleTheme();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left flex items-center space-x-2 px-4 py-2 hover:bg-gray-700 transition"
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
                  className="w-full text-left flex items-center space-x-2 px-4 py-2 text-red-400 hover:bg-gray-700 transition"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Theme Toggle */}
                <button
                  onClick={() => {
                    toggleTheme();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left flex items-center space-x-2 px-4 py-2 hover:bg-gray-700 transition"
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
                  className="block px-4 py-2 hover:bg-gray-700 transition"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-2 bg-primary hover:bg-blue-600 rounded mx-4 text-center transition"
                >
                  Register
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
