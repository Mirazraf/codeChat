import { useState, useRef, useEffect } from 'react';
import { Send, Code, Smile, Paperclip, X, Loader } from 'lucide-react';
import Editor from '@monaco-editor/react';
import EmojiPicker from 'emoji-picker-react';
import useChatStore from '../../store/useChatStore';
import useAuthStore from '../../store/useAuthStore';
import useThemeStore from '../../store/useThemeStore';
import socketService from '../../services/socketService';
import fileService from '../../services/fileService';
import ReplyPreview from './ReplyPreview';
import toast from 'react-hot-toast';

const MessageInput = ({ replyingTo, onCancelReply }) => {
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('text');
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [codeLanguage, setCodeLanguage] = useState('javascript');
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const inputRef = useRef(null);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const emojiPickerRef = useRef(null);

  const { currentRoom, sendMessage } = useChatStore();
  const { user } = useAuthStore();
  const { theme } = useThemeStore();

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const MAX_FILES = 5;

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

  // Handle paste event for images
  useEffect(() => {
    const handlePaste = (e) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      const files = [];
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            files.push(file);
          }
        }
      }

      if (files.length > 0) {
        handleFilesSelection(files);
        toast.success(`${files.length} image(s) pasted!`);
      }
    };

    const textarea = textareaRef.current;
    if (textarea && !showCodeInput) {
      textarea.addEventListener('paste', handlePaste);
      return () => textarea.removeEventListener('paste', handlePaste);
    }
  }, [showCodeInput, selectedFiles.length]);

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

  const validateFile = (file) => {
    if (file.size > MAX_FILE_SIZE) {
      return {
        valid: false,
        error: `"${file.name}" is too large (${formatFileSize(file.size)}). Maximum size is ${formatFileSize(MAX_FILE_SIZE)}.`
      };
    }

    const allowedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'application/zip',
    ];

    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: `"${file.name}" is not a supported file type.`
      };
    }

    return { valid: true };
  };

  const handleFilesSelection = (files) => {
    const fileArray = Array.from(files);
    
    if (selectedFiles.length + fileArray.length > MAX_FILES) {
      toast.error(`You can only upload ${MAX_FILES} files at a time. Currently selected: ${selectedFiles.length}`);
      return;
    }

    const validFiles = [];
    const errors = [];

    fileArray.forEach(file => {
      const validation = validateFile(file);
      if (validation.valid) {
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onloadend = () => {
            file.preview = reader.result;
            setSelectedFiles(prev => [...prev, file]);
          };
          reader.readAsDataURL(file);
        } else {
          validFiles.push(file);
        }
      } else {
        errors.push(validation.error);
      }
    });

    if (validFiles.length > 0) {
      setSelectedFiles(prev => [...prev, ...validFiles]);
    }

    if (errors.length > 0) {
      errors.forEach(error => {
        toast.error(error, { duration: 5000 });
      });
    }

    if (validFiles.length > 0 || fileArray.some(f => f.type.startsWith('image/'))) {
      const validCount = validFiles.length + fileArray.filter(f => f.type.startsWith('image/')).length;
      if (validCount > 0) {
        toast.success(`${validCount} file(s) selected`);
      }
    }
  };

  const handleFileSelect = (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    handleFilesSelection(files);
  };

  const handleRemoveFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
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
    if (selectedFiles.length > 0) {
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
      replyTo: replyingTo?._id || null, // Add reply reference
    });

    setMessage('');
    setMessageType('text');
    setShowCodeInput(false);
    setShowEmojiPicker(false);
    onCancelReply?.(); // Clear reply
    
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    
    inputRef.current?.focus();
  };

  const handleFileUpload = async () => {
    if (selectedFiles.length === 0) return;

    setUploadingFiles(true);
    setUploadProgress(0);

    const totalFiles = selectedFiles.length;
    let uploadedCount = 0;
    const loadingToast = toast.loading(`Uploading ${totalFiles} file(s)...`);

    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        
        try {
          const uploadResult = await fileService.uploadFile(file);
          const fileData = uploadResult.data;
          const isImage = file.type.startsWith('image/');

          sendMessage({
            roomId: currentRoom._id,
            userId: user._id,
            content: i === 0 ? message.trim() : '',
            type: isImage ? 'image' : 'file',
            fileUrl: fileData.url,
            fileName: fileData.fileName,
            fileSize: fileData.fileSize,
            fileType: fileData.fileType,
            replyTo: replyingTo?._id || null, // Add reply reference for files too
          });

          uploadedCount++;
          const progress = Math.round((uploadedCount / totalFiles) * 100);
          setUploadProgress(progress);
          
          toast.loading(`Uploading... ${uploadedCount}/${totalFiles}`, { id: loadingToast });
        } catch (error) {
          console.error(`Failed to upload ${file.name}:`, error);
          toast.error(`Failed to upload ${file.name}`);
        }
      }

      setMessage('');
      setSelectedFiles([]);
      onCancelReply?.(); // Clear reply after upload
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      toast.success(`${uploadedCount} file(s) uploaded successfully!`, { id: loadingToast });
    } catch (error) {
      console.error('File upload error:', error);
      toast.error('Failed to upload files', { id: loadingToast });
    } finally {
      setUploadingFiles(false);
      setUploadProgress(0);
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
      {/* Reply Preview */}
      {replyingTo && (
        <ReplyPreview replyingTo={replyingTo} onCancel={onCancelReply} />
      )}

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

      {/* Files Preview with Progress Bar */}
      {selectedFiles.length > 0 && (
        <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 max-h-64 overflow-y-auto">
          {uploadingFiles && (
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  Uploading... {uploadProgress}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            {selectedFiles.map((file, index) => (
              <div key={index} className="flex items-center space-x-3 bg-white dark:bg-gray-800 rounded-lg p-2">
                {file.preview ? (
                  <img
                    src={file.preview}
                    alt="Preview"
                    className="w-12 h-12 object-cover rounded"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
                    <Paperclip className="w-5 h-5 text-gray-500" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate text-gray-900 dark:text-gray-100">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatFileSize(file.size)}
                  </p>
                </div>
                {!uploadingFiles && (
                  <button
                    onClick={() => handleRemoveFile(index)}
                    className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition"
                    title="Remove file"
                  >
                    <X className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            {selectedFiles.length}/{MAX_FILES} files • Max {formatFileSize(MAX_FILE_SIZE)} per file
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

      {/* Rest of the input form remains the same as before... */}
      {/* (Copy the rest from the previous MessageInput.jsx) */}
      
      <form onSubmit={handleSubmit} className="p-3 sm:p-4">
        {/* Mobile action buttons */}
        <div className="flex items-center justify-center sm:justify-start space-x-2 mb-3 sm:mb-0 sm:hidden">
          <button
            type="button"
            onClick={toggleCodeInput}
            disabled={uploadingFiles}
            className={`p-2 rounded-lg transition ${
              showCodeInput
                ? 'bg-primary text-white'
                : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300'
            } ${uploadingFiles ? 'opacity-50 cursor-not-allowed' : ''}`}
            title="Code snippet"
          >
            <Code className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={toggleEmojiPicker}
            disabled={uploadingFiles}
            className={`p-2 rounded-lg transition ${
              showEmojiPicker
                ? 'bg-primary text-white'
                : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300'
            } ${uploadingFiles ? 'opacity-50 cursor-not-allowed' : ''}`}
            title="Emoji"
          >
            <Smile className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingFiles || selectedFiles.length >= MAX_FILES}
            className={`p-2 rounded-lg transition text-gray-600 dark:text-gray-300 ${
              uploadingFiles || selectedFiles.length >= MAX_FILES
                ? 'opacity-50 cursor-not-allowed' 
                : 'hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
            title={`Attach files (${selectedFiles.length}/${MAX_FILES})`}
          >
            {uploadingFiles ? (
              <Loader className="w-5 h-5 animate-spin" />
            ) : (
              <Paperclip className="w-5 h-5" />
            )}
          </button>
        </div>

        <div className="flex items-end space-x-2">
          {/* Desktop action buttons */}
          <div className="hidden sm:flex space-x-1">
            <button
              type="button"
              onClick={toggleCodeInput}
              disabled={uploadingFiles}
              className={`p-2 rounded-lg transition ${
                showCodeInput
                  ? 'bg-primary text-white'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300'
              } ${uploadingFiles ? 'opacity-50 cursor-not-allowed' : ''}`}
              title="Code snippet"
            >
              <Code className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={toggleEmojiPicker}
              disabled={uploadingFiles}
              className={`p-2 rounded-lg transition ${
                showEmojiPicker
                  ? 'bg-primary text-white'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300'
              } ${uploadingFiles ? 'opacity-50 cursor-not-allowed' : ''}`}
              title="Emoji"
            >
              <Smile className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingFiles || selectedFiles.length >= MAX_FILES}
              className={`p-2 rounded-lg transition text-gray-600 dark:text-gray-300 ${
                uploadingFiles || selectedFiles.length >= MAX_FILES
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              title={`Attach files (${selectedFiles.length}/${MAX_FILES})`}
            >
              {uploadingFiles ? (
                <Loader className="w-5 h-5 animate-spin" />
              ) : (
                <Paperclip className="w-5 h-5" />
              )}
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileSelect}
            accept="image/*,.pdf,.doc,.docx,.txt,.zip"
            className="hidden"
            disabled={uploadingFiles}
            multiple
          />

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
                disabled={uploadingFiles}
                placeholder={
                  replyingTo 
                    ? `Reply to ${replyingTo.sender?.username}...`
                    : selectedFiles.length > 0 
                    ? "Add a caption (optional)..." 
                    : "Type a message or paste an image..."
                }
                className="w-full px-3 py-2 sm:px-4 sm:py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none text-sm sm:text-base disabled:opacity-50"
                style={{ minHeight: '44px', maxHeight: '120px' }}
                rows="1"
              />
            )}
          </div>

          <button
            type="submit"
            disabled={(!message.trim() && selectedFiles.length === 0) || uploadingFiles}
            className="p-2.5 sm:p-3 bg-primary hover:bg-blue-600 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
            title={selectedFiles.length > 0 ? `Upload ${selectedFiles.length} file(s)` : "Send message"}
          >
            {uploadingFiles ? (
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