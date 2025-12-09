import React, { useEffect, useState } from "react";
import api from "../services/api";

export default function FileGrid({ refresh }) {
  const [files, setFiles] = useState([]);

  const fetchFiles = async () => {
    const res = await api.get("/files");
    setFiles(res.data);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer ce fichier ?")) return;
    await api.delete(`/files/${id}`);
    fetchFiles();
  };

  useEffect(() => {
    fetchFiles();
  }, [refresh]);

  return (
    <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {files.map((f) => (
        <div
          key={f.id}
          className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition flex flex-col justify-between"
        >
          <div className="text-gray-700 font-medium truncate">{f.name}</div>
          <div className="mt-2 flex justify-between items-center text-sm text-gray-500">
            <span>{(f.size / 1024).toFixed(1)} KB</span>
            <div className="space-x-2">
              <button
                onClick={() =>
                  (window.location.href = `http://localhost:5000/api/files/download/${f.id}?token=${localStorage.getItem("token")}`)
                }
                className="text-primary hover:underline"
              >
                Télécharger
              </button>
              <button
                onClick={() => handleDelete(f.id)}
                className="text-red-600 hover:underline"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
