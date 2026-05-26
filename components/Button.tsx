import { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  children: ReactNode;
}

const styles: Record<Variant, string> = {
  primary:
    "bg-brand-500 text-white hover:bg-brand-600 disabled:bg-brand-500/50 disabled:cursor-not-allowed",
  secondary:
    "bg-white/10 text-white hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed",
  ghost:
    "text-zinc-300 hover:bg-white/5 hover:text-white disabled:opacity-50",
};

export default function Button({
  variant = "primary",
  className = "",
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      {...rest}
      className={`inline-flex items-center justify-center rounded-md px-5 py-2.5 text-sm font-semibold transition ${styles[variant]} ${className}`}
    >
      {children}
    </button>
  );
}
