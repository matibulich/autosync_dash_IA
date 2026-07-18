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


router.delete("/stock", async (req, res) => {
  try {
    const result = await prisma.stock.deleteMany();
    res.json({ deleted: result.count });
  } catch (err) {
    console.error("DELETE /stock error:", err);
    res.status(500).json({ error: "Error al limpiar inventario" });
  }
});

router.post("/stock/:id/reduce", async (req, res) => {
  const id = Number(req.params.id);
  const { amount } = req.body;

  if (isNaN(id)) {
    return res.status(400).json({ error: "ID inválido" });
  }

  if (amount === undefined || amount <= 0) {
    return res.status(400).json({ error: "Cantidad a eliminar inválida" });
  }

  try {
    const item = await prisma.stock.findUnique({ where: { id } });

    if (!item) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    const newAmount = Math.max(0, Math.round((item.amount - amount) * 100) / 100);

    if (newAmount <= 0) {
      await prisma.stock.delete({ where: { id } });
      return res.json({ deleted: true, product: item.product });
    }

    const updated = await prisma.stock.update({
      where: { id },
      data: { amount: newAmount },
    });

    res.json(updated);
  } catch (err) {
    console.error("POST /stock/:id/reduce error:", err);
    res.status(500).json({ error: "Error al reducir stock" });
  }
});

router.get("/analyze", getStockAnalysis);

export default router;
