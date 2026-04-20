"use client";
import { IoHome } from "react-icons/io5";
import { FiList } from "react-icons/fi";
import { IoMdPricetag } from "react-icons/io";
import { BiSolidCategory } from "react-icons/bi";
import { FaAngleUp } from "react-icons/fa";
import Link from "next/link";
import { JSX, useState } from "react";
import { useParams, usePathname } from "next/navigation";
const NavbarAdmin = (): JSX.Element => {
  const pathname = usePathname();
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);

  return (
    <>
      <div className="w-12 sm:w-60 bg-gray-800 h-screen flex flex-col p-6">
        <div className="my-4 text-white text-xl font-semibold">gtau ap</div>
        <hr className="text-white mb-7" />
        <Link
          href={"/admin/dashboard-admin"}
          className={`flex items-center gap-5 text-sm p-2 my-2 w-full transition-all ease-in-out duration-200 hover:cursor-pointer ${
            pathname.startsWith("/admin/dashboard-admin") ? "bg-white rounded-md" : "text-white hover:text-gray-800 hover:bg-white hover:rounded-md "
          } `}
        >
          <IoHome className=" text-xl" />
          Dashboard
        </Link>

        <Link href={"/admin/orders-management"} className="flex items-center gap-5 text-sm p-2 my-2 text-white w-full hover:bg-gray-900 hover:rounded-md hover:cursor-pointer h-10">
          <FiList className="mt-1 text-xl" />
          Management Produk
        </Link>
        <Link href={"/admin/product-management"} className="flex items-center gap-5 text-sm p-2 my-2 text-white w-full hover:bg-gray-900 hover:rounded-md hover:cursor-pointer h-10">
          <IoMdPricetag className="mt-1 text-xl" /> Management Pesanan
        </Link>

        <div className="flex items-center" onClick={() => setIsCategoryOpen((prev) => !prev)}>
          <div className="flex items-center gap-5 text-sm pl-2 my-2 text-white w-full hover:bg-gray-900 hover:rounded-md hover:cursor-pointer h-10">
            <BiSolidCategory className="mt-1 text-xl" />
            Kategori
            {isCategoryOpen ? (
              <FaAngleUp className={` ml-10 rotate-0 transition-all ease-in-out duration-200 text-lg text-white hover:cursor-pointer }`} />
            ) : (
              <FaAngleUp className={`ml-10 rotate-180 transition-all ease-in-out duration-200 text-lg text-white hover:cursor-pointer }`} />
            )}
          </div>
        </div>
        {isCategoryOpen && (
          <div className="flex transition-all ease-in-out duration-500 items-center flex-col">
            <div className="bg-gray-800 transition-all ease-in-out duration-500 flex items-center gap-5 text-sm p-2 my-1 text-white w-full hover:bg-gray-900 hover:rounded-md hover:cursor-pointer h-10">check</div>
            <div className="bg-gray-800 transition-all ease-in-out duration-500 flex items-center gap-5 text-sm p-2 my-1 text-white w-full hover:bg-gray-900 hover:rounded-md hover:cursor-pointer h-10">check</div>
            <div className="bg-gray-800 transition-all ease-in-out duration-500 flex items-center gap-5 text-sm p-2 my-1 text-white w-full hover:bg-gray-900 hover:rounded-md hover:cursor-pointer h-10">check</div>
            <div className="bg-gray-800 transition-all ease-in-out duration-500 flex items-center gap-5 text-sm p-2 my-1 text-white w-full hover:bg-gray-900 hover:rounded-md hover:cursor-pointer h-10">check</div>
          </div>
        )}
      </div>
    </>
  );
};

export default NavbarAdmin;
