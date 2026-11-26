import { type ClassValue, clsx } from "clsx"
import { extendTailwindMerge } from "tailwind-merge"

// tailwind-merge must know our custom sizes, otherwise it treats `text-title`
// as a color and drops it when combined with e.g. `text-muted-foreground`.
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [{ text: ["title", "heading", "display", "hero", "section", "mega"] }],
      rounded: [{ rounded: ["control", "card", "panel"] }],
    },
  },
})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
