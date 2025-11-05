/**
 * Parse message content and extract mentions
 * Returns array of mentioned usernames
 */
export const extractMentions = (content) => {
  const mentionRegex = /@(\w+)/g;
  const mentions = [];
  let match;
  
  while ((match = mentionRegex.exec(content)) !== null) {
    mentions.push(match[1]);
  }
  
  return mentions;
};

/**
 * Check if a user is mentioned in a message
 */
export const isUserMentioned = (content, username) => {
  const mentions = extractMentions(content);
  return mentions.includes(username);
};

/**
 * Highlight mentions in text with HTML
 */
export const highlightMentions = (content, currentUsername = null) => {
  return content.replace(/@(\w+)/g, (match, username) => {
    const isCurrentUser = username === currentUsername;
    const className = isCurrentUser 
      ? 'mention mention-current' 
      : 'mention';
    return `<span class="${className}">@${username}</span>`;
  });
};

/**
 * Get the word being typed at cursor position
 */
export const getWordAtCursor = (text, cursorPosition) => {
  const textBeforeCursor = text.substring(0, cursorPosition);
  const words = textBeforeCursor.split(/\s/);
  const currentWord = words[words.length - 1];
  
  return {
    word: currentWord,
    startIndex: cursorPosition - currentWord.length,
  };
};

/**
 * Check if user is typing a mention
 */
export const isTypingMention = (text, cursorPosition) => {
  const { word } = getWordAtCursor(text, cursorPosition);
  return word.startsWith('@') && word.length > 1;
};

/**
 * Get mention query from current word
 */
export const getMentionQuery = (text, cursorPosition) => {
  const { word } = getWordAtCursor(text, cursorPosition);
  if (word.startsWith('@')) {
    return word.substring(1).toLowerCase();
  }
  return null;
};

/**
 * Filter users by mention query
 */
export const filterUsersByMention = (users, query) => {
  if (!query) return users;
  
  const lowerQuery = query.toLowerCase();
  return users.filter(user => 
    user.username.toLowerCase().startsWith(lowerQuery)
  );
};

/**
 * Insert mention at cursor position
 */
export const insertMentionAtCursor = (text, cursorPosition, username) => {
  const { startIndex } = getWordAtCursor(text, cursorPosition);
  const beforeMention = text.substring(0, startIndex);
  const afterMention = text.substring(cursorPosition);
  
  return {
    newText: `${beforeMention}@${username} ${afterMention}`,
    newCursorPosition: startIndex + username.length + 2, // +2 for @ and space
  };
};
