"use client";

import { useEffect, useState } from "react";

type NameGradientProps = {
  text?: string;
  className?: string;
};

export default function NameGradient({
  text = "Harshit Pandit",
  className = "",
}: NameGradientProps) {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const root = document.documentElement;

    const updateTheme = () => {
      const isDark = root.classList.contains("dark");
      setTheme(isDark ? "dark" : "light");
    };

    updateTheme();
    const observer = new MutationObserver(updateTheme);
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });

    return () => observer.disconnect();
  }, []);

  return (
    <span className={`relative block ${className}`.trim()}>
      <span className="whitespace-normal xl:whitespace-nowrap">{text}</span>
      <span
        className={`gradient-layer  ${
          theme === "light" ? "gradient-blue" : "gradient-red"
        } whitespace-normal xl:whitespace-nowrap absolute top-0 left-0`}
      >
        {text}
      </span>
    </span>
  );
}
