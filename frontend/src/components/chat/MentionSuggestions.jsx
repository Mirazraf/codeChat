import { useEffect, useState } from 'react';
import { Users } from 'lucide-react';

const MentionSuggestions = ({ users, query, onSelect, onClose }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Filter users based on query
  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().startsWith(query.toLowerCase())
  );

  // Reset selected index when filtered users change
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (filteredUsers.length === 0) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev < filteredUsers.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev > 0 ? prev - 1 : filteredUsers.length - 1
          );
          break;
        case 'Enter':
        case 'Tab':
          e.preventDefault();
          if (filteredUsers[selectedIndex]) {
            onSelect(filteredUsers[selectedIndex].username);
          }
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
        default:
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [filteredUsers, selectedIndex, onSelect, onClose]);

  // Scroll selected item into view
  useEffect(() => {
    const selectedElement = document.querySelector('.mention-suggestion-item.active');
    if (selectedElement) {
      selectedElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [selectedIndex]);

  if (filteredUsers.length === 0) {
    return (
      <div className="mention-suggestions">
        <div className="mention-suggestions-empty">
          <Users className="w-6 h-6 mx-auto mb-2 opacity-50" />
          <p>No users found matching "@{query}"</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mention-suggestions">
      {filteredUsers.map((user, index) => (
        <div
          key={user.userId}
          className={`mention-suggestion-item ${index === selectedIndex ? 'active' : ''}`}
          onClick={() => onSelect(user.username)}
          onMouseEnter={() => setSelectedIndex(index)}
        >
          {/* Avatar with online indicator */}
          <div className="mention-suggestion-avatar-container">
            <img
              src={user.avatar || 'https://via.placeholder.com/36'}
              alt={user.username}
              className="mention-suggestion-avatar"
            />
            <div className="mention-suggestion-online"></div>
          </div>

          {/* User info */}
          <div className="mention-suggestion-info">
            <div className="mention-suggestion-username">
              @{user.username}
            </div>
            <span className="mention-suggestion-role">
              {user.role || 'student'}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MentionSuggestions;
