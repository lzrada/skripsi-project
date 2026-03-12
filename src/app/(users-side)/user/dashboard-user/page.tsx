import Link from "next/link";

const page = () => {
  return (
    <div className="w-full py-10">
      {/* HERO BANNER */}
      <div className="px-14 mt-6">
        <div className="w-full h-64 bg-gray-300 flex items-center justify-center rounded">
          <p className="text-gray-600">Banner Hero</p>
        </div>
      </div>

      {/* PRODUK */}
      <div className="px-14 mt-10">
        <div className="grid grid-cols-5 gap-6">
          {["TV", "mesin", "alat", "komponen", "aksesoris", "spare part", "tools", "material", "bahan baku", "jasa"].map((item) => (
            <Link key={item} href={`/user/product-detail/${item}`} className="bg-white shadow rounded overflow-hidden cursor-pointer hover:shadow-lg transition-shadow">
              <div className="h-40 bg-gray-200"></div>

              <div className="bg-gray-300 p-3">
                <p className="text-sm">{item}</p>

                <p className="text-sm font-bold">Rp. ###</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default page;
