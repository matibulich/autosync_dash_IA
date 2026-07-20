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

const API = import.meta.env.VITE_API_URL || "http://localhost:4000";

const getBarColor = (amount) => {
  if (amount <= 5) return "#ef4444";
  if (amount <= 15) return "#f59e0b";
  return "#10b981";
};

const STATUS_LABEL = [
  { threshold: 5, label: "Critico", color: "#ef4444" },
  { threshold: 15, label: "Bajo", color: "#f59e0b" },
  { threshold: Infinity, label: "Saludable", color: "#10b981" },
];

function App() {
  const [stock, setStock] = useState([]);
  const [analysis, setAnalysis] = useState("");
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [deleteAmount, setDeleteAmount] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let mounted = true;
    const fetchStock = async () => {
      try {
        const res = await axios.get(`${API}/stock`);
        if (mounted) setStock(res.data);
      } catch (error) {
        console.error("Error cargando stock:", error);
      }
    };
    fetchStock();
    return () => {
      mounted = false;
    };
  }, []);

  const handleCreateProduct = async (nuevoProducto) => {
    try {
      const res = await axios.post(`${API}/stock`, nuevoProducto);
      setStock((prevStock) => [...prevStock, res.data]);
    } catch (error) {
      console.error("Error creando producto:", error);
    }
  };

  const handleClearInventory = async () => {
    if (!confirm("¿Estás seguro de que deseas limpiar todo el inventario?"))
      return;
    setClearing(true);
    try {
      const res = await axios.delete(`${API}/stock`);
      if (res.status >= 200 && res.status < 300) {
        setStock([]);
        setSelectedProduct(null);
      } else {
        throw new Error(res.data?.error || "Error desconocido");
      }
    } catch (error) {
      console.error("Error limpiando inventario:", error);
      alert("Error al limpiar inventario");
    } finally {
      setClearing(false);
    }
  };

  const handleBarClick = (data) => {
    if (data && data.product) {
      setSelectedProduct(data);
      setDeleteAmount("");
    }
  };

  const handleDeleteAmount = async () => {
    if (!selectedProduct) return;
    const amt = parseFloat(deleteAmount);
    if (isNaN(amt) || amt <= 0) {
      alert("Ingresa una cantidad válida mayor a 0");
      return;
    }
    if (amt > selectedProduct.amount) {
      alert(
        `No puedes eliminar más de ${selectedProduct.amount} (stock actual)`
      );
      return;
    }
    setDeleting(true);
    try {
      const res = await axios.post(`${API}/stock/${selectedProduct.id}/reduce`, {
        amount: amt,
      });
      if (res.data.deleted) {
        setStock((prev) => prev.filter((s) => s.id !== selectedProduct.id));
        setSelectedProduct(null);
      } else {
        setStock((prev) =>
          prev.map((s) =>
            s.id === selectedProduct.id ? { ...s, amount: res.data.amount } : s
          )
        );
        setSelectedProduct((prev) => ({
          ...prev,
          amount: res.data.amount,
        }));
      }
      setDeleteAmount("");
    } catch (error) {
      console.error("Error eliminando cantidad:", error);
      alert("Error al eliminar cantidad");
    } finally {
      setDeleting(false);
    }
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!prompt) return;
    setLoading(true);
    try {
      const res = await axios.get(
        `${API}/analyze?prompt=${encodeURIComponent(prompt)}`
      );
      setAnalysis(res.data.analysis);
    } catch (error) {
      console.error("Error en el análisis:", error);
      setAnalysis("Error al conectar con el experto en stock.");
    } finally {
      setLoading(false);
    }
  };

  const processedData = stock
    .filter((item) => item.amount > 0)
    .sort((a, b) => b.amount - a.amount);

  const totalUnits = processedData.reduce((sum, d) => sum + d.amount, 0);
  const totalValue = processedData.reduce(
    (sum, d) => sum + d.amount * (d.price || 0),
    0
  );

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">AutoSync Dashboard</h1>
      <p className="text-gray-500 mb-6">
        Gestiona tu inventario y consulta al asistente IA
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 flex flex-col gap-4">
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">
              Nuevo Producto
            </h2>
            <StockForm onProductCreated={handleCreateProduct} />
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">
              Acciones de Inventario
            </h2>
            <button
              onClick={handleClearInventory}
              disabled={clearing || processedData.length === 0}
              className="w-full bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 disabled:bg-red-300 transition-colors font-semibold text-sm"
            >
              {clearing ? "Limpiando..." : "Limpiar Inventario"}
            </button>
          </div>
        </div>

        <div className="md:col-span-2">
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-700">
                Resumen de Inventario
              </h2>
              <div className="flex gap-4 text-sm">
                <span className="text-gray-500">
                  Productos:{" "}
                  <strong className="text-gray-800">
                    {processedData.length}
                  </strong>
                </span>
                <span className="text-gray-500">
                  Unidades:{" "}
                  <strong className="text-gray-800">
                    {totalUnits.toLocaleString()}
                  </strong>
                </span>
                {totalValue > 0 && (
                  <span className="text-gray-500">
                    Valor:{" "}
                    <strong className="text-gray-800">
                      $
                      {totalValue.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </strong>
                  </span>
                )}
              </div>
            </div>

            {processedData.length === 0 ? (
              <div className="flex items-center justify-center h-[400px] text-gray-400">
                No hay productos en el inventario
              </div>
            ) : (
              <div style={{ width: "100%", height: 400 }}>
                <ResponsiveContainer>
                  <BarChart
                    layout="vertical"
                    data={processedData}
                    margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      horizontal={true}
                      vertical={false}
                      stroke="#e5e7eb"
                    />
                    <XAxis
                      type="number"
                      tick={{ fontSize: 12, fill: "#6b7280" }}
                      axisLine={{ stroke: "#d1d5db" }}
                      tickLine={false}
                    />
                    <YAxis
                      dataKey="product"
                      type="category"
                      width={80}
                      tick={{ fontSize: 12, fontWeight: 600, fill: "#374151" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      cursor={{ fill: "#f9fafb" }}
                      content={({ active, payload }) => {
                        if (!active || !payload?.length) return null;
                        const d = payload[0].payload;
                        const status =
                          STATUS_LABEL.find((s) => d.amount <= s.threshold) ||
                          STATUS_LABEL[2];
                        return (
                          <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-sm">
                            <p className="font-bold text-gray-800 mb-1">
                              {d.product}
                            </p>
                            <p className="text-gray-600">
                              Cantidad:{" "}
                              <span className="font-semibold">
                                {d.amount}
                              </span>
                            </p>
                            {d.price && (
                              <p className="text-gray-600">
                                Precio:{" "}
                                <span className="font-semibold">
                                  ${d.price}
                                </span>
                              </p>
                            )}
                            <p
                              className="mt-1 font-semibold"
                              style={{ color: status.color }}
                            >
                              {status.label}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              Click para eliminar
                            </p>
                          </div>
                        );
                      }}
                    />
                    <Bar
                      dataKey="amount"
                      radius={[0, 6, 6, 0]}
                      barSize={24}
                      animationDuration={800}
                      cursor="pointer"
                      onClick={(_, index) => handleBarClick(processedData[index])}
                    >
                      {processedData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={getBarColor(entry.amount)}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            <div className="flex items-center gap-6 mt-3 justify-center text-sm">
              {STATUS_LABEL.map((s) => (
                <div key={s.label} className="flex items-center gap-1.5">
                  <span
                    className="inline-block w-3 h-3 rounded-sm"
                    style={{ backgroundColor: s.color }}
                  />
                  <span className="text-gray-600">
                    {s.label}
                    {s.threshold !== Infinity && ` (<= ${s.threshold})`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className={`grid grid-cols-1 gap-8 mt-8 ${selectedProduct ? "md:grid-cols-2" : ""}`}>
        {selectedProduct && (
          <div className="bg-white p-6 rounded-xl shadow-md border border-amber-300">
            <h2 className="text-xl font-semibold mb-2 text-amber-600">
              Eliminar de: {selectedProduct.product}
            </h2>
            <p className="text-sm text-gray-500 mb-3">
              Stock actual:{" "}
              <strong className="text-gray-800">
                {selectedProduct.amount}
              </strong>
            </p>
            <div className="flex gap-2">
              <input
                type="number"
                min="1"
                max={selectedProduct.amount}
                step="any"
                value={deleteAmount}
                onChange={(e) => setDeleteAmount(e.target.value)}
                placeholder="Cantidad"
                className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-red-400 outline-none text-sm"
              />
              <button
                onClick={handleDeleteAmount}
                disabled={deleting}
                className="bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600 disabled:bg-red-300 transition-colors font-semibold text-sm"
              >
                {deleting ? "..." : "Eliminar"}
              </button>
            </div>
            <button
              onClick={() => setSelectedProduct(null)}
              className="mt-2 w-full text-sm text-gray-400 hover:text-gray-600"
            >
              Cancelar
            </button>
          </div>
        )}

        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
          <h2 className="text-xl font-semibold mb-4 text-blue-600">
            Consultar IA
          </h2>
          <form onSubmit={handleAnalyze} className="flex gap-2 mb-4">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ej: ¿Que productos estan por agotarse?"
              className="flex-1 p-2 border rounded-lg focus:outline-none text-sm"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 disabled:bg-blue-300 transition-colors font-semibold text-sm"
            >
              {loading ? "..." : "Preguntar"}
            </button>
          </form>
          {analysis && (
            <div className="p-3 bg-white border-l-4 border-blue-500 rounded shadow-sm">
              <p className="text-gray-800 text-sm whitespace-pre-wrap">{analysis}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;