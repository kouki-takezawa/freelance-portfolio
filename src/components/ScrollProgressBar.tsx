"use client";

import { motion, useScroll } from "motion/react";

export default function ScrollProgressBar() {
  const { scrollYProgress } = useScroll();

  return (
    <motion.div
      className="fixed inset-x-0 top-0 z-[60] h-1 origin-left bg-gradient-to-r from-accent to-sky-500"
      style={{ scaleX: scrollYProgress }}
      aria-hidden="true"
    />
  );
}
