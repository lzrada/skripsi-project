"use client";
const page = () => {
  const handleSubmit = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    // Add your submit logic here
    alert("Password reset link sent!");
  };
  return (
    <div className="flex items-center justify-center w-full h-screen bg-[#F5F6FA]">
      <div className="flex flex-col gap-2 items-center p-7 w-96 h-3/5 border  border-gray-200 bg-white rounded-md shadow-sm">
        <p className="text-gray-800 text-2xl font-bold">Password reset</p>
        <p className="font-thin text-sm text-gray-700">Check your email to reset your password</p>
        <p className="flex justify-start font-medium text-sm mt-4 text-gray-600  w-full">Email</p>
        <input className="w-full h-9 border border-gray-300 rounded focus:outline-1 p-3" placeholder="Enter Email Adress"></input>
        <button
          onClick={handleSubmit}
          className="w-full p-4 h-10 bg-[#1E2753] hover:bg-[#222b58] disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-md mt-4 font-medium cursor-pointer transition-colors flex items-center justify-center gap-2"
        >
          Reset Password
        </button>
        <div className="h-0.5 w-full bg-gray-200 my-4"></div>
        <p className="font-normal flex items-center justify-center text-sm text-gray-500 ">Remembered your password?</p>
        <div className="flex items-center justify-center text-blue-500 hover:underline cursor-pointer p-3 w-full h-9 border-gray-300 my-4 border rounded-md">Back to Login</div>
      </div>
    </div>
  );
};

export default page;
