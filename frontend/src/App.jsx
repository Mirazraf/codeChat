import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';
import PublicRoute from './components/PublicRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ChatPage from './pages/ChatPage';
import Profile from './pages/Profile';
import UserProfile from './pages/UserProfile';
import RoomSettings from './pages/RoomSettings';
import useThemeStore from './store/useThemeStore';
import useAuthStore from './store/useAuthStore';
import useChatStore from './store/useChatStore';
import socketService from './services/socketService';

// Scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function App() {
  const { theme, setTheme } = useThemeStore();
  const { checkAuth, isAuthenticated, user } = useAuthStore();
  const { setOnlineUsers } = useChatStore();

  useEffect(() => {
    // Initialize theme and check authentication on app load
    setTheme(theme);
    checkAuth();
  }, []);

  // Global socket connection - connects when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      // Connect socket globally
      const socket = socketService.connect(user._id);
      
      // Listen for online users updates
      socketService.onOnlineUsers((users) => {
        setOnlineUsers(users);
      });
      
      console.log('🌐 Socket connected globally for user:', user.username);
    }
    
    return () => {
      // Disconnect on unmount or logout
      if (!isAuthenticated) {
        socketService.disconnect();
        console.log('🔌 Socket disconnected');
      }
    };
  }, [isAuthenticated, user, setOnlineUsers]);

  return (
    <Router>
      <ScrollToTop />
      <div className="App">
        <Navbar />
        <Routes>
          {/* Home - accessible to all */}
          <Route path="/" element={<Home />} />
          
          {/* Public routes - redirect to dashboard if logged in */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            }
          />
          
          {/* Protected routes - require login */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/chat"
            element={
              <PrivateRoute>
                <ChatPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/chat/room/:roomId/settings"
            element={
              <PrivateRoute>
                <RoomSettings />
              </PrivateRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            }
          />
          <Route
            path="/user/:userId"
            element={
              <PrivateRoute>
                <UserProfile />
              </PrivateRoute>
            }
          />
          
          {/* Catch all - redirect based on auth status */}
          <Route 
            path="*" 
            element={<Navigate to={isAuthenticated ? "/dashboard" : "/"} replace />} 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;