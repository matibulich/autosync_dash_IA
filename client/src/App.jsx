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
  Cell,
} from "recharts";
import StockForm from "./StockForm";
import "./App.css";

function App() {
  const [stock, setStock] = useState([]); 
  const [analysis, setAnalysis] = useState(""); 
  const [prompt, setPrompt] = useState(""); 
  const [loading, setLoading] = useState(false);

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

  const handleCreateProduct = async (nuevoProducto) => {
    try {
      const res = await axios.post("http://localhost:4000/stock", nuevoProducto);
      setStock((prevStock) => [...prevStock, res.data]);
    } catch (error) {
      console.error("Error creando producto:", error);
    }
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!prompt) return;
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:4000/analyze?prompt=${prompt}`);
      setAnalysis(res.data.analysis);
    } catch (error) {
      console.error("Error en el análisis:", error);
      setAnalysis("Error al conectar con el experto en stock.");
    } finally {
      setLoading(false);
    }
  };



  // Agrupamos los datos antes de renderizar para que no haya barras duplicadas
 const processedData = stock.filter(item => item.amount > 0)

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">📊 AutoSync Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">📦 Nuevo Producto</h2>
            <StockForm onProductCreated={handleCreateProduct} />
          </div>
        </div>

        <div className="md:col-span-2">
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">Resumen de Inventario Total</h2>
            <div style={{ width: "100%", height: 400 }}>
              <ResponsiveContainer>
                <BarChart 
                  layout="vertical" 
                  data={processedData} 
                  margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                  <XAxis type="number" />
                  <YAxis 
                    dataKey="product" 
                    type="category" 
                    width={100} 
                    style={{ fontSize: '12px', fontWeight: 'bold' }}
                  />
                  <Tooltip cursor={{ fill: '#f3f4f6' }} />
                  <Bar dataKey="amount" radius={[0, 4, 4, 0]} barSize={20}>
                    {processedData.map((entry, index) => {
                      let barColor = "#10b981"; 
                      if (entry.amount <= 5) barColor = "#ef4444"; 
                      else if (entry.amount <= 15) barColor = "#f59e0b"; 
                      return <Cell key={`cell-${index}`} fill={barColor} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>


      {/* Debajo de la sección del gráfico, dentro de la columna del gráfico */}


      <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 mt-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-blue-600">
          🤖 Consultar IA
        </h2>
        <form onSubmit={handleAnalyze} className="flex gap-2 mb-4">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ej: ¿Qué productos están por agotarse?"
            className="flex-1 p-2 border rounded-lg focus:outline-none"
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