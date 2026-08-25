export function categoryVisual(category: string): {
  icon: "hp" | "lp" | "system";
  bg: string;
  border: string;
} {
  if (category.includes("LP")) {
    return { icon: "lp", bg: "bg-amber-50", border: "border-t-amber-400" };
  }
  if (category.includes("システム") || category.includes("アプリ")) {
    return { icon: "system", bg: "bg-violet-50", border: "border-t-violet-400" };
  }
  return { icon: "hp", bg: "bg-blue-50", border: "border-t-accent" };
}
