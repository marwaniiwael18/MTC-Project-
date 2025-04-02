const express = require("express");
const cors = require("express");
const path = require("path");

const app = express();
const port = 3000;

// Middleware pour parser le JSON
app.use(express.json());
// Enable CORS for frontend
app.use(cors());
// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Importer les routes
const platsRoutes = require("./routes/plats");
const usersRoutes = require("./routes/users");
const ordersRoutes = require("./routes/orders");

app.use("/plats", platsRoutes);
app.use("/users", usersRoutes);
app.use("/orders", ordersRoutes);

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
    console.log(`Serveur démarré sur http://localhost:${port}`);
});
