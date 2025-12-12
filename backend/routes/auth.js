const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

// ✅ INSCRIPTION
router.post('/register', async (req, res) => {
  console.log('📝 Tentative d\'inscription:', req.body.email);
  
  try {
    const { username, email, password } = req.body;
    
    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({ message: "Tous les champs sont requis" });
    }

    // Vérifier si l'email existe déjà
    const userExists = await pool.query(
      "SELECT id FROM users WHERE email = $1", 
      [email]
    );
    
    if (userExists.rows.length > 0) {
      return res.status(409).json({ message: "Cet email est déjà utilisé" });
    }
    
    // Hasher le mot de passe
    const hashed = await bcrypt.hash(password, 10);
    
    // Créer l'utilisateur
    const result = await pool.query(
      "INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email",
      [username, email, hashed]
    );
    
    console.log('✅ Utilisateur créé:', result.rows[0].email);
    
    res.status(201).json({ 
      message: "Bienvenue dans le monde du hacker PFJ !",
      user: result.rows[0]
    });
    
  } catch (err) {
    console.error('❌ Erreur inscription:', err);
    res.status(500).json({ 
      message: "Erreur lors de l'inscription",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// ✅ CONNEXION
router.post('/login', async (req, res) => {
  console.log('🔐 Tentative de connexion:', req.body.email);
  
  try {
    const { email, password } = req.body;
    
    // Validation
    if (!email || !password) {
      return res.status(400).json({ message: "Email et mot de passe requis" });
    }

    // Chercher l'utilisateur
    const result = await pool.query(
      "SELECT * FROM users WHERE email = $1", 
      [email]
    );
    
    if (result.rows.length === 0) {
      return res.status(401).json({ message: "Email ou mot de passe incorrect" });
    }

    const user = result.rows[0];
    
    // Vérifier le mot de passe
    const valid = await bcrypt.compare(password, user.password);
    
    if (!valid) {
      return res.status(401).json({ message: "Email ou mot de passe incorrect" });
    }

    // Générer le token JWT
    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email }, 
      JWT_SECRET, 
      { expiresIn: '7d' }
    );
    
    console.log('✅ Connexion réussie:', user.email);
    
    res.json({ 
      token, 
      user: { 
        id: user.id, 
        username: user.username, 
        email: user.email 
      } 
    });
    
  } catch (err) {
    console.error('❌ Erreur connexion:', err);
    res.status(500).json({ 
      message: "Erreur lors de la connexion",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

module.exports = router;
