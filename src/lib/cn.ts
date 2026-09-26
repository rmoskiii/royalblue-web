import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

/** Teach tailwind-merge our custom radius tokens so overrides resolve correctly. */
const twMerge = extendTailwindMerge({
  extend: { theme: { radius: ['field', 'tile', 'card', 'panel'] } },
});

/** Merge class names, letting later Tailwind classes override earlier ones. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
