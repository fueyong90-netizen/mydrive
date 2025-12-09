import React from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { User, Mail, Calendar, LogOut, Cloud } from "lucide-react";

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  return new Date().toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const ProfileCard = ({ Icon, label, value }) => (
  <div className="flex items-center p-4 bg-gray-800 rounded-lg border border-gray-700 transition duration-150 ease-in-out hover:border-green-500">
    <Icon className="w-6 h-6 text-green-400 flex-shrink-0 mr-4" />
    <div>
      <p className="text-sm font-medium text-gray-400">{label}</p>
      <p className="text-lg font-semibold text-gray-100 break-words">{value}</p>
    </div>
  </div>
);

export default function Profile() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = () => {
    logout();
    navigate("/");
  };

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center p-10 text-gray-400">
          Chargement des informations de l'utilisateur...
        </div>
      </div>
    );
  }

  return (
    <div className="py-4 sm:py-8 max-w-4xl mx-auto">
      
      {/* Header avec Avatar */}
      <header className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-24 h-24 bg-green-500/20 rounded-full mb-4 border-4 border-green-500">
          <User className="w-12 h-12 text-green-400" />
        </div>
        <h1 className="text-4xl font-extrabold text-gray-100 mb-2">Mon Profil</h1>
        <p className="text-lg text-gray-400">Informations de votre compte MyDrive</p>
      </header>

      {/* Informations du profil */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        
        <ProfileCard 
          Icon={User} 
          label="Nom d'utilisateur" 
          value={currentUser.username || 'Non spécifié'} 
        />
        
        <ProfileCard 
          Icon={Mail} 
          label="Adresse Email" 
          value={currentUser.email || 'N/A'} 
        />
        
        <ProfileCard 
          Icon={Calendar} 
          label="Membre depuis" 
          value={formatDate(currentUser.createdAt)} 
        />
        
        <ProfileCard 
          Icon={Cloud} 
          label="Plan d'abonnement" 
          value="Gratuit (10 GB)" 
        />
      </div>

      {/* Informations supplémentaires */}
      <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 mb-8">
        <h2 className="text-xl font-bold text-gray-100 mb-4 flex items-center">
          <Cloud className="w-6 h-6 mr-2 text-green-400" />
          Détails du compte
        </h2>
        <div className="space-y-3 text-gray-300">
          <div className="flex justify-between py-2 border-b border-gray-700">
            <span className="text-gray-400">ID Utilisateur:</span>
            <span className="font-mono text-sm text-gray-100">{currentUser.id || 'N/A'}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-700">
            <span className="text-gray-400">Statut:</span>
            <span className="text-green-400 font-semibold">✓ Actif</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-gray-400">Type de compte:</span>
            <span className="text-gray-100">Personnel</span>
          </div>
        </div>
      </div>

      {/* Bouton de déconnexion */}
      <div className="flex justify-center mt-10">
        <button
          onClick={handleLogout}
          className="flex items-center space-x-2 bg-red-600 text-white px-8 py-3 rounded-full text-lg font-semibold hover:bg-red-700 transition duration-150 shadow-lg transform hover:scale-105 active:scale-95"
        >
          <LogOut className="w-6 h-6" />
          <span>Déconnexion</span>
        </button>
      </div>
      
      {/* Note en bas */}
      <p className="text-center text-sm text-gray-500 mt-10 italic">
        * Les informations de date de création sont simulées pour cet exemple.
      </p>
    </div>
  );
}
