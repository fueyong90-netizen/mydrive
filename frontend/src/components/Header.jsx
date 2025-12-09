import React from "react";

export default function Header({ onLogout }) {
  return (
    <header className="flex justify-between items-center px-6 py-3 bg-white shadow-md border-b border-gray-200">
      <h1 className="text-2xl font-bold text-primary">MyDrive</h1>
      <button
        onClick={onLogout}
        className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-secondary transition"
      >
        Déconnexion
      </button>
    </header>
  );
}
