import React from "react";

const CardContent: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = "" }) => (
  <div className={`space-y-4 ${className}`}>{children}</div>
);

export default CardContent;
