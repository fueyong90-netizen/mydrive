import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
// Importez l'AuthProvider
import { AuthProvider } from "./context/AuthContext"; 

ReactDOM.createRoot(document.getElementById("root")).render(
    // ✅ AuthProvider doit être ici
    <AuthProvider> 
        <App />
    </AuthProvider>
);
