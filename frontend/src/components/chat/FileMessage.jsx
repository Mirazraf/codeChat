import { Download, File, FileText, Image as ImageIcon, ExternalLink } from 'lucide-react';

const FileMessage = ({ fileUrl, fileName, fileType, fileSize }) => {
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

  const handleDownload = async (e) => {
    e.preventDefault();
    
    try {
      // For PDFs and documents, convert Cloudinary URL to download URL
      let downloadUrl = fileUrl;
      
      // If it's a Cloudinary URL, add fl_attachment flag for download
      if (fileUrl.includes('cloudinary.com')) {
        // Insert fl_attachment before the version number or filename
        downloadUrl = fileUrl.replace('/upload/', '/upload/fl_attachment/');
      }
      
      // Fetch the file
      const response = await fetch(downloadUrl);
      const blob = await response.blob();
      
      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName || 'download';
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
      // Fallback: Try direct download
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
    // For Cloudinary PDFs, convert to proper viewing URL
    let viewUrl = fileUrl;
    
    // If it's stored as 'raw' resource type, we need to open it differently
    if (fileUrl.includes('cloudinary.com')) {
      // For raw files, open directly
      if (fileUrl.includes('/raw/upload/')) {
        viewUrl = fileUrl;
      } else {
        // Convert image URL to raw URL for PDFs
        viewUrl = fileUrl.replace('/image/upload/', '/raw/upload/');
      }
    }
    
    // Open in new tab
    window.open(viewUrl, '_blank');
  };

  // Image display
  if (isImage) {
    return (
      <div className="my-2">
        <a href={fileUrl} target="_blank" rel="noopener noreferrer">
          <img
            src={fileUrl}
            alt={fileName}
            className="max-w-full h-auto rounded-lg cursor-pointer hover:opacity-90 transition"
            style={{ maxHeight: '300px' }}
            loading="lazy"
          />
        </a>
        {fileName && (
          <p className="text-xs mt-1 opacity-75">{fileName}</p>
        )}
      </div>
    );
  }

  // PDF display with embed
  if (isPDF) {
    return (
      <div className="my-2 max-w-sm">
        <div className="bg-white dark:bg-gray-700 bg-opacity-10 rounded-lg p-3">
          <div className="flex items-center space-x-3 mb-3">
            <div className="text-red-500">
              <FileText className="w-8 h-8" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{fileName}</p>
              <p className="text-xs opacity-75">{formatFileSize(fileSize)}</p>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={handleOpenPDF}
              className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm transition"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Open</span>
            </button>
            <button
              onClick={handleDownload}
              className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded text-sm transition"
            >
              <Download className="w-4 h-4" />
              <span>Download</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Other files
  return (
    <div className="my-2 flex items-center space-x-3 bg-white dark:bg-gray-700 bg-opacity-10 rounded-lg p-3 max-w-sm">
      <div className="text-gray-600 dark:text-gray-300">
        {getFileIcon()}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{fileName}</p>
        <p className="text-xs opacity-75">{formatFileSize(fileSize)}</p>
      </div>
      <button
        onClick={handleDownload}
        className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition"
        title="Download"
      >
        <Download className="w-5 h-5" />
      </button>
    </div>
  );
};

export default FileMessage;