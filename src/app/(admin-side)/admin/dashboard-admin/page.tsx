import { IoCartOutline } from "react-icons/io5";
import { FaAngleUp } from "react-icons/fa";

import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";
import ChartLine from "@/components/(admin)/ui/ChartLine";
import { ChartOrange, ChartGreen, ChartBlue } from "@/components/(admin)/svg/Chart";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const Dashboard = () => {
  return (
    <div className="flex flex-col p-7 ">
      <h1 className="font-bold text-2xl">Dashboard Admin</h1>
      {/* grid atas strt */}
      <div className="grid grid-cols-5 my-3 gap-5">
        {/* grid pertma */}
        <div className="h-20 px-10 py-3 bg-white rounded-md shadow-md ">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold">$10.54</p>
              <p className="font-thin  text-sm text-gray-800">Total Reven</p>
              <p className="text-xs ml-0.5 text-[#06A561]">22.45% </p>
            </div>
            <div className="w-7 h-7 rounded-full bg-[#ECF2FF] flex items-center justify-center">
              <p className="font-semibold text-blue-500">$</p>
            </div>
          </div>
        </div>

        <div className="h-20 px-10 py-3 bg-white rounded-md shadow-md ">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold -ml-0.5">1,056</p>
              <p className="font-thin  text-sm text-gray-800">Orders</p>
              <p className="text-xs  text-[#06A561]">15.34% </p>
            </div>
            <div className="w-7 h-7 rounded-full bg-[#ECF2FF] flex items-center justify-center">
              <p className="font-semibold text-blue-500">
                <IoCartOutline />
              </p>
            </div>
          </div>
        </div>

        <div className="h-20  flex items-center p-3 bg-white rounded-md shadow-md justify-between ">
          <div>
            <h1 className="font-thin text-gray-900 text-sm">Unique Visits</h1>
            <p className="font-bold text-xl">5.420</p>
            <div className="flex items-center justify-between">
              <p className="font-thin text-red-600 text-xs"> 10.24% </p>
              <FaAngleUp className="text-red-600  rotate-180 text-xs mr-4" />
            </div>
          </div>
          <ChartOrange />
        </div>
        <div className="h-20 flex items-center p-3 bg-white rounded-md shadow-md justify-between ">
          <div>
            <h1 className="font-thin text-gray-900 text-sm"> New Users</h1>
            <p className="font-bold text-xl">1.650</p>
            <div className="flex items-center justify-between">
              <p className="font-thin text-[#06A561] ml-0.5 text-xs"> 15.34% </p>
              <FaAngleUp className="text-[#06A561] text-xs " />
            </div>
          </div>
          <ChartGreen />
        </div>
        <div className="h-20 flex items-center p-3 bg-white rounded-md shadow-md ">
          <div>
            <h1 className="font-thin text-gray-900 text-sm"> Existing Users</h1>
            <p className="font-bold text-xl">9.653</p>
            <div className="flex items-center justify-between">
              <p className="font-thin text-[#06A561] ml-0.5 text-xs"> 22.45% </p>
              <FaAngleUp className="text-[#06A561] text-xs mr-4" />
            </div>
          </div>
          <ChartBlue />
        </div>
      </div>
      {/* chart line hre */}
      <div className="flex gap-5 justify-between">
        <div className=" w-3/4 h-80 bg-white rounded-2xl">
          <ChartLine />
        </div>
        <div className="flex gap-5 p-8 flex-col w-1/4 h-106 rounded-2xl bg-white">
          <p className="font-bold">last month sales</p>
          <div className="">
            <p className="font-bold">1,259</p>
            <p className="font-thin">items sold</p>
          </div>
          <p>$12,345</p>
          <div className="w-full h-px bg-gray-200"></div>
        </div>
      </div>
    </div>
  );
};
export default Dashboard;
