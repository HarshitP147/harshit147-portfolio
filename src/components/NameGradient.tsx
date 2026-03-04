"use client";

import { useEffect, useState } from "react";

type NameGradientProps = {
  text?: string;
  className?: string;
};

export default function NameGradient({
  text = "HARSHIT PANDIT",
  className = "",
}: NameGradientProps) {
  const [isBlueTheme, setIsBlueTheme] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsBlueTheme((prev) => !prev);
    }, 12000);

    return () => clearInterval(interval);
  }, []);

  const textClass = " whitespace-normal xl:whitespace-nowrap";

  return (
    <span className={`relative block ${className}`.trim()}>
      <span className={`${textClass} opacity-0`}>{text}</span>
      <span
        aria-hidden="true"
        className={`gradient-layer gradient-blue ${textClass} ${
          isBlueTheme ? "opacity-100" : "opacity-0"
        }`}
      >
        {text}
      </span>
      <span
        aria-hidden="true"
        className={`gradient-layer gradient-red ${textClass} ${
          isBlueTheme ? "opacity-0" : "opacity-100"
        }`}
      >
        {text}
      </span>
    </span>
  );
}
