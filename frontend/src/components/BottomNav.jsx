import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, FolderOpen, Smartphone, Video, Music, User } from "lucide-react";

const navItems = [
  { path: "/dashboard", label: "Accueil", icon: Home },
  { path: "/files", label: "Fichiers", icon: FolderOpen },
  { path: "/apps", label: "Apps", icon: Smartphone },
  { path: "/videos", label: "Vidéos", icon: Video },
  { path: "/music", label: "Musique", icon: Music },
  { path: "/profile", label: "Profil", icon: User },
];

export default function BottomNav() {
  const location = useLocation();

  // N'affiche la barre qu'après l'authentification
  const isAuthPage = location.pathname === '/' || location.pathname === '/register';
  if (isAuthPage) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 shadow-2xl sm:hidden z-20">
      <div className="flex justify-around items-center h-16 px-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center p-2 transition-colors duration-200 ${
                isActive ? 'text-green-400' : 'text-gray-400 hover:text-green-400'
              }`}
            >
              <Icon className="w-6 h-6" />
              <span className="text-xs mt-1">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
