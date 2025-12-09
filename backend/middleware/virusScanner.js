// backend/middleware/virusScanner.js
const fs = require('fs').promises;
const path = require('path');
const os = require('os');
const crypto = require('crypto');
const NodeClam = require('clamscan');

let clamscanInstancePromise = null;

// initialise l'instance clamscan (retourne une Promise)
// options : on privilégie clamd (daemon) via TCP/socket, fallback possible
function getClamScan() {
  if (!clamscanInstancePromise) {
    clamscanInstancePromise = new NodeClam().init({
      removeInfected: false,
      debugMode: false,
      scanRecursively: false,
      clamdscan: {
        socket: process.env.CLAMDSCAN_SOCKET || null,
        host: process.env.CLAMD_HOST || '127.0.0.1',
        port: parseInt(process.env.CLAMD_PORT || '3310'),
        timeout: 60000,
        localFallback: true,
        path: null,
        configFile: null,
      },
      preference: 'clamdscan'
    });
  }
  return clamscanInstancePromise;
}

// middleware: suppose multer a mis le fichier dans req.file
// si multer.memoryStorage(), req.file.buffer existe
module.exports = async function virusScanner(req, res, next) {
  try {
    if (!req.file) return next();

    // 1) si le fichier est déjà sur le disque (multer.diskStorage), on peut scanner directement
    if (req.file.path) {
      const clamscan = await getClamScan();
      const result = await clamscan.isInfected(req.file.path);
      if (result.isInfected) {
        // supprimer le fichier si souhaité
        try { await fs.unlink(req.file.path); } catch(e){}
        return res.status(400).json({ message: "Fichier infecté détecté", viruses: result.viruses || [] });
      }
      return next();
    }

    // 2) si multer.memoryStorage (buffer), écrire un fichier temporaire, scanner, puis supprimer
    if (req.file.buffer) {
      const tmpDir = os.tmpdir();
      const tmpName = `upload-${Date.now()}-${crypto.randomBytes(6).toString('hex')}`;
      const tmpPath = path.join(tmpDir, tmpName);

      await fs.writeFile(tmpPath, req.file.buffer);

      const clamscan = await getClamScan();
      const result = await clamscan.isInfected(tmpPath);

      // supprimer le temporaire
      try { await fs.unlink(tmpPath); } catch (e) {}

      if (result.isInfected) {
        return res.status(400).json({ message: "Fichier infecté détecté", viruses: result.viruses || [] });
      }
      return next();
    }

    // si pas de buffer ni path, rien à scanner
    return next();
  } catch (err) {
    console.error("virusScanner error:", err);
    return res.status(500).json({ message: "Erreur lors du scan antivirus", error: err.message || err });
  }
};
