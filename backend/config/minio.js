// backend/config/minio.js
const Minio = require("minio");

// Initialisation du client MinIO avec les variables d'environnement Render
const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT || "localhost",
  port: parseInt(process.env.MINIO_PORT || "9000"),
  useSSL: process.env.MINIO_USE_SSL === "true",
  accessKey: process.env.MINIO_ACCESS_KEY || "minioadmin",
  secretKey: process.env.MINIO_SECRET_KEY || "minioadmin",
});

// Vérifier la connexion et créer le bucket si nécessaire
async function initializeMinio() {
  const bucketName = process.env.MINIO_BUCKET || "mydrive";

  try {
    const exists = await minioClient.bucketExists(bucketName);
    if (!exists) {
      console.log(`MinIO: Le bucket '${bucketName}' n'existe pas. Création...`);
      await minioClient.makeBucket(bucketName, "us-east-1");
      console.log(`✅ Bucket '${bucketName}' créé avec succès.`);
    } else {
      console.log(`✅ Connexion MinIO réussie sur ${process.env.MINIO_ENDPOINT}:${process.env.MINIO_PORT}`);
    }
  } catch (err) {
    console.error(`\n❌ ERREUR FATALE - Connexion MinIO échouée sur ${process.env.MINIO_ENDPOINT}:${process.env.MINIO_PORT}!`);
    console.error("Détails de l'erreur:", err.message || err);
    console.error("\nVérifiez que les variables MINIO_* sont bien configurées dans Render.");
  }
}

// Initialisation asynchrone
initializeMinio();

module.exports = minioClient;

