import React, { useState, useEffect, useCallback } from "react";
import api from "../services/api";
import FileItem from "../components/FileItem";
import { Music, Loader2, AlertTriangle, Search } from "lucide-react";

export default function MusicPage() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchFiles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/files");
      // Filtrer uniquement les fichiers audio
      const audioFiles = res.data.filter(file => {
        const mimetype = file.mimetype || '';
        return mimetype.startsWith('audio/') ||
               file.name.endsWith('.mp3') ||
               file.name.endsWith('.wav') ||
               file.name.endsWith('.ogg') ||
               file.name.endsWith('.flac') ||
               file.name.endsWith('.aac') ||
               file.name.endsWith('.m4a');
      });
      setFiles(audioFiles);
    } catch (err) {
      setError("Erreur lors du chargement des fichiers audio.");
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

      setMessage(`Téléchargement de "${file.name}" terminé.`);
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Erreur lors du téléchargement.";
      setMessage(`Erreur: ${errorMessage}`);
    }
  };

  const handleDelete = async (fileId) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce fichier audio ?")) return;
    
    try {
      await api.delete(`/files/${fileId}`);
      setMessage("Fichier audio supprimé avec succès.");
      setFiles(prevFiles => prevFiles.filter(file => file.id !== fileId));
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Erreur lors de la suppression.";
      setMessage(`Erreur: ${errorMessage}`);
    }
  };

  // Filtrer par recherche
  const filteredFiles = files.filter(file => 
    file.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculer la taille totale
  const totalSize = files.reduce((sum, file) => sum + file.size, 0);
  const formatSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="py-4 sm:py-8">
      
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-100 mb-2 flex items-center">
          <Music className="w-8 h-8 mr-3 text-green-400" />
          Ma Musique
        </h1>
        <p className="text-gray-400">Tous vos fichiers audio en un seul endroit</p>
      </header>

      {/* Message */}
      {message && (
        <div className={`p-3 mb-4 rounded-lg font-medium ${
          message.startsWith('Erreur:') ? 'bg-red-900/30 text-red-400 border border-red-800' : 'bg-green-900/30 text-green-400 border border-green-800'
        }`}>
          {message}
        </div>
      )}

      {/* Barre de recherche */}
      <div className="mb-6 relative">
        <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
        <input
          type="text"
          placeholder="Rechercher un fichier audio..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Nombre de pistes</p>
              <p className="text-3xl font-bold text-green-400 mt-1">{files.length}</p>
            </div>
            <Music className="w-12 h-12 text-green-400 opacity-30" />
          </div>
        </div>

        <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Taille totale</p>
              <p className="text-3xl font-bold text-pink-400 mt-1">{formatSize(totalSize)}</p>
            </div>
            <Music className="w-12 h-12 text-pink-400 opacity-30" />
          </div>
        </div>
      </div>

      {/* Contenu */}
      {loading && (
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-10 flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin mb-3 text-green-400" />
          <p className="text-gray-400">Chargement des fichiers audio...</p>
        </div>
      )}

      {error && (
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-10 flex flex-col items-center justify-center">
          <AlertTriangle className="w-8 h-8 mb-3 text-red-400" />
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {!loading && !error && filteredFiles.length === 0 && (
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-10 flex flex-col items-center justify-center text-gray-500">
          <Music className="w-12 h-12 mb-3 opacity-50" />
          <p className="text-lg font-semibold">Aucun fichier audio trouvé</p>
          <p className="text-sm mt-2">Uploadez vos premières musiques dans la section Fichiers</p>
        </div>
      )}

      {!loading && !error && filteredFiles.length > 0 && (
        <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
          <div className="p-4 bg-gray-800 border-b border-gray-700">
            <p className="text-sm text-gray-400">
              Affichage de {filteredFiles.length} piste{filteredFiles.length > 1 ? 's' : ''}
            </p>
          </div>
          {filteredFiles.map(file => (
            <FileItem key={file.id} file={file} onDownload={handleDownload} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
