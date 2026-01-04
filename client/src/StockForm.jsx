import React, { useState } from 'react';
import axios from 'axios';

const StockForm = ({ onProductCreated }) => {
  const [formData, setFormData] = useState({
    product: '',
    amount: '',
    price: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Convertimos amount y price a números antes de enviar
      const dataToSend = {
        ...formData,
        amount: parseFloat(formData.amount),
        price: parseFloat(formData.price)
      };

      const res = await axios.post("http://localhost:4000/stock", dataToSend);
      
      // Notificamos al padre para que actualice la lista
      if (onProductCreated) onProductCreated(res.data);

      // Limpiamos el formulario
      setFormData({ product: '', amount: '', price: '' });
      alert("Producto creado con éxito");
    } catch (error) {
      console.error("Error al crear:", error);
      alert("Error al guardar el producto");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 max-w-xs mb-5 p-4 border border-gray-200 rounded-lg bg-white shadow-sm">
    <h3 className="font-bold text-gray-700">Agregar Nuevo Stock</h3>
    <input
      name="product"
      placeholder="Nombre del producto"
      value={formData.product}
      onChange={handleChange}
      className="p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
      required
    />
    <input
      name="amount"
      type="number"
      placeholder="Cantidad"
      value={formData.amount}
      onChange={handleChange}
      className="p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
      required
    />
    <input
      name="price"
      type="number"
      step="0.01"
      placeholder="Precio"
      value={formData.price}
      onChange={handleChange}
      className="p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
  
    />
    <button 
      type="submit" 
      className="bg-green-600 text-white py-2 rounded hover:bg-green-700 transition-colors font-semibold"
    >
      Guardar en Stock
    </button>
  </form>
  );
};



export default StockForm;