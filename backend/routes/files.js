const express = require('express');
const router = express.Router();
const multer = require('multer');
const crypto = require('crypto');
const authMiddleware = require('../middleware/authMiddleware');
const pool = require('../config/db');

// Configuration Multer : stockage en mémoire
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 } // 100 MB max
});

// Import MinIO (optionnel)
const minioConfig = require('../config/minio');

/**
 * =========================================
 * 1️⃣ UPLOAD DE FICHIER
 * =========================================
 */
router.post('/upload', authMiddleware, upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "Aucun fichier envoyé" });
  }
  
  const { title, description, content_type } = req.body;
  const fileName = `${Date.now()}-${req.file.originalname}`;
  
  try {
    // Si MinIO est disponible, uploader le fichier
    if (minioConfig.isEnabled() && minioConfig.client) {
      await new Promise((resolve, reject) => {
        minioConfig.client.putObject(
          minioConfig.bucket, 
          fileName, 
          req.file.buffer, 
          (err) => {
            if (err) reject(err);
            else resolve();
          }
        );
      });
      
      console.log('✅ Fichier uploadé sur MinIO:', fileName);
    } else {
      console.warn('⚠️  MinIO indisponible - Métadonnées enregistrées sans fichier physique');
    }
    
    // Enregistrer les métadonnées dans la DB
    await pool.query(
      "INSERT INTO files (user_id, name, size, key, mime_type, title, description, content_type) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",
      [
        req.user.id, 
        req.file.originalname, 
        req.file.size, 
        fileName,
        req.file.mimetype,
        title || req.file.originalname,
        description || '',
        content_type || 'FILE'
      ]
    );
    
    res.json({ 
      message: "Fichier uploadé avec succès",
      warning: !minioConfig.isEnabled() ? "Stockage physique indisponible - Métadonnées uniquement" : undefined
    });
    
  } catch (err) {
    console.error("❌ Erreur upload:", err);
    res.status(500).json({ 
      message: "Erreur lors de l'upload",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

/**
 * =========================================
 * 2️⃣ LISTE DES FICHIERS
 * =========================================
 */
router.get('/', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, title, name, size, mime_type, content_type, is_public, public_key, created_at FROM files WHERE user_id = $1 ORDER BY created_at DESC",
      [req.user.id]
    );
    
    const files = result.rows.map(file => ({
      id: file.id,
      name: file.title || file.name,
      size: file.size,
      mimetype: file.mime_type,
      uploaded_at: file.created_at,
      content_type: file.content_type,
      is_public: file.is_public,
      public_key: file.public_key
    }));
    
    res.json(files);
  } catch (err) {
    console.error("❌ Erreur liste fichiers:", err);
    res.status(500).json({ 
      message: "Erreur serveur",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

/**
 * =========================================
 * 3️⃣ TÉLÉCHARGEMENT D'UN FICHIER
 * =========================================
 */
router.get('/download/:id', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT name, key, mime_type FROM files WHERE id = $1 AND user_id = $2",
      [req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Fichier introuvable" });
    }

    const file = result.rows[0];
    
    // Vérifier si MinIO est disponible
    if (!minioConfig.isEnabled() || !minioConfig.client) {
      return res.status(503).json({ 
        message: "Stockage de fichiers indisponible",
        hint: "Configurez MinIO ou un service de stockage cloud"
      });
    }

    minioConfig.client.getObject(minioConfig.bucket, file.key, (err, stream) => {
      if (err) {
        console.error("❌ Erreur téléchargement MinIO:", err);
        return res.status(500).json({ message: "Erreur téléchargement" });
      }

      res.setHeader("Content-Disposition", `attachment; filename="${file.name}"`);
      res.setHeader("Content-Type", file.mime_type); 
      stream.pipe(res);
    });
  } catch (err) {
    console.error("❌ Erreur:", err);
    res.status(500).json({ 
      message: "Erreur serveur",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

/**
 * =========================================
 * 4️⃣ SUPPRESSION D'UN FICHIER
 * =========================================
 */
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM files WHERE id = $1 AND user_id = $2",
      [req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Fichier introuvable" });
    }

    const file = result.rows[0];

    // Supprimer de MinIO si disponible
    if (minioConfig.isEnabled() && minioConfig.client) {
      await new Promise((resolve, reject) => {
        minioConfig.client.removeObject(minioConfig.bucket, file.key, (err) => {
          if (err) {
            console.warn("⚠️  Erreur suppression MinIO:", err.message);
          }
          resolve(); // Continue même si erreur MinIO
        });
      });
    }

    // Supprimer de la DB
    await pool.query("DELETE FROM files WHERE id = $1", [req.params.id]);
    
    res.json({ message: "Fichier supprimé avec succès" });

  } catch (err) {
    console.error("❌ Erreur:", err);
    res.status(500).json({ 
      message: "Erreur serveur",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

module.exports = router;
