"use client";
import React, { JSX } from "react";

interface TitleProps {
  text: string;
  level?: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  weight?:
    | "thin"
    | "extralight"
    | "light"
    | "normal"
    | "medium"
    | "semibold"
    | "bold"
    | "extrabold"
    | "black";
  className?: string; 
}

const Title: React.FC<TitleProps> = ({
  text,
  level = 4,
  weight = "bold",
  className,
}) => {
  // Dynamically select heading tag (h1–h6)
  const HeadingTag = `h${level}` as keyof JSX.IntrinsicElements;

  // Base color and responsive size styles
  const levelStyles: Record<number, string> = {
    1: "text-[36px] sm:text-[42px]",
    2: "text-[36px] sm:text-[30px]",
    3: "text-[24px] sm:text-[28px]",
    4: "text-[26px] sm:text-[24px]",
    5: "text-[22px] sm:text-[20px]",
    6: "text-[16px] sm:text-[18px]",
    7: "text-[16px] sm:text-[14px]",
  };

  return (
    <HeadingTag
      className={`${levelStyles[level]} font-${weight} text-[#080808] ${className || ""}`}
    >
      {text}
    </HeadingTag>
  );
};

export default Title;
