import React from "react";
import { motion, MotionProps } from "framer-motion";
import { Loader2 } from "lucide-react";
import { clsx } from "clsx";

interface ButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof MotionProps> {
	variant?: "primary" | "secondary" | "ghost" | "outline" | "danger";
	size?: "sm" | "md" | "lg";
	isLoading?: boolean;
	children: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
	({ className, variant = "primary", size = "md", isLoading, children, disabled, ...props }, ref) => {
		const baseClasses =
			"inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";

		const variants = {
			primary: "bg-neutral-900 text-white hover:bg-neutral-800 focus-visible:ring-neutral-400",
			secondary: "border border-neutral-300 bg-white hover:bg-neutral-50 focus-visible:ring-neutral-400",
			ghost: "hover:bg-neutral-100 hover:text-neutral-900 focus-visible:ring-neutral-400",
			outline: "border border-neutral-200 hover:bg-neutral-50 focus-visible:ring-neutral-400",
			danger: "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-400",
		};

		const sizes = {
			sm: "h-8 px-3 text-sm rounded-md",
			md: "h-10 px-4 text-sm rounded-md",
			lg: "h-12 px-6 text-base rounded-md",
		};

		return (
			<motion.button
				ref={ref}
				className={clsx(baseClasses, variants[variant], sizes[size], className)}
				disabled={disabled || isLoading}
				whileHover={disabled || isLoading ? {} : { scale: 1.02 }}
				whileTap={disabled || isLoading ? {} : { scale: 0.98 }}
				transition={{ duration: 0.1 }}
				{...props}
			>
				{isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
				{children}
			</motion.button>
		);
	},
);

Button.displayName = "Button";

export default Button;
