import { Download, File, FileText, Image as ImageIcon, ExternalLink, Copy } from 'lucide-react';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import toast from 'react-hot-toast';

const FileMessage = ({ fileUrl, fileName, fileType, fileSize, isOwnMessage }) => {
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPos, setContextMenuPos] = useState({ x: 0, y: 0 });
  
  const isImage = fileType?.startsWith('image/');
  const isPDF = fileType === 'application/pdf';

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileIcon = () => {
    if (fileType?.includes('pdf')) return <FileText className="w-6 h-6" />;
    if (fileType?.includes('image')) return <ImageIcon className="w-6 h-6" />;
    return <File className="w-6 h-6" />;
  };

  const handleImageContextMenu = (e) => {
    e.preventDefault();
    
    const menuWidth = 200;
    const menuHeight = 150;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    let x = e.clientX;
    let y = e.clientY;
    
    if (x + menuWidth > viewportWidth) {
      x = viewportWidth - menuWidth - 10;
    }
    
    if (y + menuHeight > viewportHeight) {
      y = viewportHeight - menuHeight - 10;
    }
    
    setContextMenuPos({ x, y });
    setShowContextMenu(true);
  };

  const handleCopyImage = async () => {
    try {
      const response = await fetch(fileUrl);
      const blob = await response.blob();
      
      await navigator.clipboard.write([
        new ClipboardItem({
          [blob.type]: blob
        })
      ]);
      
      toast.success('Image copied to clipboard!');
      setShowContextMenu(false);
    } catch (error) {
      console.error('Copy error:', error);
      
      try {
        await navigator.clipboard.writeText(fileUrl);
        toast.success('Image URL copied to clipboard!');
      } catch (err) {
        toast.error('Failed to copy image');
      }
      setShowContextMenu(false);
    }
  };

  const handleCopyImageUrl = async () => {
    try {
      await navigator.clipboard.writeText(fileUrl);
      toast.success('Image URL copied!');
      setShowContextMenu(false);
    } catch (error) {
      toast.error('Failed to copy URL');
      setShowContextMenu(false);
    }
  };

  const handleDownload = async (e) => {
    e.preventDefault();
    
    try {
      let downloadUrl = fileUrl;
      
      if (fileUrl.includes('cloudinary.com')) {
        downloadUrl = fileUrl.replace('/upload/', '/upload/fl_attachment/');
      }
      
      const response = await fetch(downloadUrl);
      const blob = await response.blob();
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName || 'download';
      document.body.appendChild(link);
      link.click();
      
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
      const link = document.createElement('a');
      link.href = fileUrl.replace('/upload/', '/upload/fl_attachment/');
      link.download = fileName || 'download';
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleOpenPDF = () => {
    let viewUrl = fileUrl;
    
    if (fileUrl.includes('cloudinary.com')) {
      if (fileUrl.includes('/raw/upload/')) {
        viewUrl = fileUrl;
      } else {
        viewUrl = fileUrl.replace('/image/upload/', '/raw/upload/');
      }
    }
    
    window.open(viewUrl, '_blank');
  };

  useEffect(() => {
    const handleClickOutside = () => setShowContextMenu(false);
    const handleScroll = () => setShowContextMenu(false);
    const handleEscape = (e) => {
      if (e.key === 'Escape') setShowContextMenu(false);
    };
    
    if (showContextMenu) {
      document.addEventListener('click', handleClickOutside);
      document.addEventListener('scroll', handleScroll, true);
      document.addEventListener('keydown', handleEscape);
      return () => {
        document.removeEventListener('click', handleClickOutside);
        document.removeEventListener('scroll', handleScroll, true);
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [showContextMenu]);

  const ContextMenu = () => {
    if (!showContextMenu) return null;

    return createPortal(
      <div
        className="context-menu"
        style={{
          top: `${contextMenuPos.y}px`,
          left: `${contextMenuPos.x}px`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-2xl py-1 min-w-[200px]">
          <button
            onClick={handleCopyImage}
            className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-3 text-gray-700 dark:text-gray-200 transition"
          >
            <Copy className="w-4 h-4" />
            <span>Copy Image</span>
          </button>
          <button
            onClick={handleCopyImageUrl}
            className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-3 text-gray-700 dark:text-gray-200 transition"
          >
            <Copy className="w-4 h-4" />
            <span>Copy Image URL</span>
          </button>
          <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
          <button
            onClick={(e) => {
              handleDownload(e);
              setShowContextMenu(false);
            }}
            className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-3 text-gray-700 dark:text-gray-200 transition"
          >
            <Download className="w-4 h-4" />
            <span>Download Image</span>
          </button>
        </div>
      </div>,
      document.body
    );
  };

  // Borderless image display - Messenger style
  if (isImage) {
    return (
      <>
        <div className="relative">
          <a 
            href={fileUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            onContextMenu={handleImageContextMenu}
            className="block"
          >
            <img
              src={fileUrl}
              alt={fileName || 'Image'}
              className="max-w-full h-auto rounded-2xl cursor-pointer hover:opacity-95 transition shadow-sm"
              style={{ maxHeight: '400px', minWidth: '200px' }}
              loading="lazy"
            />
          </a>
        </div>
        <ContextMenu />
      </>
    );
  }

  // PDF display - Cleaner, borderless style
  if (isPDF) {
    return (
      <div className="max-w-sm">
        <div className={`${
          isOwnMessage 
            ? 'bg-blue-600 bg-opacity-20' 
            : 'bg-gray-300 dark:bg-gray-600 bg-opacity-30'
        } rounded-2xl p-3`}>
          <div className="flex items-center space-x-3 mb-3">
            <div className={`${isOwnMessage ? 'text-blue-200' : 'text-red-500'} flex-shrink-0`}>
              <FileText className="w-8 h-8" />
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium truncate ${
                isOwnMessage ? 'text-white' : 'text-gray-900 dark:text-gray-100'
              }`} title={fileName}>
                {fileName}
              </p>
              <p className={`text-xs ${
                isOwnMessage ? 'text-blue-100' : 'text-gray-600 dark:text-gray-400'
              }`}>
                {formatFileSize(fileSize)}
              </p>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={handleOpenPDF}
              className={`flex-1 flex items-center justify-center space-x-2 px-3 py-2 ${
                isOwnMessage
                  ? 'bg-blue-500 hover:bg-blue-600'
                  : 'bg-blue-500 hover:bg-blue-600'
              } text-white rounded-lg text-sm transition`}
            >
              <ExternalLink className="w-4 h-4" />
              <span>Open</span>
            </button>
            <button
              onClick={handleDownload}
              className={`flex-1 flex items-center justify-center space-x-2 px-3 py-2 ${
                isOwnMessage
                  ? 'bg-green-500 hover:bg-green-600'
                  : 'bg-green-500 hover:bg-green-600'
              } text-white rounded-lg text-sm transition`}
            >
              <Download className="w-4 h-4" />
              <span>Download</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Other files - Cleaner style
  return (
    <div className="max-w-sm">
      <div className={`${
        isOwnMessage 
          ? 'bg-blue-600 bg-opacity-20' 
          : 'bg-gray-300 dark:bg-gray-600 bg-opacity-30'
      } rounded-2xl p-3 flex items-center space-x-3`}>
        <div className={`${
          isOwnMessage ? 'text-blue-200' : 'text-gray-600 dark:text-gray-300'
        } flex-shrink-0`}>
          {getFileIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium truncate ${
            isOwnMessage ? 'text-white' : 'text-gray-900 dark:text-gray-100'
          }`} title={fileName}>
            {fileName}
          </p>
          <p className={`text-xs ${
            isOwnMessage ? 'text-blue-100' : 'text-gray-600 dark:text-gray-400'
          }`}>
            {formatFileSize(fileSize)}
          </p>
        </div>
        <button
          onClick={handleDownload}
          className={`p-2 ${
            isOwnMessage
              ? 'hover:bg-blue-500 hover:bg-opacity-30'
              : 'hover:bg-gray-400 hover:bg-opacity-30'
          } rounded-lg transition flex-shrink-0`}
          title="Download"
        >
          <Download className={`w-5 h-5 ${
            isOwnMessage ? 'text-white' : 'text-gray-700 dark:text-gray-200'
          }`} />
        </button>
      </div>
    </div>
  );
};

export default FileMessage;