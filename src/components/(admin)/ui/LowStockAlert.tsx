import React, { useEffect, useState } from "react";
import axios from "axios";

const LowStockAlert = () => {
  const [products, setProducts] = useState<{ id: string; name: string; stock: number; reorderPoint: number }[]>([]);

  const fetchLowStockProducts = async () => {
    try {
      const response = await axios.get("/api/inventory/low-stock"); // Example endpoint
      setProducts(response.data);
    } catch (error) {
      console.error("Error fetching low stock products:", error);
    }
  };

  const markAsRestocked = async (productId: string) => {
    try {
      await axios.post(`/api/inventory/restock/${productId}`);
      fetchLowStockProducts(); // Refresh the list after restocking
    } catch (error) {
      console.error("Error marking as restocked:", error);
    }
  };

  useEffect(() => {
    fetchLowStockProducts();
    const interval = setInterval(() => {
      fetchLowStockProducts();
    }, 60000); // Real-time updates every minute
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold mb-2">Low Stock Alert</h2>
      <ul className="space-y-4">
        {products.map((product) => (
          <li key={product.id} className={`flex justify-between items-center p-3 rounded border ${product.stock < product.reorderPoint ? "border-red-500 bg-red-100" : "border-yellow-500 bg-yellow-100"}`}>
            <div>
              <span className="font-semibold">{product.name}</span>
              <div>
                <span>Current Stock: {product.stock}</span>,<span>Reorder Point: {product.reorderPoint}</span>
              </div>
            </div>
            <button className="bg-blue-500 text-white rounded px-4 py-2" onClick={() => markAsRestocked(product.id)}>
              Restock
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LowStockAlert;
