import { useState, useRef, useEffect } from 'react';
import { Send, Code, Smile, Paperclip, X, Loader } from 'lucide-react';
import Editor from '@monaco-editor/react';
import EmojiPicker from 'emoji-picker-react';
import useChatStore from '../../store/useChatStore';
import useAuthStore from '../../store/useAuthStore';
import useThemeStore from '../../store/useThemeStore';
import socketService from '../../services/socketService';
import fileService from '../../services/fileService';
import toast from 'react-hot-toast';

const MessageInput = () => {
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('text');
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [codeLanguage, setCodeLanguage] = useState('javascript');
  const [uploadingFile, setUploadingFile] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  
  const inputRef = useRef(null);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const emojiPickerRef = useRef(null);

  const { currentRoom, sendMessage } = useChatStore();
  const { user } = useAuthStore();
  const { theme } = useThemeStore();

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    };

    if (showEmojiPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showEmojiPicker]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  }, [message]);

  const handleTyping = () => {
    socketService.emitTyping(currentRoom._id, user.username, true);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      socketService.emitTyping(currentRoom._id, user.username, false);
    }, 2000);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size (10MB for Cloudinary free tier)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast.error(
        `File size must be less than ${formatFileSize(maxSize)}. Your file is ${formatFileSize(file.size)}.`,
        { duration: 5000 }
      );
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    setSelectedFile(file);

    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }

    toast.success(`File selected: ${file.name} (${formatFileSize(file.size)})`);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!currentRoom) {
      toast.error('Please select a room first');
      return;
    }

    // Handle file upload
    if (selectedFile) {
      console.log('📤 Uploading file:', selectedFile.name);
      await handleFileUpload();
      return;
    }

    // Handle regular message
    if (!message.trim()) return;

    socketService.emitTyping(currentRoom._id, user.username, false);

    sendMessage({
      roomId: currentRoom._id,
      userId: user._id,
      content: message.trim(),
      type: messageType,
      codeLanguage: messageType === 'code' ? codeLanguage : undefined,
    });

    setMessage('');
    setMessageType('text');
    setShowCodeInput(false);
    setShowEmojiPicker(false);
    
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    
    inputRef.current?.focus();
  };

  const handleFileUpload = async () => {
    if (!selectedFile) {
      console.log('❌ No file selected');
      return;
    }

    setUploadingFile(true);
    const loadingToast = toast.loading('Uploading file...');

    try {
      console.log('📤 Starting upload for:', selectedFile.name);
      
      // Upload file to Cloudinary
      const uploadResult = await fileService.uploadFile(selectedFile);
      console.log('✅ Upload result:', uploadResult);

      const fileData = uploadResult.data;
      const isImage = selectedFile.type.startsWith('image/');

      console.log('📨 Sending file message via socket...');

      // Send file message via socket
      sendMessage({
        roomId: currentRoom._id,
        userId: user._id,
        content: message.trim() || '', // Optional caption
        type: isImage ? 'image' : 'file',
        fileUrl: fileData.url,
        fileName: fileData.fileName,
        fileSize: fileData.fileSize,
        fileType: fileData.fileType,
      });

      console.log('✅ File message sent');

      // Clear everything
      setMessage('');
      setSelectedFile(null);
      setFilePreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      toast.success('File uploaded successfully!', { id: loadingToast });
    } catch (error) {
      console.error('❌ File upload error:', error);
      console.error('Error details:', error.response?.data || error.message);
      
      const errorMessage = error.response?.data?.message || error.message || 'Failed to upload file';
      toast.error(errorMessage, { id: loadingToast, duration: 5000 });
    } finally {
      setUploadingFile(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !showCodeInput) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const toggleCodeInput = () => {
    setShowCodeInput(!showCodeInput);
    setMessageType(showCodeInput ? 'text' : 'code');
    setShowEmojiPicker(false);
  };

  const toggleEmojiPicker = () => {
    setShowEmojiPicker(!showEmojiPicker);
  };

  const handleEmojiClick = (emojiData) => {
    const emoji = emojiData.emoji;
    setMessage((prevMessage) => prevMessage + emoji);
    handleTyping();
  };

  const handleEditorChange = (value) => {
    setMessage(value || '');
    handleTyping();
  };

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 relative">
      {/* Emoji Picker Popup */}
      {showEmojiPicker && (
        <div 
          ref={emojiPickerRef}
          className="absolute bottom-full left-4 sm:left-auto sm:right-4 mb-2 z-50 shadow-2xl rounded-lg"
        >
          <div className="relative">
            <button
              onClick={() => setShowEmojiPicker(false)}
              className="absolute -top-2 -right-2 z-10 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow-lg"
              title="Close emoji picker"
            >
              <X className="w-4 h-4" />
            </button>
            <EmojiPicker
              onEmojiClick={handleEmojiClick}
              theme={theme === 'dark' ? 'dark' : 'light'}
              width={280}
              height={400}
              searchPlaceHolder="Search emoji..."
              previewConfig={{ showPreview: false }}
            />
          </div>
        </div>
      )}

      {/* File Preview */}
      {selectedFile && (
        <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            {filePreview ? (
              <img
                src={filePreview}
                alt="Preview"
                className="w-16 h-16 object-cover rounded"
              />
            ) : (
              <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
                <Paperclip className="w-6 h-6 text-gray-500" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate text-gray-900 dark:text-gray-100">
                {selectedFile.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {formatFileSize(selectedFile.size)} • Max: 10 MB
              </p>
            </div>
            <button
              onClick={handleRemoveFile}
              className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg transition"
              title="Remove file"
            >
              <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>
          </div>
        </div>
      )}

      {/* Code Options */}
      {showCodeInput && (
        <div className="px-4 py-2 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <select
            value={codeLanguage}
            onChange={(e) => setCodeLanguage(e.target.value)}
            className="text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
            <option value="cpp">C++</option>
            <option value="html">HTML</option>
            <option value="css">CSS</option>
            <option value="sql">SQL</option>
            <option value="typescript">TypeScript</option>
            <option value="csharp">C#</option>
            <option value="php">PHP</option>
            <option value="ruby">Ruby</option>
            <option value="go">Go</option>
          </select>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Code snippet mode
          </span>
        </div>
      )}

      {/* Input Area */}
      <form onSubmit={handleSubmit} className="p-3 sm:p-4">
        {/* Action Buttons - Above input on mobile, left side on desktop */}
        <div className="flex items-center justify-center sm:justify-start space-x-2 mb-3 sm:mb-0 sm:hidden">
          <button
            type="button"
            onClick={toggleCodeInput}
            disabled={uploadingFile}
            className={`p-2 rounded-lg transition ${
              showCodeInput
                ? 'bg-primary text-white'
                : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300'
            } ${uploadingFile ? 'opacity-50 cursor-not-allowed' : ''}`}
            title="Code snippet"
          >
            <Code className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={toggleEmojiPicker}
            disabled={uploadingFile}
            className={`p-2 rounded-lg transition ${
              showEmojiPicker
                ? 'bg-primary text-white'
                : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300'
            } ${uploadingFile ? 'opacity-50 cursor-not-allowed' : ''}`}
            title="Emoji"
          >
            <Smile className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingFile}
            className={`p-2 rounded-lg transition text-gray-600 dark:text-gray-300 ${
              uploadingFile 
                ? 'opacity-50 cursor-not-allowed' 
                : 'hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
            title="Attach file (Max 10 MB)"
          >
            {uploadingFile ? (
              <Loader className="w-5 h-5 animate-spin" />
            ) : (
              <Paperclip className="w-5 h-5" />
            )}
          </button>
        </div>

        <div className="flex items-end space-x-2">
          {/* Left Actions - Only visible on desktop */}
          <div className="hidden sm:flex space-x-1">
            <button
              type="button"
              onClick={toggleCodeInput}
              disabled={uploadingFile}
              className={`p-2 rounded-lg transition ${
                showCodeInput
                  ? 'bg-primary text-white'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300'
              } ${uploadingFile ? 'opacity-50 cursor-not-allowed' : ''}`}
              title="Code snippet"
            >
              <Code className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={toggleEmojiPicker}
              disabled={uploadingFile}
              className={`p-2 rounded-lg transition ${
                showEmojiPicker
                  ? 'bg-primary text-white'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300'
              } ${uploadingFile ? 'opacity-50 cursor-not-allowed' : ''}`}
              title="Emoji"
            >
              <Smile className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingFile}
              className={`p-2 rounded-lg transition text-gray-600 dark:text-gray-300 ${
                uploadingFile 
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              title="Attach file (Max 10 MB)"
            >
              {uploadingFile ? (
                <Loader className="w-5 h-5 animate-spin" />
              ) : (
                <Paperclip className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileSelect}
            accept="image/*,.pdf,.doc,.docx,.txt,.zip"
            className="hidden"
            disabled={uploadingFile}
          />

          {/* Text/Code Input */}
          <div className="flex-1">
            {showCodeInput ? (
              <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                <Editor
                  height="150px"
                  language={codeLanguage}
                  value={message}
                  onChange={handleEditorChange}
                  theme={theme === 'dark' ? 'vs-dark' : 'light'}
                  options={{
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    fontSize: 14,
                    lineNumbers: 'on',
                    roundedSelection: true,
                    padding: { top: 10, bottom: 10 },
                    automaticLayout: true,
                    wordWrap: 'on',
                  }}
                />
              </div>
            ) : (
              <textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value);
                  handleTyping();
                }}
                onKeyDown={handleKeyDown}
                disabled={uploadingFile}
                placeholder={selectedFile ? "Add a caption (optional)..." : "Type a message..."}
                className="w-full px-3 py-2 sm:px-4 sm:py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none text-sm sm:text-base disabled:opacity-50"
                style={{ minHeight: '44px', maxHeight: '120px' }}
                rows="1"
              />
            )}
          </div>

          {/* Send Button */}
          <button
            type="submit"
            disabled={(!message.trim() && !selectedFile) || uploadingFile}
            className="p-2.5 sm:p-3 bg-primary hover:bg-blue-600 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
            title={selectedFile ? "Upload and send file" : "Send message"}
          >
            {uploadingFile ? (
              <Loader className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MessageInput;