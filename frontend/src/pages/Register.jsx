import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Cloud, Loader2, Sparkles, Zap } from "lucide-react";

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();
  const { register } = useAuth();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setLoading(true);
    
    try {
      const result = await register(username, email, password);
      
      // ✅ Afficher le message de bienvenue du backend
      setSuccessMessage(result.message || "Bienvenue dans le monde du hacker PFJ !");
      
      // Rediriger après 3 secondes
      setTimeout(() => {
        navigate("/", { state: { registered: true } });
      }, 3000);
      
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Erreur à l'inscription. Veuillez réessayer.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-950 relative overflow-hidden">
      
      {/* Animations de fond */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-96 h-96 bg-green-500 rounded-full blur-3xl opacity-10 animate-float" style={{ top: '10%', left: '10%' }}></div>
        <div className="absolute w-96 h-96 bg-blue-500 rounded-full blur-3xl opacity-10 animate-float" style={{ top: '60%', right: '10%', animationDelay: '2s' }}></div>
      </div>

      <div className="bg-gray-900 p-8 rounded-xl shadow-2xl w-full max-w-sm border border-gray-800 relative z-10 animate-scaleIn">
        
        <div className="flex flex-col items-center mb-6">
          <Cloud className="w-12 h-12 text-green-400 mb-2 animate-pulse" />
          <h1 className="text-3xl font-extrabold text-gray-100">MyDrive</h1>
          <p className="text-sm text-gray-400 mt-1">Créez votre compte gratuitement</p>
        </div>

        {/* ✅ MESSAGE DE SUCCÈS ANIMÉ */}
        {successMessage && (
          <div className="mb-6 p-4 bg-gradient-to-r from-green-600 to-green-700 rounded-lg animate-slideInDown border-2 border-green-400">
            <div className="flex items-center gap-3">
              <Sparkles className="w-6 h-6 text-yellow-300 animate-pulse" />
              <div>
                <p className="text-white font-bold text-lg">🎉 Félicitations !</p>
                <p className="text-gray-100 font-mono">{successMessage}</p>
              </div>
              <Zap className="w-6 h-6 text-yellow-300 animate-bounce" />
            </div>
          </div>
        )}

        <form onSubmit={handleRegister}>
          
          {error && (
            <div className="mb-4 p-3 text-sm text-red-400 bg-red-900/30 rounded-lg border border-red-800 animate-slideInDown" role="alert">
              {error}
            </div>
          )}

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="username">Nom d'utilisateur</label>
            <input
              id="username"
              type="text"
              placeholder="MonNom"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="bg-gray-800 border border-gray-700 text-gray-100 placeholder-gray-500 rounded-lg w-full p-3 focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-150"
              required
              disabled={loading || successMessage}
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="votre.email@exemple.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-gray-800 border border-gray-700 text-gray-100 placeholder-gray-500 rounded-lg w-full p-3 focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-150"
              required
              disabled={loading || successMessage}
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="password">Mot de passe</label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-gray-800 border border-gray-700 text-gray-100 placeholder-gray-500 rounded-lg w-full p-3 focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-150"
              required
              disabled={loading || successMessage}
            />
          </div>
          
          <button 
            className={`w-full py-3 rounded-lg font-semibold flex items-center justify-center transition-all duration-300 ${
              loading || successMessage
                ? 'bg-gray-700 cursor-not-allowed' 
                : 'bg-gradient-to-r from-green-500 to-green-600 text-gray-900 hover:from-green-400 hover:to-green-500 shadow-lg hover:shadow-green-500/50 transform hover:scale-105'
            }`}
            type="submit"
            disabled={loading || successMessage}
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Inscription...
              </>
            ) : successMessage ? (
              <>
                <Sparkles className="w-5 h-5 mr-2 animate-pulse" />
                Redirection...
              </>
            ) : (
              'S\'inscrire'
            )}
          </button>
        </form>

        <p className="text-sm mt-6 text-center text-gray-400">
          Déjà inscrit ?{" "}
          <Link to="/" className="text-green-400 hover:text-green-300 font-medium transition">
            Connectez-vous
          </Link>
        </p>
      </div>
    </div>
  );
}
