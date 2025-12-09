const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const { JWT_SECRET } = require('../config/env');

// Inscription
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  if(!username || !email || !password) return res.status(400).json({ message: "Champs manquants" });

  try{
    // ✅ Vérification si l'email existe déjà (409 Conflict)
    const userExists = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
    if (userExists.rows.length > 0) {
        return res.status(409).json({ message: "Cet email est déjà utilisé." });
    }
    
    const hashed = await bcrypt.hash(password, 10);
    const result = await pool.query(
      "INSERT INTO users (username, email, password) VALUES ($1,$2,$3) RETURNING id, username, email",
      [username, email, hashed]
    );
    
    // ✅ Message personnalisé pour le succès de l'inscription
    res.status(201).json({ 
        message: "bienvenu dans le monde du hacker pfj",
        user: result.rows[0]
    });
  } catch(err){
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// Login
router.post('/login', async (req,res) => {
  const { email, password } = req.body;
  if(!email || !password) return res.status(400).json({ message: "Champs manquants" });

  try{
    const result = await pool.query("SELECT * FROM users WHERE email=$1", [email]);
    // ✅ Utilisation du code 401 pour l'échec d'authentification
    if(result.rows.length === 0) return res.status(401).json({ message: "Email ou mot de passe incorrect" }); 

    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password);
    if(!valid) return res.status(401).json({ message: "Email ou mot de passe incorrect" });

    // ✅ Ajout du nom d'utilisateur dans le payload JWT et la réponse
    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '12h' });
    res.json({ token, user: { id: user.id, username: user.username, email: user.email } });
  } catch(err){
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

module.exports = router;
