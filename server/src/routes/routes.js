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
  const { product, amount, price } = req.body;

  if (!product || amount === undefined) {
    return res.status(400).json({ error: "Faltan datos" });
  }

  const stock = await prisma.stock.upsert({
    where: { product },
    update: {
      amount: { increment: Number(amount) },
      price
    },
    create: {
      product,
      amount: Number(amount),
      price
    }
  });

  res.json(stock);
});


router.get("/analyze", getStockAnalysis);

export default router;
