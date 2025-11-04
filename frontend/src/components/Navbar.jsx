import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import { LogOut, User, Code2 } from 'lucide-react';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="bg-dark text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <Code2 className="w-8 h-8 text-primary" />
            <span className="text-2xl font-bold">CodeChat</span>
          </Link>

          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className="hover:text-primary transition"
                >
                  Dashboard
                </Link>
                <div className="flex items-center space-x-2">
                  <User className="w-5 h-5" />
                  <span>{user?.username}</span>
                  <span className="text-xs bg-primary px-2 py-1 rounded">
                    {user?.role}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 bg-red-600 hover:bg-red-700 px-4 py-2 rounded transition"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
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
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
