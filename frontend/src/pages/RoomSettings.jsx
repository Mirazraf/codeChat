import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import useThemeStore from '../store/useThemeStore';
import useChatStore from '../store/useChatStore';
import { roomService } from '../services/roomService';
import formatDate from '../utils/formatDate';
import RoomMembersModal from '../components/chat/RoomMembersModal';
import toast, { Toaster } from 'react-hot-toast';
import { ArrowLeft, Users, LogOut, Trash2, MessageSquare, Code } from 'lucide-react';

const RoomSettings = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { theme } = useThemeStore();
  const { rooms } = useChatStore();

  const [room, setRoom] = useState(null);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    fetchRoomData();
  }, [roomId]);

  const fetchRoomData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch room details and statistics in parallel
      const [roomResponse, statsResponse] = await Promise.all([
        roomService.getRoom(roomId),
        roomService.getRoomStatistics(roomId)
      ]);

      setRoom(roomResponse.data);
      setStatistics(statsResponse.data);
      setRetryCount(0); // Reset retry count on success
    } catch (error) {
      console.error('Error fetching room data:', error);
      
      // Determine error type and message
      let errorMessage = 'Failed to load room settings';
      let errorType = 'general';
      
      if (error.response) {
        // Server responded with error status
        const status = error.response.status;
        errorMessage = error.response.data?.message || errorMessage;
        
        if (status === 404) {
          errorType = 'not_found';
          errorMessage = 'Room not found. You may not have access to this room.';
          
          toast.error(errorMessage, {
            duration: 3000,
            icon: '🚫',
            style: {
              borderRadius: '10px',
              background: theme === 'dark' ? '#2d2d3d' : '#fff',
              color: theme === 'dark' ? '#fff' : '#333',
            },
          });
          
          // Redirect to chat dashboard after showing error
          setTimeout(() => navigate('/chat'), 2000);
        } else if (status === 403) {
          errorType = 'access_denied';
          errorMessage = 'Access denied. You don\'t have permission to view this room.';
          
          toast.error(errorMessage, {
            duration: 3000,
            icon: '🔒',
            style: {
              borderRadius: '10px',
              background: theme === 'dark' ? '#2d2d3d' : '#fff',
              color: theme === 'dark' ? '#fff' : '#333',
            },
          });
          
          // Redirect to chat dashboard after showing error
          setTimeout(() => navigate('/chat'), 2000);
        } else if (status >= 500) {
          errorType = 'server_error';
          errorMessage = 'Server error. Please try again later.';
        } else {
          errorType = 'general';
        }
      } else if (error.request) {
        // Request was made but no response received (network error)
        errorType = 'network';
        errorMessage = 'Network error. Please check your connection and try again.';
      } else {
        // Something else happened
        errorType = 'unknown';
        errorMessage = 'An unexpected error occurred. Please try again.';
      }
      
      setError({ type: errorType, message: errorMessage });
      
      // Show toast for errors that don't auto-redirect
      if (errorType !== 'not_found' && errorType !== 'access_denied') {
        toast.error(errorMessage, {
          duration: 5000,
          style: {
            borderRadius: '10px',
            background: theme === 'dark' ? '#2d2d3d' : '#fff',
            color: theme === 'dark' ? '#fff' : '#333',
          },
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/chat');
  };

  const handleShowMembers = () => {
    setShowMembersModal(true);
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    fetchRoomData();
  };

  const handleLeaveRoom = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to leave this room? You can rejoin later if it\'s a public room.'
    );

    if (!confirmed) return;

    try {
      setActionLoading(true);
      await roomService.leaveRoom(roomId);
      
      toast.success('Successfully left the room', {
        duration: 3000,
        icon: '👋',
        style: {
          borderRadius: '10px',
          background: theme === 'dark' ? '#2d2d3d' : '#fff',
          color: theme === 'dark' ? '#fff' : '#333',
        },
      });

      setTimeout(() => navigate('/chat'), 1000);
    } catch (error) {
      console.error('Error leaving room:', error);
      
      let errorMessage = 'Failed to leave room';
      
      if (error.response) {
        errorMessage = error.response.data?.message || errorMessage;
        
        // Handle specific error cases
        if (error.response.status === 404) {
          errorMessage = 'Room not found. It may have been deleted.';
        } else if (error.response.status === 403) {
          errorMessage = 'You don\'t have permission to leave this room.';
        } else if (error.response.status >= 500) {
          errorMessage = 'Server error. Please try again later.';
        }
      } else if (error.request) {
        errorMessage = 'Network error. Please check your connection and try again.';
      }
      
      toast.error(errorMessage, {
        duration: 5000,
        icon: '❌',
        style: {
          borderRadius: '10px',
          background: theme === 'dark' ? '#2d2d3d' : '#fff',
          color: theme === 'dark' ? '#fff' : '#333',
        },
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteRoom = async () => {
    const confirmed = window.confirm(
      '⚠️ WARNING: This action cannot be undone!\n\nDeleting this room will permanently remove:\n• All messages and chat history\n• All shared files and code snippets\n• All room data\n\nAre you absolutely sure you want to delete this room?'
    );

    if (!confirmed) return;

    try {
      setActionLoading(true);
      await roomService.deleteRoom(roomId);
      
      toast.success('Room deleted successfully', {
        duration: 3000,
        icon: '🗑️',
        style: {
          borderRadius: '10px',
          background: theme === 'dark' ? '#2d2d3d' : '#fff',
          color: theme === 'dark' ? '#fff' : '#333',
        },
      });

      setTimeout(() => navigate('/chat'), 1000);
    } catch (error) {
      console.error('Error deleting room:', error);
      
      let errorMessage = 'Failed to delete room';
      
      if (error.response) {
        errorMessage = error.response.data?.message || errorMessage;
        
        // Handle specific error cases
        if (error.response.status === 404) {
          errorMessage = 'Room not found. It may have already been deleted.';
        } else if (error.response.status === 403) {
          errorMessage = 'You don\'t have permission to delete this room. Only the creator can delete it.';
        } else if (error.response.status >= 500) {
          errorMessage = 'Server error. Please try again later.';
        }
      } else if (error.request) {
        errorMessage = 'Network error. Please check your connection and try again.';
      }
      
      toast.error(errorMessage, {
        duration: 5000,
        icon: '❌',
        style: {
          borderRadius: '10px',
          background: theme === 'dark' ? '#2d2d3d' : '#fff',
          color: theme === 'dark' ? '#fff' : '#333',
        },
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Format numbers for readability
  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num?.toString() || '0';
  };

  // Check if current user is the creator
  const isCreator = room?.creator?._id === user?._id;

  if (loading) {
    return (
      <div className={`min-h-screen pt-20 pb-12 px-4 ${
        theme === 'dark'
          ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900'
          : 'bg-gradient-to-br from-gray-50 via-white to-gray-50'
      }`}>
        <div className="container mx-auto max-w-3xl">
          {/* Header Skeleton */}
          <div className="mb-8">
            <div className={`h-6 w-32 rounded animate-pulse ${
              theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
            }`}></div>
          </div>

          {/* Room Logo and Name Skeleton */}
          <div className="text-center mb-8">
            <div className={`w-24 h-24 mx-auto rounded-2xl animate-pulse mb-4 ${
              theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
            }`}></div>
            <div className={`h-10 w-64 mx-auto rounded animate-pulse ${
              theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
            }`}></div>
          </div>

          {/* Room Information Card Skeleton */}
          <div className={`rounded-2xl shadow-xl p-6 mb-6 ${
            theme === 'dark' ? 'bg-[#1e1e2d]' : 'bg-white border border-gray-200'
          }`}>
            <div className={`h-6 w-40 rounded animate-pulse mb-4 ${
              theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
            }`}></div>
            
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i}>
                  <div className={`h-4 w-24 rounded animate-pulse mb-2 ${
                    theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
                  }`}></div>
                  <div className={`h-5 w-full rounded animate-pulse ${
                    theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
                  }`}></div>
                </div>
              ))}
            </div>
          </div>

          {/* Statistics Card Skeleton */}
          <div className={`rounded-2xl shadow-xl p-6 mb-6 ${
            theme === 'dark' ? 'bg-[#1e1e2d]' : 'bg-white border border-gray-200'
          }`}>
            <div className={`h-6 w-32 rounded animate-pulse mb-4 ${
              theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
            }`}></div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2].map((i) => (
                <div key={i} className={`flex items-center gap-4 p-4 rounded-xl ${
                  theme === 'dark' ? 'bg-[#2d2d3d]' : 'bg-gray-50'
                }`}>
                  <div className={`w-12 h-12 rounded-lg animate-pulse ${
                    theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
                  }`}></div>
                  <div className="flex-1">
                    <div className={`h-8 w-16 rounded animate-pulse mb-2 ${
                      theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
                    }`}></div>
                    <div className={`h-4 w-24 rounded animate-pulse ${
                      theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
                    }`}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Buttons Skeleton */}
          <div className={`h-14 w-full rounded-xl animate-pulse mb-4 ${
            theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
          }`}></div>
          <div className={`h-14 w-full rounded-xl animate-pulse ${
            theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
          }`}></div>
        </div>
      </div>
    );
  }

  // Show error state with retry option for network errors
  if (error && (error.type === 'network' || error.type === 'server_error' || error.type === 'unknown')) {
    return (
      <>
        <Toaster position="top-right" />
        <div className={`min-h-screen pt-20 pb-12 px-4 flex items-center justify-center ${
          theme === 'dark'
            ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900'
            : 'bg-gradient-to-br from-gray-50 via-white to-gray-50'
        }`}>
          <div className="text-center max-w-md">
            <div className={`text-6xl mb-4`}>
              {error.type === 'network' ? '📡' : '⚠️'}
            </div>
            <h2 className={`text-2xl font-bold mb-2 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              {error.type === 'network' ? 'Connection Error' : 'Something Went Wrong'}
            </h2>
            <p className={`mb-6 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              {error.message}
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={handleRetry}
                className={`px-6 py-3 rounded-xl font-medium transition ${
                  theme === 'dark'
                    ? 'bg-purple-600 hover:bg-purple-700 text-white'
                    : 'bg-teal-500 hover:bg-teal-600 text-white'
                }`}
              >
                Try Again
              </button>
              <button
                onClick={handleBack}
                className={`px-6 py-3 rounded-xl font-medium transition ${
                  theme === 'dark'
                    ? 'bg-gray-700 hover:bg-gray-600 text-white'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                }`}
              >
                Back to Chat
              </button>
            </div>
            {retryCount > 0 && (
              <p className={`mt-4 text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                Retry attempt: {retryCount}
              </p>
            )}
          </div>
        </div>
      </>
    );
  }

  // Don't render if room data is not available (handles redirect cases)
  if (!room) {
    return (
      <>
        <Toaster position="top-right" />
        <div className={`min-h-screen pt-20 pb-12 px-4 flex items-center justify-center ${
          theme === 'dark'
            ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900'
            : 'bg-gradient-to-br from-gray-50 via-white to-gray-50'
        }`}>
          <div className="text-center">
            <div className={`inline-block animate-spin rounded-full h-12 w-12 border-b-2 ${
              theme === 'dark' ? 'border-purple-500' : 'border-teal-500'
            }`}></div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Toaster position="top-right" />
      
      <div className={`min-h-screen pt-20 pb-12 px-4 ${
        theme === 'dark'
          ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900'
          : 'bg-gradient-to-br from-gray-50 via-white to-gray-50'
      }`}>
        <div className="container mx-auto max-w-3xl">
          {/* Header with Back Button */}
          <div className="mb-8">
            <button
              onClick={handleBack}
              className={`flex items-center gap-2 mb-4 transition ${
                theme === 'dark'
                  ? 'text-gray-400 hover:text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Chat</span>
            </button>
          </div>

          {/* Room Logo and Name */}
          <div className="text-center mb-8">
            <div className={`w-24 h-24 mx-auto rounded-2xl flex items-center justify-center text-4xl font-bold text-white mb-4 ${
              theme === 'dark'
                ? 'bg-gradient-to-br from-purple-600 to-indigo-600'
                : 'bg-gradient-to-br from-teal-500 to-emerald-500'
            }`}>
              {room.name.charAt(0).toUpperCase()}
            </div>
            <h1 className={`text-3xl md:text-4xl font-bold ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              {room.name}
            </h1>
          </div>

          {/* Room Information Card */}
          <div className={`rounded-2xl shadow-xl p-6 mb-6 ${
            theme === 'dark' ? 'bg-[#1e1e2d]' : 'bg-white border border-gray-200'
          }`}>
            <h2 className={`text-xl font-bold mb-4 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Room Information
            </h2>
            
            <div className="space-y-3">
              {room.description && (
                <div>
                  <p className={`text-sm font-medium ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Description
                  </p>
                  <p className={`mt-1 ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    {room.description}
                  </p>
                </div>
              )}
              
              <div>
                <p className={`text-sm font-medium ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Created
                </p>
                <p className={`mt-1 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  {formatDate(room.createdAt)}
                </p>
              </div>
              
              <div>
                <p className={`text-sm font-medium ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Type
                </p>
                <p className={`mt-1 capitalize ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  {room.type}
                </p>
              </div>
              
              <div>
                <p className={`text-sm font-medium ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Creator
                </p>
                <p className={`mt-1 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  {room.creator?.username || 'Unknown'}
                </p>
              </div>
            </div>
          </div>

          {/* Statistics Card */}
          {statistics && (
            <div className={`rounded-2xl shadow-xl p-6 mb-6 ${
              theme === 'dark' ? 'bg-[#1e1e2d]' : 'bg-white border border-gray-200'
            }`}>
              <h2 className={`text-xl font-bold mb-4 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                Statistics
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className={`flex items-center gap-4 p-4 rounded-xl ${
                  theme === 'dark' ? 'bg-[#2d2d3d]' : 'bg-gray-50'
                }`}>
                  <div className={`p-3 rounded-lg ${
                    theme === 'dark' ? 'bg-purple-900/30' : 'bg-teal-100'
                  }`}>
                    <MessageSquare className={`w-6 h-6 ${
                      theme === 'dark' ? 'text-purple-400' : 'text-teal-600'
                    }`} />
                  </div>
                  <div>
                    <p className={`text-2xl font-bold ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      {formatNumber(statistics.totalMessages)}
                    </p>
                    <p className={`text-sm ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      Total Messages
                    </p>
                  </div>
                </div>
                
                <div className={`flex items-center gap-4 p-4 rounded-xl ${
                  theme === 'dark' ? 'bg-[#2d2d3d]' : 'bg-gray-50'
                }`}>
                  <div className={`p-3 rounded-lg ${
                    theme === 'dark' ? 'bg-indigo-900/30' : 'bg-emerald-100'
                  }`}>
                    <Code className={`w-6 h-6 ${
                      theme === 'dark' ? 'text-indigo-400' : 'text-emerald-600'
                    }`} />
                  </div>
                  <div>
                    <p className={`text-2xl font-bold ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      {formatNumber(statistics.codeSnippets)}
                    </p>
                    <p className={`text-sm ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      Code Snippets
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Members Button */}
          <button
            onClick={handleShowMembers}
            className={`w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-medium transition mb-4 ${
              theme === 'dark'
                ? 'bg-purple-600 hover:bg-purple-700 text-white'
                : 'bg-teal-500 hover:bg-teal-600 text-white'
            }`}
          >
            <Users className="w-5 h-5" />
            <span>View Members ({room.members?.length || 0})</span>
          </button>

          {/* Leave/Delete Room Button */}
          {isCreator ? (
            <button
              onClick={handleDeleteRoom}
              disabled={actionLoading}
              className={`w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-medium transition ${
                actionLoading
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:bg-red-700'
              } bg-red-600 text-white`}
            >
              <Trash2 className="w-5 h-5" />
              <span>{actionLoading ? 'Deleting...' : 'Delete Room'}</span>
            </button>
          ) : (
            <button
              onClick={handleLeaveRoom}
              disabled={actionLoading}
              className={`w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-medium transition ${
                actionLoading
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:bg-orange-600'
              } bg-orange-500 text-white`}
            >
              <LogOut className="w-5 h-5" />
              <span>{actionLoading ? 'Leaving...' : 'Leave Room'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Members Modal */}
      <RoomMembersModal
        isOpen={showMembersModal}
        onClose={() => setShowMembersModal(false)}
        room={room}
      />
    </>
  );
};

export default RoomSettings;
