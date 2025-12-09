require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors({ origin: process.env.FRONT_ORIGIN || "http://localhost:4200" }));

// Conexión a Mongo
const mongoUri = process.env.MONGO_URI;
const dbName = process.env.DB_NAME;
const collection = process.env.COLLECTION;

mongoose
  .connect(mongoUri, { dbName })
  .then(() => {
    console.log("✅ Conectado a MongoDB");
  })
  .catch((err) => {
    console.error("❌ Error al conectar a MongoDB:", err);
  });

// Modelo
const ResultSchema = new mongoose.Schema({
  player: { type: String },
  difficulty: { type: String },
  points: { type: Number },
});
const Result = mongoose.model("Result", ResultSchema, collection);

// Endpoint mostrar que funciona
app.get("/", async (req, res) => {
  return res.json({ message: "API FUNCIONANDO 🦾" });
});

// Endpoint para obtener los mejores resultados
app.get("/api/game/ranking", async (req, res) => {
  try {
    // Recuperar la categoría por la que queremos filtrar
    const { difficulty } = req.query;

    // Comprobamos que recuperamos el dato para filtrar
    if (!difficulty) return res.status(400).json({ message: "Falta la dificultad, asi que no se puede filtrar." });

    // Obtener los resultados 5 mejores ordenando de mayor a menor puntucacion
    const results = await Result.find({ difficulty }).sort({ points: -1 }).limit(5);
    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ message: "Error en el servidor", error: error.message });
  }
});

// Endpoint para registar el jugador y la puntuación que hizo
app.post("/api/game/save-result", async (req, res) => {
  try {
    // Recuperar nombre del jugador, dificultad y puntos obtenidos
    const { player, difficulty, points } = req.body;

    // Comprobar que recibimos los datos
    if (!player || !difficulty || points === undefined) return res.status(400).json({ message: "Faltan datos, no se puede registar la puntuación." });

    // Guardamos el resultado
    const saveResult = new Result({ player, difficulty, points });
    await saveResult.save();

    res.status(200).json({ message: "Puntuación guardada éxitosamente" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error en el servidor", error: error.message });
  }
});

// Arrancamos el servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`)
);
