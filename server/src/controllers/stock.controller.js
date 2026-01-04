import prisma from "../db.js";
import { analyzeStock } from "../mcp/analyzer.js";

export async function getStockAnalysis(req, res) {
  try {
    const prompt = req.query.prompt;

    if (!prompt) {
      return res.status(400).json({
        error:
          "Falta el parámetro 'prompt'. Ejemplo: /analyze?prompt=Dame un resumen corto",
      });
    }

    const stock = await prisma.stock.findMany({
      orderBy: { date: "desc" },
      take: 10,
    });

    const result = await analyzeStock(stock, prompt);

  res.json({
  analysis: result,
  currentData: stock // Enviamos también los datos que se analizaron
});
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al analizar stock" });
  }
}
