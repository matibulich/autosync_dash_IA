import { Router } from "express";
import prisma from "../db.js";
import { getStockAnalysis } from "../controllers/stock.controller.js";



const router = Router();


router.get("/stock", async (req, res) => {
  try {
    const stock = await prisma.stock.findMany({
      orderBy: { date: "desc" },
    });
    res.json(stock);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener stock" });
  }
});

router.post("/stock", async (req, res) => {
  try {
    const { product, amount, price } = req.body;

    if (!product || amount===undefined) {
      return res.status(400).json({ error: "Faltan datos" });
    }

    const stock = await prisma.stock.create({
      data: { product, amount, price },
    });

    res.json(stock);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al crear stock" });
  }
});

router.delete("/stock/:id", async (req, res) => {
     const { id } = req.params;
    try {
      const deletedStock = await prisma.stock.deleteMany({ where: {id} });
      res.json(deletedStock);
    } catch (error) {
      res.status(404).json({ error: "Producto no encontrado" });
    }})
    
router.get("/analyze", getStockAnalysis);

export default router;