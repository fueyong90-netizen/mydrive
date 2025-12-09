import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import FileItem from "../components/FileItem";
import UploadModal from "../components/UploadModal";
import { Upload, FileText, Video, Music, LayoutList, Loader2, AlertTriangle, File as FileIcon, ImageIcon, Smartphone, HardDrive, Sparkles, Zap } from "lucide-react";

export default function Dashboard() {
  const { currentUser } = useAuth();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [showWelcome, setShowWelcome] = useState(false);

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
    
    // Afficher le message de bienvenue si nouveau
    const welcomed = localStorage.getItem('welcomed');
    if (!welcomed) {
      setShowWelcome(true);
      setTimeout(() => {
        setShowWelcome(false);
        localStorage.setItem('welcomed', 'true');
      }, 5000);
    }
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
      const errorMessage = err.response?.data?.message || "Erreur lors du téléchargement du fichier.";
      setMessage(`❌ Erreur: ${errorMessage}`);
      console.error("Erreur téléchargement:", err);
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
      const errorMessage = err.response?.data?.message || "Erreur lors de la suppression du fichier.";
      setMessage(`❌ Erreur: ${errorMessage}`);
      console.error("Erreur suppression:", err);
    }
  };

  const handleUploadSuccess = () => {
    setMessage("✅ Fichier uploadé avec succès !");
    fetchFiles();
    setTimeout(() => setMessage(''), 3000);
  };
  
  // Statistiques
  const totalFiles = files.length;
  const totalSize = files.reduce((sum, file) => sum + file.size, 0);
  const documentCount = files.filter(f => {
    const type = f.mimetype || '';
    return type.includes('pdf') || type.includes('document') || type.includes('text') || type.includes('sheet') || type.includes('presentation');
  }).length;
  const imageCount = files.filter(f => (f.mimetype || '').startsWith('image/')).length;
  const videoCount = files.filter(f => (f.mimetype || '').startsWith('video/')).length;
  const audioCount = files.filter(f => (f.mimetype || '').startsWith('audio/')).length;
  const appCount = files.filter(f => {
    const type = f.mimetype || '';
    return type.includes('android') || type.includes('exe') || type.includes('dmg') || type.includes('apk');
  }).length;

  const formatSize = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  return (
    <div className="py-4 sm:py-8 relative">
      
      {/* Message de bienvenue animé */}
      {showWelcome && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-gradient-to-br from-green-500 to-green-700 p-8 rounded-2xl shadow-2xl max-w-md mx-4 animate-scaleIn border-4 border-green-400">
            <div className="text-center">
              <Sparkles className="w-16 h-16 mx-auto mb-4 text-yellow-300 animate-pulse" />
              <h2 className="text-3xl font-bold text-white mb-2">BIENVENUE !</h2>
              <p className="text-xl text-gray-100 font-mono">
                🔥 Dans le monde du <span className="text-yellow-300 font-bold">HACKER PFJ</span> 🔥
              </p>
              <Zap className="w-8 h-8 mx-auto mt-4 text-yellow-300 animate-bounce" />
            </div>
          </div>
        </div>
      )}

      {/* Header avec gradient animé */}
      <header className="mb-8 relative overflow-hidden rounded-2xl bg-gradient-to-r from-green-600 via-green-500 to-green-600 p-6 animate-gradient">
        <div className="relative z-10">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3 animate-slideInLeft">
            <Sparkles className="w-10 h-10 animate-pulse" />
            Salut, {currentUser?.username || 'Hacker'} !
          </h1>
          <p className="text-gray-100 text-lg animate-slideInLeft" style={{ animationDelay: '0.1s' }}>
            Bienvenue dans ton espace cloud sécurisé 🔒
          </p>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl animate-float"></div>
      </header>

      {/* Statistiques avec animations */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {[
          { icon: LayoutList, label: "Total", value: totalFiles, color: "green", delay: "0s" },
          { icon: FileText, label: "Documents", value: documentCount, color: "blue", delay: "0.1s" },
          { icon: ImageIcon, label: "Images", value: imageCount, color: "purple", delay: "0.2s" },
          { icon: Video, label: "Vidéos", value: videoCount, color: "red", delay: "0.3s" },
          { icon: Music, label: "Audio", value: audioCount, color: "pink", delay: "0.4s" },
          { icon: Smartphone, label: "Apps", value: appCount, color: "yellow", delay: "0.5s" }
        ].map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div 
              key={idx}
              className="bg-gray-800 p-4 rounded-xl shadow-lg border border-gray-700 hover:border-green-500 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-green-500/20 animate-slideInUp cursor-pointer"
              style={{ animationDelay: stat.delay }}
            >
              <div className="flex items-center mb-2">
                <Icon className={`w-5 h-5 text-${stat.color}-400 mr-2 animate-pulse`} />
                <p className="text-xs font-medium text-gray-400">{stat.label}</p>
              </div>
              <p className="text-3xl font-bold text-gray-100">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Espace utilisé avec barre de progression */}
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-xl border border-gray-700 mb-8 hover:border-green-500 transition-all duration-300 animate-slideInUp" style={{ animationDelay: '0.6s' }}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm font-medium text-gray-400">Espace utilisé</p>
            <p className="text-4xl font-bold text-green-400 mt-1">{formatSize(totalSize)}</p>
          </div>
          <HardDrive className="w-16 h-16 text-green-400 opacity-30 animate-pulse" />
        </div>
        <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-green-500 to-green-400 h-full rounded-full animate-progress transition-all duration-1000"
            style={{ width: `${Math.min((totalSize / (10 * 1024 * 1024 * 1024)) * 100, 100)}%` }}
          ></div>
        </div>
        <p className="text-xs text-gray-500 mt-2">Limite: 10 GB (Gratuit)</p>
      </div>

      {/* Message de succès/erreur avec animation */}
      {message && (
        <div className={`p-4 mb-4 rounded-lg font-medium animate-slideInDown shadow-lg ${
          message.startsWith('❌') 
            ? 'bg-red-900/30 text-red-400 border border-red-800' 
            : 'bg-green-900/30 text-green-400 border border-green-800'
        }`}>
          {message}
        </div>
      )}

      {/* Bouton d'Upload animé */}
      <div className="flex justify-end mb-6 animate-slideInRight">
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-gradient-to-r from-green-500 to-green-600 text-gray-900 px-8 py-4 rounded-full font-bold flex items-center hover:from-green-400 hover:to-green-500 transition-all duration-300 shadow-2xl hover:shadow-green-500/50 transform hover:scale-110 hover:-rotate-2"
        >
          <Upload className="w-6 h-6 mr-2 animate-bounce" />
          Téléverser un fichier
        </button>
      </div>

      {/* Liste des Fichiers */}
      <div className="bg-gray-900 rounded-xl shadow-2xl overflow-hidden border border-gray-800 animate-slideInUp" style={{ animationDelay: '0.8s' }}>
        
        <div className="p-6 bg-gradient-to-r from-gray-800 to-gray-900 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-gray-100 flex items-center gap-2">
            <FileIcon className="w-7 h-7 text-green-400 animate-pulse" />
            Fichiers récents
          </h2>
          <p className="text-sm text-gray-400 mt-1">Derniers fichiers ajoutés</p>
        </div>

        {loading && (
          <div className="p-16 flex flex-col items-center justify-center text-green-400">
            <Loader2 className="w-12 h-12 animate-spin mb-4" />
            <p className="text-lg">Chargement de vos fichiers...</p>
          </div>
        )}

        {error && (
          <div className="p-16 flex flex-col items-center justify-center text-red-400">
            <AlertTriangle className="w-12 h-12 mb-4 animate-pulse" />
            <p className="text-lg">{error}</p>
          </div>
        )}

        {!loading && !error && files.length === 0 && (
          <div className="p-16 flex flex-col items-center justify-center text-gray-500">
            <FileIcon className="w-16 h-16 mb-4 opacity-50 animate-pulse" />
            <p className="text-xl font-semibold">Aucun fichier trouvé</p>
            <p className="text-sm mt-2">Commencez par téléverser votre premier fichier !</p>
          </div>
        )}

        {!loading && !error && files.length > 0 && (
          <div className="divide-y divide-gray-800">
            {files.slice(0, 8).map((file, idx) => (
              <div 
                key={file.id}
                className="animate-slideInLeft hover:bg-gray-800 transition-colors"
                style={{ animationDelay: `${idx * 0.05}s` }}
              >
                <FileItem 
                  file={file} 
                  onDownload={handleDownload} 
                  onDelete={handleDelete} 
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal d'Upload */}
      <UploadModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onUploadSuccess={handleUploadSuccess}
      />
    </div>
  );
}
