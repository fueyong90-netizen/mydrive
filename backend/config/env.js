require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 5000,
  JWT_SECRET: process.env.JWT_SECRET || "supersecretkey",
  DB: {
    USER: process.env.DB_USER || "postgres",
    PASSWORD: process.env.DB_PASSWORD || "postgres",
    HOST: process.env.DB_HOST || "localhost",
    PORT: process.env.DB_PORT || 5432,
    DATABASE: process.env.DB_DATABASE || "toopfj_db" // ✅ Renommage DB
  },
  MINIO: {
    ENDPOINT: process.env.MINIO_ENDPOINT || "localhost",
    PORT: parseInt(process.env.MINIO_PORT) || 9000,
    ACCESS_KEY: process.env.MINIO_ACCESS_KEY || "minioadmin",
    SECRET_KEY: process.env.MINIO_SECRET_KEY || "minioadmin",
    BUCKET: process.env.MINIO_BUCKET || "toolpfj-files" // ✅ Renommage Bucket
  },
  // ✅ Ajout de la configuration CLAMAV pour la centralisation
  CLAMAV: {
    HOST: process.env.CLAMD_HOST || '127.0.0.1',
    PORT: parseInt(process.env.CLAMD_PORT || '3310'),
    SOCKET: process.env.CLAMDSCAN_SOCKET || null,
  }
};
