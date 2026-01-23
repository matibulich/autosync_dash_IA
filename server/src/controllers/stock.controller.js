import { analyzeStock } from "../mcp/analyzer.js";
import { getRecentStock } from "../services/stock.service.js";

export async function getStockAnalysis(req, res) {
  try {
    const prompt = req.query.prompt;

    if (!prompt) {
      return res.status(400).json({
        error:
          "Falta el parámetro 'prompt'. Ejemplo: /analyze?prompt=Dame un resumen corto",
      });
    }

  const stock = await getRecentStock();

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
