"use client";

import { useState } from "react";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

export default function ChartLine() {
  const [selectedWeek, setSelectedWeek] = useState("week1");

  // Data for each week
  const weekData = {
    week1: {
      labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      day1: [28, 8, 18, 15, 22, 30, 18],
      day2: [10, 6, 16, 12, 34, 32, 36],
      total1: 139,
      total2: 146,
      dates: "Week 1 (Nov 1-7)",
    },
    week2: {
      labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      day1: [22, 15, 28, 20, 35, 25, 30],
      day2: [18, 20, 25, 30, 40, 38, 42],
      total1: 175,
      total2: 213,
      dates: "Week 2 (Nov 8-14)",
    },
    week3: {
      labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      day1: [30, 25, 20, 28, 32, 22, 26],
      day2: [25, 28, 32, 35, 38, 40, 45],
      total1: 183,
      total2: 243,
      dates: "Week 3 (Nov 15-21)",
    },
    week4: {
      labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      day1: [20, 18, 25, 30, 28, 24, 22],
      day2: [22, 26, 30, 35, 42, 38, 40],
      total1: 167,
      total2: 233,
      dates: "Week 4 (Nov 22-28)",
    },
  };

  const currentData = weekData[selectedWeek as keyof typeof weekData];

  const data = {
    labels: currentData.labels,
    datasets: [
      {
        label: "Previous Period",
        data: currentData.day1,
        borderColor: "#d1d5db",
        backgroundColor: "transparent",
        tension: 0.4,
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 6,
        pointHoverBackgroundColor: "#d1d5db",
        pointHoverBorderColor: "#fff",
        pointHoverBorderWidth: 2,
      },
      {
        label: "Current Period",
        data: currentData.day2,
        borderColor: "#3b82f6",
        backgroundColor: "transparent",
        tension: 0.4,
        borderWidth: 3,
        pointRadius: 0,
        pointHoverRadius: 6,
        pointHoverBackgroundColor: "#3b82f6",
        pointHoverBorderColor: "#fff",
        pointHoverBorderWidth: 2,
      },
    ],
  };

  const options: any = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: "index",
      intersect: false,
    },
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
      tooltip: {
        enabled: true,
        backgroundColor: "#1f2937",
        titleColor: "#fff",
        bodyColor: "#fff",
        padding: 12,
        displayColors: false,
        callbacks: {
          title: function (context: any) {
            return context[0].label;
          },
          label: function (context: any) {
            return context.parsed.y + " Orders";
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        border: {
          display: false,
        },
        ticks: {
          color: "#9ca3af",
          font: {
            size: 11,
          },
        },
      },
      y: {
        min: 0,
        max: 50,
        ticks: {
          stepSize: 10,
          color: "#9ca3af",
          font: {
            size: 11,
          },
        },
        grid: {
          color: "#f3f4f6",
          drawBorder: false,
        },
        border: {
          display: false,
        },
      },
    },
  };

  return (
    <div className="w-full p-6 bg-white rounded-lg">
      <div className="flex justify-between items-start mb-6">
        <div className="flex gap-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{currentData.total2}</h2>
            <p className="text-sm text-gray-500">Orders (Current)</p>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{currentData.total1}</h2>
            <p className="text-sm text-gray-500">Orders (Previous)</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-sm bg-gray-300"></span>
            <span className="text-sm text-gray-600">Previous</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-sm bg-blue-500"></span>
            <span className="text-sm text-gray-600">Current</span>
          </div>
          <div className="relative">
            <select
              value={selectedWeek}
              onChange={(e) => setSelectedWeek(e.target.value)}
              className="appearance-none text-sm text-gray-700 font-medium ml-2 border border-gray-200 rounded-lg px-4 py-2 pr-10 cursor-pointer hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm transition-all"
            >
              <option value="week1">Week 1 (Nov 1-7)</option>
              <option value="week2">Week 2 (Nov 8-14)</option>
              <option value="week3">Week 3 (Nov 15-21)</option>
              <option value="week4">Week 4 (Nov 22-28)</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </div>
      <div className="relative" style={{ height: "300px" }}>
        <Line data={data} options={options} />
      </div>
    </div>
  );
}
