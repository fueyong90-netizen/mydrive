import React, { useState, useEffect, useCallback } from "react";
import api from "../services/api";
import FileItem from "../components/FileItem";
import UploadModal from "../components/UploadModal";
import { Upload, FileText, Video, Music, ImageIcon, Smartphone, Search, Loader2, AlertTriangle, File as FileIcon, FolderOpen, Filter, Sparkles } from "lucide-react";

export default function FilesPage() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  const fetchFiles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/files");
      setFiles(res.data);
    } catch (err) {
      setError("Erreur lors du chargement des fichiers.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const handleDownload = async (file) => {
    try {
      const res = await api.get(`/files/${file.id}/download`, {
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', file.name);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setMessage(`✅ Téléchargement de "${file.name}" terminé.`);
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Erreur lors du téléchargement.";
      setMessage(`❌ Erreur: ${errorMessage}`);
    }
  };

  const handleDelete = async (fileId) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce fichier ?")) return;
    
    try {
      await api.delete(`/files/${fileId}`);
      setMessage("✅ Fichier supprimé avec succès.");
      setFiles(prevFiles => prevFiles.filter(file => file.id !== fileId));
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Erreur lors de la suppression.";
      setMessage(`❌ Erreur: ${errorMessage}`);
    }
  };

  const handleUploadSuccess = () => {
    setMessage("✅ Fichier uploadé avec succès !");
    fetchFiles();
    setTimeout(() => setMessage(''), 3000);
  };

  const getFileType = (mimetype) => {
    if (!mimetype) return 'document';
    if (mimetype.startsWith('image/')) return 'image';
    if (mimetype.startsWith('video/')) return 'video';
    if (mimetype.startsWith('audio/')) return 'audio';
    if (mimetype.includes('android') || mimetype.includes('exe') || mimetype.includes('dmg') || mimetype.includes('apk')) return 'app';
    return 'document';
  };

  const filteredFiles = files.filter(file => {
    const fileType = getFileType(file.mimetype);
    const matchesType = filterType === 'all' || fileType === filterType;
    const matchesSearch = file.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  const filesByType = {
    document: filteredFiles.filter(f => getFileType(f.mimetype) === 'document'),
    image: filteredFiles.filter(f => getFileType(f.mimetype) === 'image'),
    video: filteredFiles.filter(f => getFileType(f.mimetype) === 'video'),
    audio: filteredFiles.filter(f => getFileType(f.mimetype) === 'audio'),
    app: filteredFiles.filter(f => getFileType(f.mimetype) === 'app'),
  };

  return (
    <div className="py-4 sm:py-8">
      
      {/* Header avec gradient */}
      <header className="mb-8 relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-6 animate-gradient">
        <div className="relative z-10">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3 animate-slideInLeft">
            <FolderOpen className="w-10 h-10 animate-pulse" />
            Mes Fichiers
          </h1>
          <p className="text-gray-100 text-lg animate-slideInLeft" style={{ animationDelay: '0.1s' }}>
            Gérez et organisez tous vos fichiers par type
          </p>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl animate-float"></div>
      </header>

      {/* Message */}
      {message && (
        <div className={`p-4 mb-4 rounded-lg font-medium animate-slideInDown shadow-lg ${
          message.startsWith('❌') 
            ? 'bg-red-900/30 text-red-400 border border-red-800' 
            : 'bg-green-900/30 text-green-400 border border-green-800'
        }`}>
          {message}
        </div>
      )}

      {/* Barre de recherche et filtres */}
      <div className="flex flex-col md:flex-row gap-4 mb-6 animate-slideInUp">
        <div className="flex-1 relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Rechercher un fichier... 🔍"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all hover:border-green-500"
          />
        </div>
        
        <div className="relative">
          <Filter className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 focus:ring-2 focus:ring-green-500 cursor-pointer min-w-[200px] transition-all hover:border-green-500"
          >
            <option value="all">📁 Tous les types</option>
            <option value="document">📄 Documents</option>
            <option value="image">🖼️ Images</option>
            <option value="video">🎥 Vidéos</option>
            <option value="audio">🎵 Audio</option>
            <option value="app">📱 Applications</option>
          </select>
        </div>

        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-gradient-to-r from-green-500 to-green-600 text-gray-900 px-8 py-3 rounded-lg font-bold flex items-center justify-center hover:from-green-400 hover:to-green-500 transition-all duration-300 shadow-lg hover:shadow-green-500/50 transform hover:scale-105"
        >
          <Upload className="w-5 h-5 mr-2" />
          Upload
        </button>
      </div>

      {/* Contenu */}
      {loading && (
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-16 flex flex-col items-center justify-center">
          <Loader2 className="w-12 h-12 animate-spin mb-4 text-green-400" />
          <p className="text-gray-400 text-lg">Chargement des fichiers...</p>
        </div>
      )}

      {error && (
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-16 flex flex-col items-center justify-center">
          <AlertTriangle className="w-12 h-12 mb-4 text-red-400 animate-pulse" />
          <p className="text-red-400 text-lg">{error}</p>
        </div>
      )}

      {!loading && !error && filteredFiles.length === 0 && (
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-16 flex flex-col items-center justify-center">
          <FileIcon className="w-16 h-16 mb-4 text-gray-600 animate-pulse" />
          <p className="text-xl font-semibold text-gray-400">Aucun fichier trouvé</p>
          <p className="text-sm text-gray-500 mt-2">Essayez de modifier vos filtres ou uploadez un fichier</p>
        </div>
      )}

      {/* Affichage par type */}
      {!loading && !error && filterType === 'all' && (
        <>
          {Object.entries(filesByType).map(([type, typeFiles], idx) => {
            if (typeFiles.length === 0) return null;
            
            const typeConfig = {
              document: { icon: FileText, color: 'blue', label: 'Documents' },
              image: { icon: ImageIcon, color: 'purple', label: 'Images' },
              video: { icon: Video, color: 'red', label: 'Vidéos' },
              audio: { icon: Music, color: 'pink', label: 'Audio' },
              app: { icon: Smartphone, color: 'yellow', label: 'Applications' },
            };

            const config = typeConfig[type];
            const Icon = config.icon;

            return (
              <div key={type} className="mb-6 animate-slideInUp" style={{ animationDelay: `${idx * 0.1}s` }}>
                <div className="flex items-center mb-3 bg-gray-800 p-3 rounded-lg border border-gray-700">
                  <Icon className={`w-6 h-6 mr-3 text-${config.color}-400 animate-pulse`} />
                  <h2 className="text-xl font-bold text-gray-100">{config.label}</h2>
                  <span className="ml-3 text-sm text-gray-400 bg-gray-700 px-3 py-1 rounded-full">
                    {typeFiles.length}
                  </span>
                </div>
                <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden hover:border-green-500 transition-colors">
                  {typeFiles.map((file, fileIdx) => (
                    <div 
                      key={file.id}
                      className="animate-slideInLeft"
                      style={{ animationDelay: `${fileIdx * 0.02}s` }}
                    >
                      <FileItem file={file} onDownload={handleDownload} onDelete={handleDelete} />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </>
      )}

      {/* Affichage filtré */}
      {!loading && !error && filterType !== 'all' && filteredFiles.length > 0 && (
        <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden animate-slideInUp">
          {filteredFiles.map((file, idx) => (
            <div 
              key={file.id}
              className="animate-slideInLeft"
              style={{ animationDelay: `${idx * 0.03}s` }}
            >
              <FileItem file={file} onDownload={handleDownload} onDelete={handleDelete} />
            </div>
          ))}
        </div>
      )}

      {/* Modal d'Upload */}
      <UploadModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onUploadSuccess={handleUploadSuccess}
      />
    </div>
  );
}
