"use client";
import { useState } from "react";
import { CiSearch } from "react-icons/ci";
import { FaAngleDown, FaAngleUp, FaPlus } from "react-icons/fa";

const ordersManagement = () => {
  const [addOrder, setAddOrder] = useState<boolean>(false);
  const handleOrder = () => {
    setAddOrder((prev) => !prev);
  };
  const fakeOrders = [
    {
      id: 1,
      customer: "John Doe",
      date: "2023-10-01",
      status: "Pending",
      total: "$100.00",
    },
    {
      id: 2,
      customer: "Jane Smith",
      date: "2023-10-02",
      status: "Shipped",
      total: "$150.00",
    },
    {
      id: 3,
      customer: "Alice Johnson",
      date: "2023-10-03",
      status: "Delivered",
      total: "$200.00",
    },
  ];
  return (
    <div className="px-10 w-full h-full py-5 flex flex-col gap-5 relative">
      <div className="flex items-center justify-between">
        <p className="font-bold text-2xl">Orders Management</p>
        <div className="flex items-center justify-center w-32 h-10 bg-blue-500 rounded-md gap-2 text-white hover:cursor-pointer" onClick={handleOrder}>
          <FaPlus />
          <p>Add Order</p>
        </div>
      </div>

      {/* table */}
      <div className="w-full h-full bg-white border-2 border-gray-200 rounded-md p-5">
        <div className="flex items-center justify-between ">
          <div className="flex items-center gap-3 ">
            <div className="flex items-center justify-between p-4 w-44 h-10 rounded-md border-2 border-gray-200 text-gray-400">
              <p>Filter</p>
              <FaAngleDown />
            </div>
            <div className="flex items-center p-4 w-80 h-10 border-gray-200 border-2 rounded-md text-gray-400 gap-3">
              <CiSearch />
              <p>Search....</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div>3</div>
            <div>4</div>
          </div>
        </div>

        {/* MODAL */}
        {addOrder && (
          <>
            {/* BACKDROP */}
            <div onClick={handleOrder} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" />

            {/* MODAL CONTENT */}
            <div className="fixed z-50 inset-0 flex items-center justify-center">
              <div className="w-[500px] bg-white border border-gray-300 rounded-lg p-6 shadow-xl">
                <p className="font-bold text-xl mb-3">Add Order</p>

                <p>Isi form di sini...</p>

                <button className="mt-5 px-4 py-2 bg-blue-500 text-white rounded-md" onClick={handleOrder}>
                  Close
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ordersManagement;
