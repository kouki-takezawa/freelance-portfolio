export function categoryVisual(category: string): {
  icon: "hp" | "lp" | "system" | "line";
  bg: string;
  border: string;
} {
  if (category.includes("LINE")) {
    return {
      icon: "line",
      bg: "bg-emerald-50 dark:bg-emerald-950/40",
      border: "border-t-emerald-400 dark:border-t-emerald-500",
    };
  }
  if (category.includes("LP")) {
    return {
      icon: "lp",
      bg: "bg-amber-50 dark:bg-amber-950/40",
      border: "border-t-amber-400 dark:border-t-amber-500",
    };
  }
  if (category.includes("システム") || category.includes("アプリ")) {
    return {
      icon: "system",
      bg: "bg-violet-50 dark:bg-violet-950/40",
      border: "border-t-violet-400 dark:border-t-violet-500",
    };
  }
  return { icon: "hp", bg: "bg-blue-50 dark:bg-blue-950/40", border: "border-t-accent" };
}
