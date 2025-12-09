import React, { useState } from "react";
import api from "../services/api";

export default function FileUploader({ onUpload }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!file) return alert("Choisissez un fichier !");
    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      await api.post("/files/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("Fichier uploadé !");
      setFile(null);
      onUpload();
    } catch (err) {
      alert("Erreur lors de l’upload");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 flex items-center space-x-4">
      <input
        type="file"
        onChange={(e) => setFile(e.target.files[0])}
        className="border rounded p-2"
      />
      <button
        onClick={handleUpload}
        disabled={loading}
        className="bg-primary text-white px-4 py-2 rounded hover:bg-secondary transition"
      >
        {loading ? "Upload..." : "Uploader"}
      </button>
    </div>
  );
}
