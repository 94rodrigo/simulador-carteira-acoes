import React from "react";

const Card: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="rounded-2xl shadow-md bg-gray-900 border border-gray-800 p-4">{children}</div>
);

export default Card;
