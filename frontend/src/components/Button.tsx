import React from "react";

const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ children, ...props }) => (
  <button
    className="bg-blue-700 hover:bg-blue-800 text-white font-semibold py-2 px-4 rounded-xl disabled:opacity-50"
    {...props}
  >
    {children}
  </button>
);

export default Button;
