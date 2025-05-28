import React, { useState, useRef } from 'react';
import { FiUpload, FiFile, FiX } from 'react-icons/fi';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  acceptedFileTypes?: string;
  maxSizeMB?: number;
  label?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  acceptedFileTypes = '.pdf,.jpg,.jpeg,.png,.tiff,.bmp',
  maxSizeMB = 10,
  label = 'Télécharger une facture'
}) => {
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const validateFile = (file: File): boolean => {
    // Vérifier le type de fichier
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    const validType = acceptedFileTypes.split(',').includes(fileExtension);
    if (!validType) {
      setError(`Type de fichier non supporté. Types acceptés: ${acceptedFileTypes}`);
      return false;
    }

    // Vérifier la taille du fichier
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      setError(`La taille du fichier dépasse la limite de ${maxSizeMB} MB`);
      return false;
    }

    setError(null);
    return true;
  };

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (validateFile(file)) {
        setSelectedFile(file);
        onFileSelect(file);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (validateFile(file)) {
        setSelectedFile(file);
        onFileSelect(file);
      }
    }
  };

  const handleButtonClick = () => {
    inputRef.current?.click();
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  return (
    <div className="w-full">
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          dragActive ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/10' : 'border-gray-300 dark:border-gray-600'
        } ${error ? 'border-error' : ''}`}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleFileDrop}
        onClick={handleButtonClick}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept={acceptedFileTypes}
          onChange={handleFileChange}
        />
        
        {selectedFile ? (
          <div className="flex items-center justify-center gap-2">
            <FiFile className="text-2xl" />
            <span className="font-medium truncate max-w-xs">{selectedFile.name}</span>
            <button 
              type="button"
              className="ml-2 text-error hover:text-error/80"
              onClick={(e) => {
                e.stopPropagation();
                removeFile();
              }}
            >
              <FiX className="text-lg" />
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <FiUpload className="mx-auto text-3xl text-text-secondary" />
            <h4 className="text-lg font-medium">{label}</h4>
            <p className="text-sm text-text-secondary">
              Glissez-déposez un fichier ou cliquez pour sélectionner
            </p>
            <p className="text-xs text-text-secondary/80">
              Formats acceptés: {acceptedFileTypes} (max {maxSizeMB} MB)
            </p>
          </div>
        )}
      </div>
      
      {error && (
        <p className="mt-2 text-sm text-error">{error}</p>
      )}
    </div>
  );
};

export default FileUpload;
