import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Cloud, Loader2, Sparkles, Zap } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  // Récupérer le message de l'inscription
  const registered = location.state?.registered;

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Erreur de connexion. Vérifiez vos identifiants.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-950 relative overflow-hidden">
      
      {/* Animations de fond */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-96 h-96 bg-green-500 rounded-full blur-3xl opacity-10 animate-float" style={{ top: '20%', left: '10%' }}></div>
        <div className="absolute w-96 h-96 bg-blue-500 rounded-full blur-3xl opacity-10 animate-float" style={{ bottom: '20%', right: '10%', animationDelay: '2s' }}></div>
      </div>

      <div className="bg-gray-900 p-8 rounded-xl shadow-2xl w-full max-w-sm border border-gray-800 relative z-10 animate-scaleIn">
        
        <div className="flex flex-col items-center mb-6">
          <div className="relative">
            <Cloud className="w-12 h-12 text-green-400 mb-2 animate-pulse" />
            <Sparkles className="w-5 h-5 text-yellow-300 absolute -top-1 -right-1 animate-pulse" />
          </div>
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500 animate-gradient">
            MyDrive
          </h1>
          <p className="text-sm text-gray-400 mt-1">Connectez-vous pour accéder à vos fichiers</p>
        </div>

        {/* Message de succès après inscription */}
        {registered && (
          <div className="mb-4 p-4 bg-gradient-to-r from-green-600 to-green-700 rounded-lg animate-slideInDown border-2 border-green-400">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-300 animate-bounce" />
              <p className="text-white font-bold">Compte créé ! Connectez-vous maintenant 🚀</p>
            </div>
          </div>
        )}

        <form onSubmit={handleLogin}>
          
          {error && (
            <div className="mb-4 p-3 text-sm text-red-400 bg-red-900/30 rounded-lg border border-red-800 animate-slideInDown" role="alert">
              {error}
            </div>
          )}

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="votre.email@exemple.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-gray-800 border border-gray-700 text-gray-100 placeholder-gray-500 rounded-lg w-full p-3 focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-150 hover:border-green-500"
              required
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
              className="bg-gray-800 border border-gray-700 text-gray-100 placeholder-gray-500 rounded-lg w-full p-3 focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-150 hover:border-green-500"
              required
            />
          </div>
          
          <button 
            className={`w-full py-3 rounded-lg font-semibold flex items-center justify-center transition-all duration-300 ${
              loading 
                ? 'bg-gray-700 cursor-not-allowed' 
                : 'bg-gradient-to-r from-green-500 to-green-600 text-gray-900 hover:from-green-400 hover:to-green-500 shadow-lg hover:shadow-green-500/50 transform hover:scale-105'
            }`}
            type="submit"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Connexion...
              </>
            ) : (
              <>
                <Zap className="w-5 h-5 mr-2" />
                Se connecter
              </>
            )}
          </button>
        </form>

        <p className="text-sm mt-6 text-center text-gray-400">
          Pas encore de compte ?{" "}
          <Link to="/register" className="text-green-400 hover:text-green-300 font-medium transition">
            S'inscrire
          </Link>
        </p>

        <div className="mt-6 pt-6 border-t border-gray-800 text-center">
          <p className="text-xs text-gray-500">
            🔒 Connexion sécurisée • 🚀 Cloud personnel
          </p>
        </div>
      </div>
    </div>
  );
}
