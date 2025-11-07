import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import useAuthStore from '../store/useAuthStore';
import useThemeStore from '../store/useThemeStore';
import useChatStore from '../store/useChatStore';
import { dashboardService } from '../services/dashboardService';
import PageTitle from '../components/PageTitle';

import { 
  Code2, 
  Users, 
  MessageSquare, 
  Calendar, 
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Clock,
  Sparkles,
  Zap,
  Crown,
  Star,
  Activity,
  Loader
} from 'lucide-react';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user } = useAuthStore();
  const { theme } = useThemeStore();
  const { rooms } = useChatStore();
  const navigate = useNavigate();
  const [greeting, setGreeting] = useState('');
  const [stats, setStats] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [popularRooms, setPopularRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Dynamic greeting based on time
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 18) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');

    // Fetch dashboard data
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, activityRes, roomsRes] = await Promise.all([
        dashboardService.getStats(),
        dashboardService.getRecentActivity(),
        dashboardService.getPopularRooms()
      ]);

      if (statsRes.success) setStats(statsRes.data);
      if (activityRes.success) setRecentActivity(activityRes.data);
      if (roomsRes.success) setPopularRooms(roomsRes.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getIconComponent = (iconName) => {
    const icons = {
      MessageSquare,
      Code2,
      Users
    };
    return icons[iconName] || MessageSquare;
  };

  const statsData = stats ? [
    {
      label: 'Active Rooms',
      value: stats.rooms,
      icon: MessageSquare,
      color: theme === 'dark' ? 'purple' : 'teal',
      bgGradient: theme === 'dark' 
        ? 'from-purple-600 to-indigo-600' 
        : 'from-teal-500 to-emerald-500',
      change: '+12%',
      trend: 'up'
    },
    {
      label: 'Code Snippets',
      value: stats.codeSnippets.total,
      icon: Code2,
      color: theme === 'dark' ? 'indigo' : 'cyan',
      bgGradient: theme === 'dark' 
        ? 'from-indigo-600 to-blue-600' 
        : 'from-cyan-500 to-blue-500',
      change: `${stats.codeSnippets.change > 0 ? '+' : ''}${stats.codeSnippets.change}%`,
      trend: stats.codeSnippets.change >= 0 ? 'up' : 'down'
    },
    {
      label: 'Connections',
      value: stats.connections,
      icon: Users,
      color: theme === 'dark' ? 'pink' : 'orange',
      bgGradient: theme === 'dark' 
        ? 'from-pink-600 to-rose-600' 
        : 'from-orange-500 to-red-500',
      change: '+23%',
      trend: 'up'
    },
    {
      label: 'Hours Coded',
      value: stats.hoursEstimate,
      icon: Clock,
      color: theme === 'dark' ? 'violet' : 'green',
      bgGradient: theme === 'dark' 
        ? 'from-violet-600 to-purple-600' 
        : 'from-green-500 to-emerald-500',
      change: '+5h',
      trend: 'up'
    }
  ] : [];

  const quickActions = [
    {
      title: 'Start Chat',
      description: 'Join or create a chat room',
      icon: MessageSquare,
      color: theme === 'dark' ? 'purple' : 'teal',
      path: '/chat'
    },
    {
      title: 'Share Code',
      description: 'Share a code snippet',
      icon: Code2,
      color: theme === 'dark' ? 'indigo' : 'blue',
      path: '/chat'
    },
    {
      title: 'My Profile',
      description: 'View and edit profile',
      icon: Users,
      color: theme === 'dark' ? 'pink' : 'orange',
      path: '/profile'
    }
  ];

  if (loading) {
    return (
      <div className={`min-h-screen pt-16 flex items-center justify-center ${
        theme === 'dark' ? 'bg-[#2d2d3d]' : 'bg-gradient-to-br from-[#d4e8e0] via-[#c8dfd6] to-[#bfd9cc]'
      }`}>
        <div className="text-center">
          <Loader className={`w-12 h-12 animate-spin mx-auto mb-4 ${
            theme === 'dark' ? 'text-purple-500' : 'text-teal-500'
          }`} />
          <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
  <>
  <PageTitle title={`Dashboard`} description={`Welcome back, ${user?.username}!`} />
    <div className={`min-h-screen pt-16 ${
      theme === 'dark' 
        ? 'bg-[#2d2d3d]' 
        : 'bg-gradient-to-br from-[#d4e8e0] via-[#c8dfd6] to-[#bfd9cc]'
    }`}>
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Header */}
        <div className={`rounded-3xl shadow-xl p-8 mb-8 relative overflow-hidden ${
          theme === 'dark'
            ? 'bg-gradient-to-br from-purple-600 via-purple-500 to-indigo-600'
            : 'bg-gradient-to-br from-teal-400 via-emerald-400 to-green-400'
        }`}>
          {/* Decorative elements */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          </div>

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-white" />
                <span className="text-white/80 text-sm font-medium">{greeting}</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                Welcome back, {user?.username}! 👋
              </h1>
              <p className="text-white/90 text-lg">
                Ready to code something amazing today?
              </p>
              <div className="flex items-center gap-2 mt-3">
                <div className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full flex items-center gap-2">
                  <Crown className="w-4 h-4 text-yellow-300" />
                  <span className="text-white text-sm font-medium capitalize">{user?.role}</span>
                </div>
                <div className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full flex items-center gap-2">
                  <Activity className="w-4 h-4 text-green-300" />
                  <span className="text-white text-sm font-medium">Active</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => navigate('/chat')}
              className="group bg-white text-gray-900 px-6 py-3 rounded-xl font-semibold flex items-center gap-2 hover:scale-105 transition shadow-lg"
            >
              Start Chatting
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition" />
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsData.map((stat, index) => {
            const TrendIcon = stat.trend === 'up' ? TrendingUp : TrendingDown;
            return (
              <div
                key={index}
                className={`group rounded-2xl p-6 transition-all hover:scale-105 cursor-pointer ${
                  theme === 'dark'
                    ? 'bg-[#1e1e2d] border border-gray-700 hover:border-gray-600'
                    : 'bg-white border border-gray-200 hover:shadow-xl'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className={`text-sm mb-1 ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {stat.label}
                    </p>
                    <h3 className={`text-3xl font-bold ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      {stat.value}
                    </h3>
                  </div>
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.bgGradient} flex items-center justify-center shadow-lg`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <TrendIcon className={`w-4 h-4 ${
                    stat.trend === 'up'
                      ? theme === 'dark' ? 'text-green-400' : 'text-green-600'
                      : theme === 'dark' ? 'text-red-400' : 'text-red-600'
                  }`} />
                  <span className={`text-sm font-medium ${
                    stat.trend === 'up'
                      ? theme === 'dark' ? 'text-green-400' : 'text-green-600'
                      : theme === 'dark' ? 'text-red-400' : 'text-red-600'
                  }`}>
                    {stat.change}
                  </span>
                  <span className={`text-sm ${
                    theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
                  }`}>
                    vs last week
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <div className={`rounded-2xl p-6 ${
              theme === 'dark'
                ? 'bg-[#1e1e2d] border border-gray-700'
                : 'bg-white border border-gray-200 shadow-lg'
            }`}>
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-2xl font-bold ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  Quick Actions
                </h2>
                <Zap className={`w-6 h-6 ${
                  theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'
                }`} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={() => navigate(action.path)}
                    className={`group p-5 rounded-xl transition-all hover:scale-105 text-left ${
                      theme === 'dark'
                        ? 'bg-[#2d2d3d] hover:bg-[#363648] border border-gray-700'
                        : 'bg-gray-50 hover:bg-white border border-gray-200 hover:shadow-lg'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-lg mb-4 flex items-center justify-center ${
                      theme === 'dark'
                        ? `bg-${action.color}-600/20`
                        : `bg-${action.color}-100`
                    }`}>
                      <action.icon className={`w-6 h-6 ${
                        theme === 'dark' 
                          ? `text-${action.color}-400` 
                          : `text-${action.color}-600`
                      }`} />
                    </div>
                    <h3 className={`font-bold mb-1 ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      {action.title}
                    </h3>
                    <p className={`text-sm ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {action.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Popular Rooms */}
            <div className={`rounded-2xl p-6 mt-6 ${
              theme === 'dark'
                ? 'bg-[#1e1e2d] border border-gray-700'
                : 'bg-white border border-gray-200 shadow-lg'
            }`}>
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-2xl font-bold ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  Popular Rooms
                </h2>
                <button 
                  onClick={() => navigate('/chat')}
                  className={`text-sm font-medium flex items-center gap-1 ${
                    theme === 'dark' ? 'text-purple-400 hover:text-purple-300' : 'text-teal-600 hover:text-teal-700'
                  }`}
                >
                  View All
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3">
                {popularRooms.length > 0 ? (
                  popularRooms.map((room, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-xl flex items-center justify-between transition hover:scale-102 cursor-pointer ${
                        theme === 'dark'
                          ? 'bg-[#2d2d3d] hover:bg-[#363648]'
                          : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                      onClick={() => navigate('/chat')}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          theme === 'dark'
                            ? 'bg-purple-600/20 text-purple-400'
                            : 'bg-teal-100 text-teal-600'
                        }`}>
                          <MessageSquare className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className={`font-semibold ${
                            theme === 'dark' ? 'text-white' : 'text-gray-900'
                          }`}>
                            {room.name}
                          </h4>
                          <p className={`text-xs ${
                            theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
                          }`}>
                            {room.membersCount} members • {room.messageCount} messages
                          </p>
                        </div>
                      </div>
                      <button className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                        theme === 'dark'
                          ? 'bg-purple-600 hover:bg-purple-700 text-white'
                          : 'bg-teal-500 hover:bg-teal-600 text-white'
                      }`}>
                        Join
                      </button>
                    </div>
                  ))
                ) : (
                  <p className={`text-center py-8 ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    No active rooms yet. Create one to get started!
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar - Recent Activity & Profile Card */}
          <div className="space-y-6">
            {/* Profile Quick View */}
            <div className={`rounded-2xl p-6 ${
              theme === 'dark'
                ? 'bg-[#1e1e2d] border border-gray-700'
                : 'bg-white border border-gray-200 shadow-lg'
            }`}>
              <div className="flex items-center gap-4 mb-4">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold ${
                  theme === 'dark'
                    ? 'bg-gradient-to-br from-purple-600 to-indigo-600 text-white'
                    : 'bg-gradient-to-br from-teal-500 to-emerald-500 text-white'
                }`}>
                  {user?.username?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <h3 className={`font-bold text-lg ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    {user?.username}
                  </h3>
                  <p className={`text-sm ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {user?.email}
                  </p>
                </div>
              </div>

              <button
                onClick={() => navigate('/profile')}
                className={`w-full py-3 rounded-lg font-medium transition ${
                  theme === 'dark'
                    ? 'bg-[#2d2d3d] hover:bg-[#363648] text-white border border-gray-700'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                }`}
              >
                View Profile
              </button>
            </div>

            {/* Recent Activity */}
            <div className={`rounded-2xl p-6 ${
              theme === 'dark'
                ? 'bg-[#1e1e2d] border border-gray-700'
                : 'bg-white border border-gray-200 shadow-lg'
            }`}>
              <h3 className={`font-bold text-lg mb-4 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                Recent Activity
              </h3>

              <div className="space-y-4">
                {recentActivity.length > 0 ? (
                  recentActivity.map((activity, index) => {
                    const IconComponent = getIconComponent(activity.icon);
                    const color = activity.type === 'room' 
                      ? (theme === 'dark' ? 'purple' : 'teal')
                      : (theme === 'dark' ? 'indigo' : 'blue');
                    
                    return (
                      <div key={index} className="flex items-start gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          theme === 'dark'
                            ? `bg-${color}-600/20`
                            : `bg-${color}-100`
                        }`}>
                          <IconComponent className={`w-4 h-4 ${
                            theme === 'dark' 
                              ? `text-${color}-400` 
                              : `text-${color}-600`
                          }`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm ${
                            theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                          }`}>
                            <span className="font-medium">{activity.action}</span>{' '}
                            <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                              {activity.target}
                            </span>
                          </p>
                          <p className={`text-xs mt-1 ${
                            theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
                          }`}>
                            {activity.time}
                          </p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className={`text-center py-4 text-sm ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    No recent activity yet
                  </p>
                )}
              </div>
            </div>

            {/* Achievement Badge */}
            {stats && stats.activeStreak > 0 && (
              <div className={`rounded-2xl p-6 relative overflow-hidden ${
                theme === 'dark'
                  ? 'bg-gradient-to-br from-yellow-600/20 to-orange-600/20 border border-yellow-600/30'
                  : 'bg-gradient-to-br from-yellow-100 to-orange-100 border border-yellow-200'
              }`}>
                <div className="absolute top-0 right-0 opacity-10">
                  <Star className="w-32 h-32" />
                </div>
                <div className="relative z-10">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${
                    theme === 'dark' ? 'bg-yellow-500' : 'bg-yellow-400'
                  }`}>
                    <Star className="w-6 h-6 text-white fill-white" />
                  </div>
                  <h4 className={`font-bold mb-1 ${
                    theme === 'dark' ? 'text-yellow-400' : 'text-yellow-700'
                  }`}>
                    {stats.activeStreak >= 7 ? 'Rising Star' : 'Getting Started'}
                  </h4>
                  <p className={`text-sm ${
                    theme === 'dark' ? 'text-yellow-200/80' : 'text-yellow-800'
                  }`}>
                    You've been active for {stats.activeStreak} day{stats.activeStreak !== 1 ? 's' : ''} {stats.activeStreak >= 7 ? 'straight' : ''}! 
                    {stats.activeStreak >= 7 ? ' Keep it up! 🎉' : ' Keep going! 💪'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default Dashboard;