// backend/config/minio.js
const Minio = require('minio');
const { MINIO } = require('./env');

// Initialisation du client MinIO
const minioClient = new Minio.Client({
  endPoint: MINIO.ENDPOINT,
  port: MINIO.PORT,
  useSSL: false, // Assurez-vous que c'est bien 'false' si vous n'utilisez pas HTTPS
  accessKey: MINIO.ACCESS_KEY,
  secretKey: MINIO.SECRET_KEY,
});

// Vérifier la connexion et créer le bucket si nécessaire
async function initializeMinio() {
  try {
    const bucketExists = await minioClient.bucketExists(MINIO.BUCKET);
    if (!bucketExists) {
      console.log(`MinIO: Le bucket '${MINIO.BUCKET}' n'existe pas. Création...`);
      await minioClient.makeBucket(MINIO.BUCKET, 'us-east-1');
      console.log(`MinIO: Bucket '${MINIO.BUCKET}' créé avec succès.`);
    } else {
      console.log(`MinIO: Connexion établie. Le bucket '${MINIO.BUCKET}' existe.`);
    }
  } catch (err) {
    // Ceci est l'endroit où l'erreur ECONNREFUSED se produit typiquement.
    console.error(`\n❌ ERREUR FATALE - Connexion MinIO échouée sur ${MINIO.ENDPOINT}:${MINIO.PORT}!`);
    console.error("Détails de l'erreur:", err.message || err);
    console.error("\nVérifiez que le service MinIO est bien lancé et accessible à cette adresse.");
    console.error("Si vous utilisez Docker Compose, assurez-vous d'exécuter 'docker-compose up -d minio'.");
    // Ne pas quitter, mais logguer l'erreur, car le serveur principal écoute déjà (port 5000)
  }
}

// Lancer l'initialisation asynchrone (non-bloquante)
initializeMinio();

module.exports = minioClient;
