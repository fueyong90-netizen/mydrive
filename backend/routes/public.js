// backend/routes/public.js

const router = require('express').Router();
const pool = require('../config/db');
const minioClient = require('../config/minio');
const { MINIO } = require('../config/env');

/**
 * =========================================
 * TÉLÉCHARGEMENT PUBLIC PAR PUBLIC_KEY
 * =========================================
 */
router.get('/download/:publicKey', async (req, res) => {
    try {
        // 1. Rechercher le contenu par sa clé publique
        const result = await pool.query(
            "SELECT name, key, mime_type, content_type FROM files WHERE public_key = $1 AND is_public = TRUE",
            [req.params.publicKey]
        );

        if (result.rows.length === 0)
            return res.status(404).json({ message: "Contenu non trouvé ou non public" });

        const file = result.rows[0];

        // 2. Récupérer le fichier de MinIO
        minioClient.getObject(MINIO.BUCKET, file.key, (err, stream) => {
            if (err) {
                console.error("Erreur téléchargement MinIO:", err);
                return res.status(500).json({ message: "Erreur serveur de stockage" });
            }

            // Définir le type de contenu
            res.setHeader("Content-Type", file.mime_type);
            
            // Pour les APPLICATIONS ou FICHIERS, forcer le téléchargement (Play Store / Vidmate)
            if (file.content_type === 'APPLICATION' || file.content_type === 'FILE') {
                // Force le navigateur à télécharger le fichier
                res.setHeader("Content-Disposition", `attachment; filename="${file.name}"`);
            } else {
                // Pour les VIDÉOS (YouTube), permettre le streaming direct dans le navigateur
                // Content-Disposition est omis, ou défini sur 'inline' (par défaut si omis)
            }
            
            // Streamer le fichier vers le client
            stream.pipe(res);
        });
    } catch (err) {
        console.error("Erreur lors du téléchargement public:", err);
        res.status(500).json({ message: "Erreur serveur" });
    }
});

module.exports = router;
