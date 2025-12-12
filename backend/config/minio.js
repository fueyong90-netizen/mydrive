const Minio = require('minio');

let minioClient = null;
let isMinioEnabled = false;

// Vérifier si MinIO est configuré ET si on n'est pas en production sans MinIO
const MINIO_ENDPOINT = process.env.MINIO_ENDPOINT;
const MINIO_PORT = process.env.MINIO_PORT;
const MINIO_ACCESS_KEY = process.env.MINIO_ACCESS_KEY;
const MINIO_SECRET_KEY = process.env.MINIO_SECRET_KEY;
const MINIO_BUCKET = process.env.MINIO_BUCKET || 'files';

// En production, MinIO est OPTIONNEL
if (MINIO_ENDPOINT && MINIO_ACCESS_KEY && MINIO_SECRET_KEY) {
  try {
    minioClient = new Minio.Client({
      endPoint: MINIO_ENDPOINT,
      port: parseInt(MINIO_PORT) || 9000,
      useSSL: process.env.MINIO_USE_SSL === 'true',
      accessKey: MINIO_ACCESS_KEY,
      secretKey: MINIO_SECRET_KEY
    });

    // Tester la connexion
    minioClient.listBuckets((err) => {
      if (err) {
        console.warn('⚠️  MinIO: Connexion échouée, mode SANS stockage activé');
        console.warn('Détails:', err.message);
        minioClient = null;
        isMinioEnabled = false;
      } else {
        console.log('✅ MinIO: Connexion établie');
        isMinioEnabled = true;
        
        // Vérifier/créer le bucket
        minioClient.bucketExists(MINIO_BUCKET, (err, exists) => {
          if (err) {
            console.warn(`⚠️  MinIO: Erreur vérification bucket`);
          } else if (!exists) {
            minioClient.makeBucket(MINIO_BUCKET, 'us-east-1', (err) => {
              if (err) {
                console.warn(`⚠️  MinIO: Impossible de créer le bucket`);
              } else {
                console.log(`✅ MinIO: Bucket '${MINIO_BUCKET}' créé`);
              }
            });
          } else {
            console.log(`✅ MinIO: Le bucket '${MINIO_BUCKET}' existe`);
          }
        });
      }
    });
  } catch (error) {
    console.warn('⚠️  MinIO: Configuration invalide, mode SANS stockage');
    console.warn('Détails:', error.message);
    minioClient = null;
    isMinioEnabled = false;
  }
} else {
  console.warn('⚠️  MinIO: Variables d\'environnement manquantes');
  console.warn('📁 Mode SANS stockage de fichiers activé (métadonnées uniquement)');
  isMinioEnabled = false;
}

module.exports = {
  client: minioClient,
  isEnabled: () => isMinioEnabled,
  bucket: MINIO_BUCKET
};
