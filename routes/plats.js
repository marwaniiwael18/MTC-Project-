const express = require("express");
const router = express.Router();
let plats = require("../data/plats");

// Obtenir tous les plats
router.get("/", (req, res) => {
    res.json(plats);
});

// Obtenir un plat par ID
router.get("/:id", (req, res) => {
    const plat = plats.find(p => p.id == req.params.id);
    plat ? res.json(plat) : res.status(404).send("Plat non trouvé");
});

// Ajouter un plat
router.post("/", (req, res) => {
    const { nom, prix } = req.body;
    const newPlat = { id: plats.length + 1, nom, prix };
    plats.push(newPlat);
    res.status(201).json(newPlat);
});

// Modifier le prix d'un plat
router.put("/:id", (req, res) => {
    const plat = plats.find(p => p.id == req.params.id);
    if (plat) {
        plat.prix = req.body.prix;
        res.json(plat);
    } else {
        res.status(404).send("Plat non trouvé");
    }
});

// Supprimer un plat par ID
router.delete("/:id", (req, res) => {
    plats = plats.filter(p => p.id != req.params.id);
    res.send("Plat supprimé");
});

module.exports = router;
