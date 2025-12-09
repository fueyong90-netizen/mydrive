// backend/routes/files.js

const express = require('express');
const router = express.Router();
const multer = require('multer');
const crypto = require('crypto');
const authMiddleware = require('../middleware/authMiddleware');
// const virusScanner = require('../middleware/virusScanner'); // ❌ DÉSACTIVÉ
const minioClient = require('../config/minio');
const { MINIO } = require('../config/env');
const pool = require('../config/db');

// Configuration Multer : stockage en mémoire
const upload = multer({ storage: multer.memoryStorage() });

/**
 * =========================================
 * 1️⃣ UPLOAD DE FICHIER (SANS scan antivirus)
 * =========================================
 */
router.post('/upload', authMiddleware, upload.single('file'), async (req, res) => {
  // ✅ Retiré virusScanner du middleware
  
  if (!req.file) return res.status(400).json({ message: "Aucun fichier envoyé" });
  
  const { title, description, content_type } = req.body;
  
  const fileName = `${Date.now()}-${req.file.originalname}`;
  
  minioClient.putObject(MINIO.BUCKET, fileName, req.file.buffer, async (err) => {
    if (err) {
      console.error("MinIO putObject error:", err);
      return res.status(500).json({ message: "Erreur upload" });
    }

    try {
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
      res.json({ message: "Contenu uploadé avec succès" });
    } catch (err) {
      console.error("Erreur DB après upload:", err);
      minioClient.removeObject(MINIO.BUCKET, fileName, (removeErr) => {
        if (removeErr) console.error("Erreur cleanup MinIO:", removeErr);
      });
      res.status(500).json({ message: "Erreur enregistrement DB" });
    }
  });
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
    console.error("Erreur liste fichiers:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

/**
 * =========================================
 * 3️⃣ TÉLÉCHARGEMENT D'UN FICHIER (Privé)
 * =========================================
 */
router.get('/download/:id', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT name, key, mime_type FROM files WHERE id = $1 AND user_id = $2",
      [req.params.id, req.user.id]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ message: "Fichier introuvable" });

    const file = result.rows[0];
    minioClient.getObject(MINIO.BUCKET, file.key, (err, stream) => {
      if (err) {
        console.error("Erreur téléchargement MinIO:", err);
        return res.status(500).json({ message: "Erreur téléchargement" });
      }

      res.setHeader("Content-Disposition", `attachment; filename="${file.name}"`);
      res.setHeader("Content-Type", file.mime_type); 
      stream.pipe(res);
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
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

    if (result.rows.length === 0)
      return res.status(404).json({ message: "Fichier introuvable" });

    const file = result.rows[0];

    minioClient.removeObject(MINIO.BUCKET, file.key, async (err) => {
      if (err) {
        console.error("Erreur suppression MinIO:", err);
        return res.status(500).json({ message: "Erreur suppression" });
      }

      await pool.query("DELETE FROM files WHERE id = $1", [req.params.id]);
      res.json({ message: "Fichier supprimé avec succès" });
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

/**
 * =========================================
 * 5️⃣ GÉNÉRER ET ACTIVER LE PARTAGE PUBLIC
 * =========================================
 */
router.post('/share/:id', authMiddleware, async (req, res) => {
    try {
        const fileId = req.params.id;
        const userId = req.user.id;
        
        const fileResult = await pool.query(
            "SELECT public_key FROM files WHERE id = $1 AND user_id = $2",
            [fileId, userId]
        );

        if (fileResult.rows.length === 0)
            return res.status(404).json({ message: "Fichier introuvable ou non autorisé" });

        let publicKey = fileResult.rows[0].public_key;
        if (!publicKey) {
            publicKey = crypto.randomBytes(8).toString('hex');
        }

        await pool.query(
            "UPDATE files SET is_public = TRUE, public_key = $1 WHERE id = $2 AND user_id = $3",
            [publicKey, fileId, userId]
        );

        res.json({ 
            message: "Partage activé", 
            publicKey: publicKey,
            publicUrl: `/api/public/download/${publicKey}`
        });
        
    } catch (err) {
        if (err.code === '23505') { 
             return res.status(409).json({ message: "Erreur de clé unique, veuillez réessayer" });
        }
        console.error("Erreur partage de fichier:", err);
        res.status(500).json({ message: "Erreur serveur lors de l'activation du partage" });
    }
});

module.exports = router;
