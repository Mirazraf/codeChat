import useAuthStore from '../store/useAuthStore';
import { Code2, Users, MessageSquare, Calendar } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuthStore();

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h1 className="text-4xl font-bold mb-2">
            Welcome back, {user?.username}! 👋
          </h1>
          <p className="text-gray-600">
            You're logged in as a <span className="font-bold text-primary">{user?.role}</span>
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">My Rooms</p>
                <h3 className="text-2xl font-bold">0</h3>
              </div>
              <MessageSquare className="w-12 h-12 text-primary" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Code Sessions</p>
                <h3 className="text-2xl font-bold">0</h3>
              </div>
              <Code2 className="w-12 h-12 text-secondary" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Connections</p>
                <h3 className="text-2xl font-bold">0</h3>
              </div>
              <Users className="w-12 h-12 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Events</p>
                <h3 className="text-2xl font-bold">0</h3>
              </div>
              <Calendar className="w-12 h-12 text-orange-500" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 mt-8">
          <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="bg-primary hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition">
              Create Room
            </button>
            <button className="bg-secondary hover:bg-purple-600 text-white font-bold py-3 px-6 rounded-lg transition">
              Join Session
            </button>
            <button className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition">
              Browse Community
            </button>
          </div>
        </div>

        <div className="bg-gradient-to-r from-primary to-secondary rounded-lg shadow-lg p-8 mt-8 text-white">
          <h2 className="text-2xl font-bold mb-2">🚀 Phase 1 Complete!</h2>
          <p>Authentication system is working. Next up: Real-time chat with Socket.io!</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
