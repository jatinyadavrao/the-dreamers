"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Rocket, ArrowRight } from "lucide-react";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};
const item = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const } },
};

export function HeroTitle() {
  return (
    <motion.div variants={container} initial="hidden" animate="show" className="text-center">
      <motion.span
        variants={item}
        className="glass mx-auto mb-6 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium text-dream-300"
      >
        <Rocket className="h-3.5 w-3.5" /> Practice smarter, not harder
      </motion.span>

      <motion.h1
        variants={item}
        className="font-display text-5xl font-extrabold leading-[1.05] tracking-tight sm:text-7xl md:text-8xl"
      >
        <span className="text-gradient">The Dreamers</span>
      </motion.h1>

      <motion.p
        variants={item}
        className="mx-auto mt-6 max-w-2xl text-base text-[var(--muted)] sm:text-lg"
      >
        Company-wise LeetCode questions asked by <b className="text-dream-300">Amazon</b>,{" "}
        <b className="text-nebula-400">Google</b>, and hundreds more. Filter by frequency,
        track what you solve, and land your dream role.
      </motion.p>

      <motion.div variants={item} className="mt-9 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/companies"
          className="group flex items-center gap-2 rounded-full bg-gradient-to-r from-dream-500 to-nebula-500 px-7 py-3 font-semibold text-white shadow-[0_0_40px_-8px_rgba(99,102,241,0.8)] transition-transform hover:scale-105"
        >
          Explore companies
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
        <Link
          href="/questions"
          className="glass rounded-full px-7 py-3 font-semibold transition-transform hover:scale-105"
        >
          Browse all questions
        </Link>
      </motion.div>
    </motion.div>
  );
}

export function CompanyMarquee({ names }: { names: string[] }) {
  if (!names.length) return null;
  const doubled = [...names, ...names];
  return (
    <div className="relative mt-16 overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_15%,#000_85%,transparent)]">
      <div className="flex w-max animate-marquee gap-3">
        {doubled.map((n, i) => (
          <span
            key={i}
            className="glass whitespace-nowrap rounded-full px-5 py-2 text-sm font-medium text-[var(--muted)]"
          >
            {n}
          </span>
        ))}
      </div>
    </div>
  );
}
