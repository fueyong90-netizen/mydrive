import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import FilesPage from "./pages/FilesPage";
import AppsPage from "./pages/AppsPage";
import VideosPage from "./pages/VideosPage";
import MusicPage from "./pages/MusicPage";
import Profile from "./pages/Profile";
import Navbar from "./components/Navbar";
import BottomNav from "./components/BottomNav";

// Composant wrapper pour les routes privées
function ProtectedRoute({ element }) {
  const { currentUser, loading } = useAuth();
  
  if (loading) {
    return <div className="flex items-center justify-center h-screen text-lg text-gray-300">Chargement...</div>;
  }
  
  return currentUser ? element : <Navigate to="/" />;
}

// Composant pour les routes Auth (empêche l'accès si déjà connecté)
function AuthRoute({ element }) {
  const { currentUser, loading } = useAuth();
  
  if (loading) {
    return <div className="flex items-center justify-center h-screen text-lg text-gray-300">Chargement...</div>;
  }
  
  return currentUser ? <Navigate to="/dashboard" /> : element;
}

function AppContent() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-950">
      <Navbar />
      <main className="flex-grow p-4 sm:p-6 pb-20 sm:pb-4 max-w-7xl mx-auto w-full">
        <Routes>
          {/* Routes d'authentification */}
          <Route path="/" element={<AuthRoute element={<Login />} />} />
          <Route path="/register" element={<AuthRoute element={<Register />} />} />
          
          {/* Routes protégées */}
          <Route path="/dashboard" element={<ProtectedRoute element={<Dashboard />} />} />
          <Route path="/files" element={<ProtectedRoute element={<FilesPage />} />} />
          <Route path="/apps" element={<ProtectedRoute element={<AppsPage />} />} />
          <Route path="/videos" element={<ProtectedRoute element={<VideosPage />} />} />
          <Route path="/music" element={<ProtectedRoute element={<MusicPage />} />} />
          <Route path="/profile" element={<ProtectedRoute element={<Profile />} />} />

          {/* Fallback pour les chemins inconnus */}
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </main>
      <BottomNav />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}
