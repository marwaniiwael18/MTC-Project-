const express = require("express");
const router = express.Router();
let users = require("../data/users");

// Obtenir tous les utilisateurs
router.get("/", (req, res) => {
    res.json(users);
});

// Rechercher un utilisateur par téléphone
router.get("/tel/:tel", (req, res) => {
    const user = users.find(u => u.tel == req.params.tel);
    user ? res.json(user) : res.status(404).send("Utilisateur non trouvé");
});

// Ajouter un utilisateur
router.post("/", (req, res) => {
    const { nom, tel } = req.body;
    const newUser = { id: users.length + 1, nom, tel };
    users.push(newUser);
    res.status(201).json(newUser);
});

// Supprimer un utilisateur par nom
router.delete("/:nom", (req, res) => {
    users = users.filter(u => u.nom !== req.params.nom);
    res.send("Utilisateur supprimé");
});

module.exports = router;
