import { useState } from 'react';
import { Upload } from 'lucide-react';

const FileUploadDropzone = ({ onFileSelect, disabled }) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState(null);

  const validateFile = (file) => {
    // Check file type
    if (!file.name.endsWith('.csv')) {
      return 'Only CSV files are allowed';
    }

    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
      return 'File size must be less than 10MB';
    }

    return null;
  };

  const handleFile = (file) => {
    const validationError = validateFile(file);

    if (validationError) {
      setError(validationError);
      setSelectedFile(null);
      onFileSelect(null);
      return;
    }

    setError(null);
    setSelectedFile(file);
    onFileSelect(file);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (disabled) return;

    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="w-full">
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
          transition-colors duration-200
          ${dragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-blue-400'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          ${error ? 'border-red-400 bg-red-50' : ''}
        `}
      >
        <input
          type="file"
          id="file-upload"
          accept=".csv"
          onChange={handleChange}
          disabled={disabled}
          className="hidden"
        />

        <label
          htmlFor="file-upload"
          className={`cursor-pointer ${disabled ? 'cursor-not-allowed' : ''}`}
        >
          <div className="flex flex-col items-center">
            <Upload
              className={`h-12 w-12 mb-4 ${
                error ? 'text-red-500' : 'text-gray-400'
              }`}
            />

            {selectedFile ? (
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-900">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-gray-500">
                  {formatFileSize(selectedFile.size)}
                </p>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setSelectedFile(null);
                    setError(null);
                    onFileSelect(null);
                  }}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  disabled={disabled}
                >
                  Choose different file
                </button>
              </div>
            ) : (
              <>
                <p className="text-sm text-gray-600 mb-2">
                  <span className="font-semibold text-blue-600">Click to upload</span>
                  {' '}or drag and drop
                </p>
                <p className="text-xs text-gray-500">
                  CSV files only (max 10MB)
                </p>
              </>
            )}
          </div>
        </label>
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
};

export default FileUploadDropzone;
