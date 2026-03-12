const Loader = () => {
  return (
    <div className="flex items-center justify-center w-full h-screen">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-[#linear-gradient(to right, #1e2a3a 0%, #1e2a3a 100%)] border-t-transparent rounded-full animate-spin"></div>
      </div>
    </div>
  );
};

export default Loader;
