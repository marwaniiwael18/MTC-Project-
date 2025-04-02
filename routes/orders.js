const express = require("express");
const router = express.Router();
let orders = require("../data/orders");
const users = require("../data/users");
const plats = require("../data/plats");

// Obtenir toutes les commandes avec détails
router.get("/", (req, res) => {
    const detailedOrders = orders.map(order => {
        const user = users.find(u => u.id === order.userId);
        const plat = plats.find(p => p.id === order.platId);
        return {
            id: order.id,
            utilisateur: user.nom,
            tel: user.tel,
            plat: plat.nom,
            prix: plat.prix
        };
    });
    res.json(detailedOrders);
});

// Obtenir les commandes par ID utilisateur
router.get("/user/:userId", (req, res) => {
    const userOrders = orders.filter(o => o.userId == req.params.userId);
    res.json(userOrders);
});

// Obtenir la somme des prix des commandes d'un plat spécifique
router.get("/sum/:platId", (req, res) => {
    const total = orders
        .filter(o => o.platId == req.params.platId)
        .reduce((sum, order) => {
            const plat = plats.find(p => p.id === order.platId);
            return sum + plat.prix;
        }, 0);
    res.json({ total });
});

module.exports = router;
