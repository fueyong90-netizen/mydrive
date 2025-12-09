import React from 'react';
import { File, Download, Trash2, Video, Music, FileText, ImageIcon, Smartphone } from 'lucide-react';

const getFileIcon = (mimetype) => {
  if (!mimetype) return FileText;
  
  if (mimetype.startsWith('image/')) return ImageIcon;
  if (mimetype.startsWith('video/')) return Video;
  if (mimetype.startsWith('audio/')) return Music;
  if (mimetype.includes('android') || mimetype.includes('exe') || mimetype.includes('dmg') || mimetype.includes('apk')) return Smartphone;
  if (mimetype.includes('pdf') || mimetype.includes('document') || mimetype.includes('text')) return FileText;
  
  return File;
};

const getFileColor = (mimetype) => {
  if (!mimetype) return 'blue';
  
  if (mimetype.startsWith('image/')) return 'purple';
  if (mimetype.startsWith('video/')) return 'red';
  if (mimetype.startsWith('audio/')) return 'pink';
  if (mimetype.includes('android') || mimetype.includes('exe') || mimetype.includes('dmg') || mimetype.includes('apk')) return 'yellow';
  if (mimetype.includes('pdf') || mimetype.includes('document') || mimetype.includes('text')) return 'blue';
  
  return 'green';
};

const formatSize = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

export default function FileItem({ file, onDownload, onDelete }) {
  const Icon = getFileIcon(file.mimetype);
  const color = getFileColor(file.mimetype);
  
  const colorClasses = {
    blue: 'text-blue-400',
    purple: 'text-purple-400',
    red: 'text-red-400',
    pink: 'text-pink-400',
    yellow: 'text-yellow-400',
    green: 'text-green-400',
  };

  return (
    <div className="flex items-center justify-between p-4 bg-gray-800 hover:bg-gray-750 border-b border-gray-700 last:border-b-0 transition duration-150 ease-in-out">
      
      {/* File Info */}
      <div className="flex items-center space-x-3 flex-1 min-w-0">
        <Icon className={`w-6 h-6 ${colorClasses[color]} flex-shrink-0`} />
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-gray-100 truncate" title={file.name}>{file.name}</p>
          <p className="text-sm text-gray-400">
            {formatSize(file.size)} • {new Date(file.uploaded_at).toLocaleDateString('fr-FR')}
          </p>
        </div>
      </div>
      
      {/* Actions */}
      <div className="flex space-x-2 ml-4">
        <button
          onClick={() => onDownload(file)}
          className="p-2 text-green-400 hover:text-green-300 hover:bg-green-900/20 rounded-full transition duration-150 ease-in-out"
          title="Télécharger"
        >
          <Download className="w-5 h-5" />
        </button>
        <button
          onClick={() => onDelete(file.id)}
          className="p-2 text-red-500 hover:text-red-400 hover:bg-red-900/20 rounded-full transition duration-150 ease-in-out"
          title="Supprimer"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
