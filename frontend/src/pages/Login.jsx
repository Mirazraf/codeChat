import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import useThemeStore from '../store/useThemeStore';
import toast, { Toaster } from 'react-hot-toast';
import { Eye, EyeOff, ArrowRight, Code2 } from 'lucide-react';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);

  const { login, loading, isAuthenticated } = useAuthStore();
  const { theme } = useThemeStore();
  const navigate = useNavigate();

  // Redirect if already logged in (double check)
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const result = await login(formData);
      
      if (result.success) {
        toast.success('Login successful! 🎉');
        setTimeout(() => {
          navigate('/dashboard');
        }, 500);
      }
    } catch (err) {
      toast.error(err.message || 'Login failed. Please check your credentials.');
      console.error('Login error:', err);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${
      theme === 'dark' 
        ? 'bg-[#2d2d3d]' 
        : 'bg-gradient-to-br from-[#d4e8e0] via-[#c8dfd6] to-[#bfd9cc]'
    }`}>
      <Toaster position="top-right" />
      
      {/* Main Container */}
      <div className={`w-full max-w-6xl rounded-3xl shadow-2xl overflow-hidden flex ${
        theme === 'dark' ? 'bg-[#1e1e2d]' : 'bg-white'
      }`}>
        
        {/* Left Side - Image/Branding (Hidden on mobile) */}
        <div className={`hidden lg:flex lg:w-1/2 p-12 flex-col justify-between relative overflow-hidden ${
          theme === 'dark'
            ? 'bg-gradient-to-br from-purple-600 via-purple-500 to-indigo-600'
            : 'bg-gradient-to-br from-teal-400 via-emerald-400 to-green-400'
        }`}>
          {/* Logo */}
          <div className="flex items-center gap-2 text-white z-10">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              theme === 'dark' ? 'bg-white/20 backdrop-blur-sm' : 'bg-white/30 backdrop-blur-sm'
            }`}>
              <Code2 className="w-6 h-6" />
            </div>
            <span className="text-2xl font-bold">CodeChat</span>
          </div>

          {/* Center Content */}
          <div className="z-10">
            <h2 className="text-4xl font-bold text-white mb-4 leading-tight">
              Connect, Code,
              <br />
              Collaborate Together
            </h2>
          </div>

          {/* Decorative Elements */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white rounded-full blur-3xl"></div>
            <div className={`absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl ${
              theme === 'dark' ? 'bg-indigo-300' : 'bg-teal-200'
            }`}></div>
          </div>

          {/* Pagination Dots */}
          <div className="flex gap-2 z-10">
            <div className="w-8 h-2 bg-white rounded-full"></div>
            <div className="w-2 h-2 bg-white/40 rounded-full"></div>
            <div className="w-2 h-2 bg-white/40 rounded-full"></div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className={`w-full lg:w-1/2 p-8 sm:p-12 ${
          theme === 'dark' ? '' : 'bg-white'
        }`}>
          {/* Back to website link */}
          <div className="flex justify-end mb-8">
            <Link 
              to="/"
              className={`flex items-center gap-2 text-sm transition ${
                theme === 'dark' 
                  ? 'text-gray-400 hover:text-white' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <span>Back to website</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h1 className={`text-4xl font-bold mb-3 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Welcome back
            </h1>
            <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
              Don't have an account?{' '}
              <Link 
                to="/register" 
                className={theme === 'dark' ? 'text-purple-400 hover:text-purple-300' : 'text-teal-600 hover:text-teal-700'}
              >
                Sign up
              </Link>
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email"
                className={`w-full px-4 py-3 rounded-lg transition ${
                  theme === 'dark'
                    ? 'bg-[#2d2d3d] border border-gray-700 text-white placeholder-gray-500 focus:border-purple-500'
                    : 'bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-500 focus:border-teal-500 focus:ring-2 focus:ring-teal-200'
                } focus:outline-none`}
                required
                disabled={loading}
              />
            </div>

            {/* Password */}
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className={`w-full px-4 py-3 rounded-lg transition ${
                  theme === 'dark'
                    ? 'bg-[#2d2d3d] border border-gray-700 text-white placeholder-gray-500 focus:border-purple-500'
                    : 'bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-500 focus:border-teal-500 focus:ring-2 focus:ring-teal-200'
                } focus:outline-none`}
                required
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={`absolute right-3 top-1/2 -translate-y-1/2 transition ${
                  theme === 'dark' 
                    ? 'text-gray-400 hover:text-white' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {/* Forgot Password */}
            <div className="text-right">
              <a 
                href="#" 
                className={`text-sm transition ${
                  theme === 'dark' 
                    ? 'text-purple-400 hover:text-purple-300' 
                    : 'text-teal-600 hover:text-teal-700'
                }`}
              >
                Forgot password?
              </a>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full font-semibold py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed ${
                theme === 'dark'
                  ? 'bg-purple-600 hover:bg-purple-700 text-white'
                  : 'bg-gray-800 hover:bg-gray-900 text-white shadow-lg hover:shadow-xl'
              }`}
            >
              {loading ? 'Logging in...' : 'Log in'}
            </button>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className={`w-full border-t ${
                  theme === 'dark' ? 'border-gray-700' : 'border-gray-300'
                }`}></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className={`px-4 ${
                  theme === 'dark' 
                    ? 'bg-[#1e1e2d] text-gray-400' 
                    : 'bg-white text-gray-600'
                }`}>
                  Or continue with
                </span>
              </div>
            </div>

            {/* Social Login Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition ${
                  theme === 'dark'
                    ? 'bg-[#2d2d3d] border border-gray-700 text-white hover:border-gray-600'
                    : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50'
                }`}
                onClick={() => toast.info('Google login coming soon!')}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span>Google</span>
              </button>

              <button
                type="button"
                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition ${
                  theme === 'dark'
                    ? 'bg-[#2d2d3d] border border-gray-700 text-white hover:border-gray-600'
                    : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50'
                }`}
                onClick={() => toast.info('GitHub login coming soon!')}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd"/>
                </svg>
                <span>GitHub</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;