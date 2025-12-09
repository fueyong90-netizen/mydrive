import React, { useState, useEffect, useCallback } from "react";
import api from "../services/api";
import FileItem from "../components/FileItem";
import { Smartphone, Loader2, AlertTriangle, Search } from "lucide-react";

export default function AppsPage() {
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
      // Filtrer uniquement les applications
      const appFiles = res.data.filter(file => {
        const mimetype = file.mimetype || '';
        return mimetype.includes('android') || 
               mimetype.includes('exe') || 
               mimetype.includes('dmg') || 
               mimetype.includes('apk') ||
               file.name.endsWith('.apk') ||
               file.name.endsWith('.exe') ||
               file.name.endsWith('.dmg');
      });
      setFiles(appFiles);
    } catch (err) {
      setError("Erreur lors du chargement des applications.");
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
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette application ?")) return;
    
    try {
      await api.delete(`/files/${fileId}`);
      setMessage("Application supprimée avec succès.");
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

  return (
    <div className="py-4 sm:py-8">
      
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-100 mb-2 flex items-center">
          <Smartphone className="w-8 h-8 mr-3 text-green-400" />
          Mes Applications
        </h1>
        <p className="text-gray-400">Applications stockées pour téléchargement (.apk, .exe, .dmg)</p>
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
          placeholder="Rechercher une application..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
      </div>

      {/* Statistiques */}
      <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400">Total des applications</p>
            <p className="text-3xl font-bold text-green-400 mt-1">{files.length}</p>
          </div>
          <Smartphone className="w-12 h-12 text-green-400 opacity-30" />
        </div>
      </div>

      {/* Contenu */}
      {loading && (
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-10 flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin mb-3 text-green-400" />
          <p className="text-gray-400">Chargement des applications...</p>
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
          <Smartphone className="w-12 h-12 mb-3 opacity-50" />
          <p className="text-lg font-semibold">Aucune application trouvée</p>
          <p className="text-sm mt-2">Uploadez des fichiers .apk, .exe ou .dmg dans la section Fichiers</p>
        </div>
      )}

      {!loading && !error && filteredFiles.length > 0 && (
        <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
          {filteredFiles.map(file => (
            <FileItem key={file.id} file={file} onDownload={handleDownload} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
