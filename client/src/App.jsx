import { useState, useEffect } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Cell
} from "recharts";

import "./App.css";

function App() {
  const [stock, setStock] = useState([]); // Datos para el gráfico
  const [analysis, setAnalysis] = useState(""); // Texto de la IA
  const [prompt, setPrompt] = useState(""); // Input del usuario
  const [loading, setLoading] = useState(false);

  // Carga inicial de datos (Gráfico)
  useEffect(() => {
    let mounted = true;
    const fetchStock = async () => {
      try {
        const res = await axios.get("http://localhost:4000/stock");
        if (mounted) setStock(res.data);
      } catch (error) {
        console.error("Error cargando stock:", error);
      }
    };
    fetchStock();
    return () => { mounted = false; };
  }, []);

  // Función para pedir análisis a Groq
  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!prompt) return;

    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:4000/analyze?prompt=${prompt}`);
      
      // Seteamos el análisis de la IA
      setAnalysis(res.data.analysis);
      
      // Opcional: Actualizamos el gráfico con los datos exactos que usó la IA
      if (res.data.currentData) {
        setStock(res.data.currentData);
      }
    } catch (error) {
      console.error("Error en el análisis:", error);
      setAnalysis("Error al conectar con el experto en stock.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">📊 AutoSync Dashboard</h1>

      {/* SECCIÓN DEL GRÁFICO */}
      <div className="bg-white p-4 rounded-xl shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">Stock actual por Producto</h2>
        <div style={{ width: "100%", height: 350 }}>
          <ResponsiveContainer>
            <BarChart data={stock} margin={{ top: 20, right: 30, left: 20, bottom: 50 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis 
                dataKey="product" 
                angle={-45} 
                textAnchor="end" 
                interval={0} 
                height={60}
              />
              <YAxis />
              <Tooltip cursor={{fill: 'transparent'}} />
              <Bar dataKey="amount" name="Cantidad">
                {stock.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.amount < 5 ? "#ef4444" : "#10b981"} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* SECCIÓN DE IA ANALYZER */}
      <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2  text-blue-600">
          🤖 Consultar IA
        </h2>
        
        <form onSubmit={handleAnalyze} className="flex gap-2 mb-4">
          <input 
            type="text" 
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ej: ¿Qué productos están por agotarse?"
            className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button 
            type="submit" 
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-blue-300"
          >
            {loading ? "Analizando..." : "Preguntar"}
          </button>
        </form>

        {analysis && (
          <div className="mt-4 p-4 bg-white border-l-4 border-blue-500 rounded shadow-sm">
            <p className="text-gray-800 whitespace-pre-wrap">{analysis}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;