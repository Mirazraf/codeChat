import { Link } from 'react-router-dom';
import { Code2, Users, MessageSquare, Zap } from 'lucide-react';

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pt-16">
      <div className="container mx-auto px-4 py-20">
        <div className="text-center text-white">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Welcome to <span className="text-primary">CodeChat</span>
          </h1>
          <p className="text-lg md:text-xl mb-8 text-gray-300 max-w-2xl mx-auto">
            The ultimate platform for programmers, learners, and teachers to collaborate and learn together
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/register"
              className="bg-primary hover:bg-blue-600 text-white font-bold py-3 px-8 rounded-lg transition text-lg"
            >
              Get Started
            </Link>
            <Link
              to="/login"
              className="bg-transparent border-2 border-white hover:bg-white hover:text-slate-900 text-white font-bold py-3 px-8 rounded-lg transition text-lg"
            >
              Login
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 mt-20">
          <div className="bg-white bg-opacity-10 backdrop-blur-lg p-6 rounded-lg">
            <Code2 className="w-12 h-12 text-primary mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Code Together</h3>
            <p className="text-gray-300 text-sm">Real-time collaborative coding with syntax highlighting</p>
          </div>
          <div className="bg-white bg-opacity-10 backdrop-blur-lg p-6 rounded-lg">
            <MessageSquare className="w-12 h-12 text-primary mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Smart Chat</h3>
            <p className="text-gray-300 text-sm">Share code snippets, files, and ideas instantly</p>
          </div>
          <div className="bg-white bg-opacity-10 backdrop-blur-lg p-6 rounded-lg">
            <Users className="w-12 h-12 text-primary mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Learn Together</h3>
            <p className="text-gray-300 text-sm">Join classrooms, workshops, and study groups</p>
          </div>
          <div className="bg-white bg-opacity-10 backdrop-blur-lg p-6 rounded-lg">
            <Zap className="w-12 h-12 text-primary mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Fast & Secure</h3>
            <p className="text-gray-300 text-sm">Built with modern tech for speed and security</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
