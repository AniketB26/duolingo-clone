"use client";

import type { ButtonHTMLAttributes } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  tone?: "green" | "blue" | "white" | "red";
};

const tones = {
  green: "bg-feather text-white border-transparent shadow-bump hover:brightness-105",
  blue: "bg-macaw text-white border-transparent shadow-bump-blue hover:brightness-105",
  white: "bg-white text-eel border-2 border-b-4 border-swan hover:bg-slate-50",
  red: "bg-cardinal text-white shadow-bump-red",
};

export function BumpButton({ tone = "green", className = "", disabled, ...props }: Props) {
  return (
    <button
      {...props}
      disabled={disabled}
      className={`rounded-2xl px-4 py-3 font-extrabold uppercase tracking-wide transition-transform active:translate-y-1 active:shadow-none disabled:cursor-not-allowed disabled:bg-swan disabled:text-wolf disabled:shadow-none disabled:active:translate-y-0 ${tones[tone]} ${className}`}
    />
  );
}
