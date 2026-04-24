import React from "react";
import { Bar } from "react-chartjs-2";

const TopProductsChart = ({ products }: { products: { name: string; quantitySold: number; revenue: number }[] }) => {
  const data = {
    labels: products.map((product) => product.name),
    datasets: [
      {
        label: "Quantity Sold",
        data: products.map((product) => product.quantitySold),
        backgroundColor: "rgba(75, 192, 192, 0.6)",
      },
      {
        label: "Revenue Generated",
        data: products.map((product) => product.revenue),
        backgroundColor: "rgba(153, 102, 255, 0.6)",
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-lg font-bold">Top 5 Best Selling Products</h2>
      <div className="w-full h-96">
        <Bar data={data} options={options} />
      </div>
    </div>
  );
};

export default TopProductsChart;
