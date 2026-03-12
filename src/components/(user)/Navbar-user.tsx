import { faArrowRightFromBracket, faCartShopping, faUser, faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const NavbarUser = () => {
  return (
    <div className="fixed top-0 flex justify-between items-center w-full h-20 bg-white shadow-sm text-black px-14">
      {/* LOGO */}
      <div className="font-bold text-xl cursor-pointer">Rizky Elektronik</div>

      {/* SEARCH */}
      <div className="w-[40%]">
        <div className="flex items-center border-2 border-gray-300 rounded-full pl-4 pr-2 py-1 bg-white">
          <input type="text" placeholder="Cari produk elektronik..." className="bg-transparent outline-none w-full text-sm" />
          <div className="flex items-center justify-center w-9 h-9 bg-black rounded-full">
            <FontAwesomeIcon icon={faMagnifyingGlass} className=" w-5 text-white cursor-pointer " />
          </div>
        </div>
      </div>

      {/* USER MENU */}
      <div>
        <div className="flex items-center gap-6 justify-center">
          {/* USER LOGIN */}
          <div className="flex items-center justify-center gap-2 cursor-pointer hover:text-blue-600">
            <FontAwesomeIcon className="w-5" icon={faUser} />

            <p className="text-sm font-medium">Masuk / Daftar</p>
          </div>

          {/* CART */}
          <div className="relative cursor-pointer hover:text-blue-600">
            <FontAwesomeIcon className="w-6" icon={faCartShopping} />

            {/* CART BADGE */}
            <span className="absolute -top-2 -right-3 text-xs bg-red-500 text-white px-1.5 rounded-full">0</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NavbarUser;
