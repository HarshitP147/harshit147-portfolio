"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function BackToHomeLink() {
  return (
    <motion.div className="inline-flex">
      <Link
        href="/"
        className="text-sm text-muted-foreground"
        style={{ textUnderlineOffset: "4px" }}
      >
        <motion.span
          whileHover={{ color: "rgb(147, 197, 253)", textDecoration: "underline" }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
          Back to Home
        </motion.span>
      </Link>
    </motion.div>
  );
}
