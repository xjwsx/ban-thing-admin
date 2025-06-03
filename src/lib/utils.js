import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind CSS classes with conflicting values
 * @param {...string} inputs - Tailwind CSS class names
 * @returns {string} Merged Tailwind CSS classes
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
