import { Link } from 'react-router-dom';
import { Code2, Users, MessageSquare, Zap, ArrowRight, Sparkles, Shield, Rocket } from 'lucide-react';
import useThemeStore from '../store/useThemeStore';
import useAuthStore from '../store/useAuthStore';
import PageTitle from '../components/PageTitle';


const Home = () => {
  const { theme } = useThemeStore();
  const { isAuthenticated } = useAuthStore();

  return (
    <>
      <PageTitle 
        title="Home" 
        description="Join thousands of developers collaborating in real-time. Share code, chat, and learn together on CodeChat." 
      />
    <div className={`min-h-screen pt-16 ${
      theme === 'dark' 
        ? 'bg-[#2d2d3d]' 
        : 'bg-gradient-to-br from-[#d4e8e0] via-[#c8dfd6] to-[#bfd9cc]'
    }`}>
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 lg:py-32">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          {/* Left Side - Text Content */}
          <div className="flex-1 text-center lg:text-left">
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 ${
              theme === 'dark'
                ? 'bg-purple-600/20 text-purple-400 border border-purple-600/30'
                : 'bg-teal-100 text-teal-700 border border-teal-200'
            }`}>
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">Real-time Collaboration</span>
            </div>

            <h1 className={`text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Code, Chat & Collaborate{' '}
              <span className={`${
                theme === 'dark'
                  ? 'bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent'
                  : 'bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent'
              }`}>
                Together
              </span>
            </h1>

            <p className={`text-lg md:text-xl mb-8 max-w-2xl ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>
              The ultimate platform for developers to share code, collaborate in real-time, 
              and build amazing things together. Join thousands of developers worldwide.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              {!isAuthenticated ? (
                <>
                  <Link
                    to="/register"
                    className={`group inline-flex items-center justify-center gap-2 font-semibold py-3 px-8 rounded-lg transition shadow-lg hover:shadow-xl ${
                      theme === 'dark'
                        ? 'bg-purple-600 hover:bg-purple-700 text-white'
                        : 'bg-gray-800 hover:bg-gray-900 text-white'
                    }`}
                  >
                    Get Started Free
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition" />
                  </Link>
                  <Link
                    to="/login"
                    className={`inline-flex items-center justify-center gap-2 font-semibold py-3 px-8 rounded-lg transition ${
                      theme === 'dark'
                        ? 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                        : 'bg-white hover:bg-gray-50 text-gray-900 border-2 border-gray-300'
                    }`}
                  >
                    Sign In
                  </Link>
                </>
              ) : (
                <Link
                  to="/dashboard"
                  className={`group inline-flex items-center justify-center gap-2 font-semibold py-3 px-8 rounded-lg transition shadow-lg hover:shadow-xl ${
                    theme === 'dark'
                      ? 'bg-purple-600 hover:bg-purple-700 text-white'
                      : 'bg-gray-800 hover:bg-gray-900 text-white'
                  }`}
                >
                  Go to Dashboard
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition" />
                </Link>
              )}
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-8 mt-12 justify-center lg:justify-start">
              <div>
                <div className={`text-3xl font-bold ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  10K+
                </div>
                <div className={`text-sm ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Active Users
                </div>
              </div>
              <div>
                <div className={`text-3xl font-bold ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  50K+
                </div>
                <div className={`text-sm ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Code Snippets Shared
                </div>
              </div>
              <div>
                <div className={`text-3xl font-bold ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  24/7
                </div>
                <div className={`text-sm ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Real-time Support
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Visual/Mockup */}
          <div className="flex-1 relative">
            <div className={`relative rounded-2xl overflow-hidden shadow-2xl ${
              theme === 'dark'
                ? 'bg-[#1e1e2d] border border-gray-700'
                : 'bg-white border border-gray-200'
            }`}>
              {/* Mock Chat Window */}
              <div className={`p-4 border-b flex items-center gap-3 ${
                theme === 'dark' ? 'border-gray-700 bg-[#1e1e2d]' : 'border-gray-200 bg-white'
              }`}>
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <div className={`text-sm font-medium ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  CodeChat - Live Session
                </div>
              </div>
              <div className={`p-6 space-y-4 ${
                theme === 'dark' ? 'bg-[#2d2d3d]' : 'bg-gradient-to-br from-gray-50 to-gray-100'
              }`}>
                {/* Mock Messages */}
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    theme === 'dark'
                      ? 'bg-purple-600 text-white'
                      : 'bg-teal-500 text-white'
                  }`}>
                    <Code2 className="w-5 h-5" />
                  </div>
                  <div className={`flex-1 rounded-lg p-3 ${
                    theme === 'dark'
                      ? 'bg-[#1e1e2d] border border-gray-700'
                      : 'bg-white border border-gray-200 shadow-sm'
                  }`}>
                    <div className={`text-sm font-medium mb-1 ${
                      theme === 'dark' ? 'text-purple-400' : 'text-teal-600'
                    }`}>
                      Sarah
                    </div>
                    <div className={`text-sm ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Check out this React hook! 🚀
                    </div>
                    <div className={`mt-2 p-3 rounded font-mono text-xs ${
                      theme === 'dark'
                        ? 'bg-[#2d2d3d] text-gray-300'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      const [count, setCount] = useState(0);
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 justify-end">
                  <div className={`flex-1 max-w-xs rounded-lg p-3 ${
                    theme === 'dark'
                      ? 'bg-gradient-to-br from-purple-600 to-indigo-600 text-white'
                      : 'bg-gray-800 text-white shadow-sm'
                  }`}>
                    <div className={`text-sm ${
                      theme === 'dark' ? 'text-white' : 'text-white'
                    }`}>
                      That's awesome! Let me try it 💡
                    </div>
                  </div>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    theme === 'dark'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-emerald-500 text-white'
                  }`}>
                    <Users className="w-5 h-5" />
                  </div>
                </div>

                <div className={`flex items-center gap-2 text-xs ${
                  theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
                }`}>
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                  <span>3 people are typing...</span>
                </div>
              </div>
            </div>

            {/* Floating Elements */}
            <div className={`absolute -top-4 -right-4 p-4 rounded-xl shadow-lg ${
              theme === 'dark'
                ? 'bg-purple-600 text-white'
                : 'bg-teal-500 text-white'
            }`}>
              <Zap className="w-6 h-6" />
            </div>
            <div className={`absolute -bottom-4 -left-4 p-4 rounded-xl shadow-lg ${
              theme === 'dark'
                ? 'bg-indigo-600 text-white'
                : 'bg-emerald-500 text-white'
            }`}>
              <Rocket className="w-6 h-6" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className={`py-20 ${
        theme === 'dark' ? 'bg-[#1e1e2d]' : 'bg-white/50 backdrop-blur-sm'
      }`}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Everything You Need to Collaborate
            </h2>
            <p className={`text-lg max-w-2xl mx-auto ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Powerful features designed for modern developers
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature Cards */}
            {[
              {
                icon: Code2,
                title: 'Code Sharing',
                description: 'Share code snippets with syntax highlighting for 100+ languages',
                color: theme === 'dark' ? 'purple' : 'teal'
              },
              {
                icon: MessageSquare,
                title: 'Real-time Chat',
                description: 'Instant messaging with file sharing and emoji reactions',
                color: theme === 'dark' ? 'indigo' : 'emerald'
              },
              {
                icon: Users,
                title: 'Team Rooms',
                description: 'Create private rooms for your team or study group',
                color: theme === 'dark' ? 'pink' : 'cyan'
              },
              {
                icon: Shield,
                title: 'Secure & Private',
                description: 'End-to-end encryption for all your conversations',
                color: theme === 'dark' ? 'purple' : 'blue'
              }
            ].map((feature, index) => (
              <div
                key={index}
                className={`group p-6 rounded-2xl transition-all hover:scale-105 ${
                  theme === 'dark'
                    ? 'bg-[#2d2d3d] hover:bg-[#363648] border border-gray-700'
                    : 'bg-white hover:shadow-xl border border-gray-200'
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                  theme === 'dark'
                    ? `bg-${feature.color}-600/20 text-${feature.color}-400`
                    : `bg-${feature.color}-100 text-${feature.color}-600`
                }`}>
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className={`text-xl font-bold mb-2 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  {feature.title}
                </h3>
                <p className={`text-sm ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={`py-20 ${
        theme === 'dark' ? 'bg-[#2d2d3d]' : 'bg-gradient-to-br from-[#d4e8e0] to-[#bfd9cc]'
      }`}>
        <div className="container mx-auto px-4 text-center">
          <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            Ready to Start Collaborating?
          </h2>
          <p className={`text-lg mb-8 max-w-2xl mx-auto ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Join thousands of developers already using CodeChat to build amazing projects together.
          </p>
          {!isAuthenticated && (
            <Link
              to="/register"
              className={`inline-flex items-center gap-2 font-semibold py-4 px-10 rounded-lg transition shadow-lg hover:shadow-xl text-lg ${
                theme === 'dark'
                  ? 'bg-purple-600 hover:bg-purple-700 text-white'
                  : 'bg-gray-800 hover:bg-gray-900 text-white'
              }`}
            >
              Get Started Free
              <ArrowRight className="w-5 h-5" />
            </Link>
          )}
        </div>
      </section>
    </div>
  </>
  );
};

export default Home;