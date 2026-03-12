"use client";

import { useState } from "react";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FcGoogle } from "react-icons/fc";
import { FacebookIcon } from "@/components/icons/Icons";
import LoaderSubmit from "@/components/ui/LoaderSubmit";

export default function Register() {
  // State untuk show/hide password
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const handleClick = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  };
  return (
    <div className="flex items-center justify-center w-full h-screen bg-[#F5F6FA]">
      <div className="flex justify-center p-7 w-96 h-3/4 border border-gray-200 bg-white rounded-md shadow-md">
        <div className="flex flex-col">
          <p className="flex justify-center font-bold text-2xl">Create an Account</p>
          <div className="flex items-center text-sm my-3 gap-2 justify-center">
            <p className="font-semibold text-gray-600">Have an Account?</p>
            <p className="text-blue-500  cursor-pointer hover:underline">Sign In</p>
          </div>

          <div>
            <p className="font-medium  text-gray-600 text-sm my-2">Email</p>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter Email Address"
              className="w-72 h-9 bg-white border p-3 focus:outline-1 outline-blue-400 text-sm text-gray-500 border-gray-300 rounded-md"
            />
          </div>

          <div>
            <p className="font-medium text-gray-600 text-sm my-2">Password</p>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter Password"
                className="w-72 h-9 bg-white border p-3 pr-10 focus:outline-1 outline-blue-400 text-sm text-gray-500 border-gray-300 rounded-md"
              />

              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                <FontAwesomeIcon className="w-4 h-4 cursor-pointer" icon={showPassword ? faEyeSlash : faEye} />
              </button>
            </div>
          </div>

          <button
            onClick={handleClick}
            disabled={loading}
            className="w-72 h-9 bg-[#1E2753] hover:bg-[#222b58] disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-md mt-4 font-medium cursor-pointer transition-colors flex items-center justify-center gap-2"
          >
            {loading && <LoaderSubmit />}
            <span>{loading ? "Loading..." : "Sign In"}</span>
          </button>

          <p className="flex items-center justify-center font-medium my-4 text-gray-600 text-xs">Or just login using:</p>
          <div className="flex justify-center text-sm text-blue-500 items-center w-full h-8 my-2 border border-gray-300 rounded-md p-3 gap-4 cursor-pointer hover:underline ">
            <FcGoogle className="text-xl" />
            <p>continue with google</p>
          </div>
          <div className="flex justify-center text-sm text-blue-500 items-center w-full h-8  border border-gray-300 rounded-md p-2 gap-4 cursor-pointer  hover:underline ">
            <FacebookIcon />
            <p>continue with facebook</p>
          </div>
        </div>
      </div>
    </div>
  );
}
