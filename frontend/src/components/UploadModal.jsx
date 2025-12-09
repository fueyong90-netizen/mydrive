import React, { useState } from 'react';
import { X, Upload, Loader2, AlertTriangle, CheckCircle, Sparkles } from 'lucide-react';
import api from '../services/api';

const formatSize = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

export default function UploadModal({ isOpen, onClose, onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    setError('');
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.size > 100 * 1024 * 1024) {
        setError('Le fichier est trop volumineux. Taille maximale : 100 MB');
        setFile(null);
        return;
      }
      setFile(selectedFile);
    } else {
      setFile(null);
    }
  };

  // Drag & Drop
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      if (droppedFile.size > 100 * 1024 * 1024) {
        setError('Le fichier est trop volumineux. Taille maximale : 100 MB');
        return;
      }
      setFile(droppedFile);
      setError('');
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Veuillez sélectionner un fichier.');
      return;
    }

    setIsUploading(true);
    setError('');
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('file', file);

    try {
      await api.post('/files/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        },
      });
      
      onUploadSuccess();
      setFile(null);
      setUploadProgress(0);
      onClose();
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Erreur inconnue lors de l\'upload.';
      setError(errorMessage);
      setUploadProgress(0);
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    if (!isUploading) {
      setFile(null);
      setError('');
      setUploadProgress(0);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg p-6 border-2 border-gray-800 transform transition-all duration-300 animate-scaleIn">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-800">
          <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500 flex items-center gap-2">
            <Upload className="w-6 h-6 text-green-400 animate-bounce" /> 
            Téléverser un Fichier
          </h2>
          <button 
            onClick={handleClose} 
            className="text-gray-400 hover:text-gray-300 transition-all hover:rotate-90 disabled:opacity-50"
            disabled={isUploading}
          >
            <X className="w-7 h-7" />
          </button>
        </div>

        <form onSubmit={handleUpload}>
          
          {/* Zone de drop */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`mb-6 border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
              isDragOver 
                ? 'border-green-500 bg-green-500/10 scale-105' 
                : 'border-gray-700 bg-gray-800/50 hover:border-green-500 hover:bg-gray-800'
            }`}
          >
            <input
              id="file-upload"
              type="file"
              onChange={handleFileChange}
              className="hidden"
              disabled={isUploading}
            />
            
            <label 
              htmlFor="file-upload" 
              className="cursor-pointer flex flex-col items-center"
            >
              <div className={`mb-4 p-4 rounded-full transition-all ${
                isDragOver ? 'bg-green-500 scale-110' : 'bg-gray-700'
              }`}>
                <Upload className={`w-12 h-12 ${
                  isDragOver ? 'text-white animate-bounce' : 'text-green-400'
                }`} />
              </div>
              <p className="text-gray-300 font-semibold mb-2">
                {isDragOver ? '📥 Déposez votre fichier ici' : 'Glissez-déposez votre fichier'}
              </p>
              <p className="text-gray-500 text-sm">
                ou <span className="text-green-400 font-semibold">cliquez pour parcourir</span>
              </p>
              <p className="text-xs text-gray-600 mt-2">Taille max: 100 MB</p>
            </label>
          </div>

          {/* Fichier sélectionné */}
          {file && (
            <div className="mb-6 p-4 bg-gradient-to-r from-green-900/30 to-blue-900/30 rounded-xl border border-green-700 animate-slideInDown">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-300 font-semibold">Fichier sélectionné :</p>
                  <p className="text-gray-100 font-bold truncate">{file.name}</p>
                  <p className="text-xs text-gray-400 mt-1">{formatSize(file.size)}</p>
                </div>
                <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse" />
              </div>
            </div>
          )}

          {/* Barre de progression */}
          {isUploading && uploadProgress > 0 && (
            <div className="mb-6 animate-slideInDown">
              <div className="flex justify-between text-sm text-gray-300 mb-2 font-semibold">
                <span>Progression</span>
                <span className="text-green-400">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-3 border border-gray-700 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-green-500 to-blue-500 h-full rounded-full transition-all duration-300 relative overflow-hidden"
                  style={{ width: `${uploadProgress}%` }}
                >
                  <div className="absolute inset-0 bg-white opacity-30 animate-pulse"></div>
                </div>
              </div>
            </div>
          )}

          {/* Message d'erreur */}
          {error && (
            <div className="flex items-start p-4 mb-6 text-sm text-red-400 bg-red-900/30 rounded-xl border border-red-800 animate-slideInDown" role="alert">
              <AlertTriangle className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5 animate-pulse" />
              <div>{error}</div>
            </div>
          )}

          {/* Bouton d'upload */}
          <button
            type="submit"
            className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center transition-all duration-300 ${
              isUploading 
                ? 'bg-gray-700 cursor-not-allowed' 
                : 'bg-gradient-to-r from-green-500 to-blue-500 text-white hover:from-green-400 hover:to-blue-400 shadow-lg hover:shadow-green-500/50 transform hover:scale-105'
            }`}
            disabled={isUploading}
          >
            {isUploading ? (
              <>
                <Loader2 className="w-6 h-6 mr-2 animate-spin" />
                Téléversement en cours...
              </>
            ) : (
              <>
                <Upload className="w-6 h-6 mr-2" />
                Démarrer l'Upload
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
