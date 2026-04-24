import React from "react";
import { Pie } from "react-chartjs-2";
import { categoryGradient } from "@/constants/category";
import "tailwindcss/tailwind.css";

const CategoryBreakdown = ({ salesData }: { salesData: Record<string, number> }) => {
  const categoryNames = Object.keys(salesData);
  const categoryValues = categoryNames.map((category) => salesData[category]);
  const totalSales = categoryValues.reduce((acc, cur) => acc + cur, 0);

  const data = {
    labels: categoryNames,
    datasets: [
      {
        data: categoryValues,
        backgroundColor: categoryGradient,
      },
    ],
  };

  return (
    <div className="flex flex-col items-center">
      <h1 className="text-xl font-bold mb-4">Sales Breakdown by Category</h1>
      <Pie data={data} />
      <ul className="mt-4">
        {categoryNames.map((category) => (
          <li key={category} className="flex justify-between w-full p-2 border-b">
            <span>{category}</span>
            <span>
              {salesData[category]} ({((salesData[category] / totalSales) * 100).toFixed(2)}%)
            </span>
          </li>
        ))}
      </ul>
      <h2 className="mt-4 text-lg">Total Sales: {totalSales}</h2>
    </div>
  );
};

export default CategoryBreakdown;
