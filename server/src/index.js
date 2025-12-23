import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import prisma from "./db.js"; // ← usa una única instancia
import { getStockAnalysis } from "./controllers/stock.controller.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Obtener todo el stock
app.get("/stock", async (req, res) => {
  try {
    const stock = await prisma.sale.findMany({
      orderBy: { date: "desc" },
    });
    res.json(stock);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener stock" });
  }
});

// Crear un stock
app.post("/stock", async (req, res) => {
  try {
    const { product, amount, price } = req.body;

    if (!product || !amount || !price) {
      return res.status(400).json({ error: "Faltan datos" });
    }

    const sale = await prisma.sale.create({
      data: { product, amount, price },
    });

    res.json(sale);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al crear stock" });
  }
});

// Ruta de análisis con IA
app.get("/analyze", getStockAnalysis);

// Iniciar servidor
app.listen(4000, () => {
  console.log("Server running on http://localhost:4000");
});
