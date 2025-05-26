import React from "react";

const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
  <input
    className="border border-gray-700 bg-gray-800 text-white rounded-xl px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
    {...props}
  />
);

export default Input;
