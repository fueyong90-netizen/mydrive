import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LogOut, User, Cloud, Home, FolderOpen, Smartphone, Video, Music } from "lucide-react";

export default function Navbar() {
  const { currentUser, logout } = useAuth();
  const location = useLocation();
  
  // N'affiche pas la Navbar sur les pages Auth
  const isAuthPage = location.pathname === '/' || location.pathname === '/register';
  if (isAuthPage) return null;

  const navLinks = [
    { path: '/dashboard', label: 'Accueil', icon: Home },
    { path: '/files', label: 'Fichiers', icon: FolderOpen },
    { path: '/apps', label: 'Mes Apps', icon: Smartphone },
    { path: '/videos', label: 'Vidéos', icon: Video },
    { path: '/music', label: 'Musique', icon: Music },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-gray-900 shadow-lg sticky top-0 z-10 hidden sm:block border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          
          {/* Logo/Title */}
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center space-x-2 text-2xl font-bold text-green-400 hover:text-green-300 transition">
              <Cloud className="w-7 h-7" />
              <span>MyDrive</span>
            </Link>
          </div>

          {/* Navigation Items (Desktop) */}
          <div className="flex items-center space-x-1">
            {navLinks.map(link => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition duration-150 ${
                    isActive(link.path)
                      ? 'bg-green-500 text-gray-900'
                      : 'text-gray-300 hover:text-green-400 hover:bg-gray-800'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Profile and Logout */}
          <div className="flex items-center space-x-3">
            <Link
              to="/profile"
              className={`flex items-center space-x-2 text-sm font-medium px-3 py-2 rounded-lg transition duration-150 ${
                isActive('/profile')
                  ? 'bg-green-500 text-gray-900'
                  : 'text-gray-300 hover:text-green-400 hover:bg-gray-800'
              }`}
              title="Profil"
            >
              <User className="w-5 h-5" />
              <span className="hidden md:inline">{currentUser?.username || 'Mon Compte'}</span>
            </Link>

            <button
              onClick={logout}
              className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition duration-150 shadow-md"
              title="Déconnexion"
            >
              <LogOut className="w-5 h-5" />
              <span className="hidden md:inline">Déconnexion</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
