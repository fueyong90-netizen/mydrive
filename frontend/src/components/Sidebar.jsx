import React from "react";

export default function Sidebar() {
  return (
    <aside className="w-64 bg-white h-screen shadow-md border-r border-gray-200 flex flex-col">
      <div className="p-6 text-xl font-bold text-primary">Espace Fichiers</div>
      <nav className="flex-1 px-4 space-y-2">
        <div className="text-gray-700 hover:text-primary cursor-pointer p-2 rounded hover:bg-gray-100 transition">
          Mes fichiers
        </div>
        <div className="text-gray-700 hover:text-primary cursor-pointer p-2 rounded hover:bg-gray-100 transition">
          Partagés
        </div>
        <div className="text-gray-700 hover:text-primary cursor-pointer p-2 rounded hover:bg-gray-100 transition">
          Corbeille
        </div>
      </nav>
      <div className="p-4 text-xs text-gray-500 text-center border-t">
        © 2025 MyDrive
      </div>
    </aside>
  );
}
