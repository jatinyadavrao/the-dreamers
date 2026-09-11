"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Rocket, Volume2, VolumeX } from "lucide-react";
import { playLaunchSound } from "@/lib/sound";

const WORDS = ["THE", "DREAMERS"];

export function Intro() {
  const [show, setShow] = useState(false);
  const [launching, setLaunching] = useState(false);
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    const seen = sessionStorage.getItem("intro-seen");
    setMuted(localStorage.getItem("intro-muted") === "1");
    if (!seen) setShow(true);
  }, []);

  function launch() {
    if (launching) return;
    setLaunching(true);
    if (!muted) playLaunchSound();
    sessionStorage.setItem("intro-seen", "1");
    // Let the rocket fly, then fade the overlay away.
    setTimeout(() => setShow(false), 2000);
  }

  function skip() {
    sessionStorage.setItem("intro-seen", "1");
    setShow(false); // instant exit, no launch animation
  }

  function toggleMute() {
    setMuted((m) => {
      localStorage.setItem("intro-muted", m ? "0" : "1");
      return !m;
    });
  }

  let letterIndex = 0;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[10000] flex flex-col items-center justify-center overflow-hidden bg-[#05060f]"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.7, ease: "easeInOut" } }}
        >
          {/* starfield */}
          <div
            className="absolute inset-0 opacity-40"
            style={{
              backgroundImage:
                "radial-gradient(circle at 20% 30%, #fff 1px, transparent 0), radial-gradient(circle at 70% 60%, #fff 1px, transparent 0), radial-gradient(circle at 40% 80%, #fff 1px, transparent 0)",
              backgroundSize: "180px 180px, 220px 220px, 260px 260px",
            }}
          />
          {/* soft glow */}
          <motion.div
            className="absolute h-[50vh] w-[50vh] rounded-full bg-dream-600/20 blur-[130px]"
            animate={{ scale: launching ? 1.6 : [1, 1.15, 1], opacity: launching ? 0 : 0.8 }}
            transition={{ duration: launching ? 1.6 : 4, repeat: launching ? 0 : Infinity }}
          />

          <button
            onClick={toggleMute}
            className="absolute right-5 top-5 rounded-full border border-white/15 p-2.5 text-white/70 transition-colors hover:text-white"
            aria-label={muted ? "Unmute" : "Mute"}
          >
            {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
          </button>

          {/* Title */}
          <motion.div
            className="relative flex flex-wrap items-center justify-center gap-x-4 px-6"
            animate={launching ? { y: -80, opacity: 0 } : {}}
            transition={{ duration: 0.6, ease: "easeIn" }}
          >
            {WORDS.map((word, wi) => (
              <span key={wi} className="flex">
                {word.split("").map((ch) => {
                  const i = letterIndex++;
                  return (
                    <motion.span
                      key={i}
                      className="font-display text-5xl font-extrabold sm:text-7xl md:text-8xl text-gradient"
                      initial={{ y: 50, opacity: 0, filter: "blur(8px)" }}
                      animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
                      transition={{
                        delay: 0.15 + i * 0.05,
                        duration: 0.7,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                    >
                      {ch}
                    </motion.span>
                  );
                })}
              </span>
            ))}
          </motion.div>

          <motion.p
            className="mt-5 text-center text-sm text-white/60 sm:text-base"
            initial={{ opacity: 0 }}
            animate={{ opacity: launching ? 0 : 1 }}
            transition={{ delay: launching ? 0 : 0.9, duration: 0.6 }}
          >
            Chase your dream company, one problem at a time.
          </motion.p>

          {/* Rocket */}
          <motion.div
            className="mt-12 text-dream-300"
            initial={{ y: 12, opacity: 0 }}
            animate={
              launching
                ? { y: -1000, x: 40, scale: 1.5, opacity: 1 }
                : { y: [0, -12, 0], opacity: 1 }
            }
            transition={
              launching
                ? { duration: 1.8, ease: [0.5, 0, 0.9, 0.4] }
                : { y: { repeat: Infinity, duration: 2.4, ease: "easeInOut" }, opacity: { delay: 1, duration: 0.5 } }
            }
          >
            <Rocket className="h-14 w-14 rotate-[-45deg]" />
          </motion.div>

          {/* Launch button */}
          <motion.button
            onClick={launch}
            className="mt-12 flex items-center gap-2 rounded-full bg-gradient-to-r from-dream-500 to-nebula-500 px-9 py-3.5 text-lg font-semibold text-white shadow-[0_0_50px_-6px_rgba(99,102,241,0.9)]"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: launching ? 0 : 1, y: launching ? 24 : 0 }}
            transition={{ delay: launching ? 0 : 1.4, duration: 0.5 }}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.95 }}
          >
            <Rocket className="h-5 w-5" /> Launch
          </motion.button>

          {!launching && (
            <motion.button
              onClick={skip}
              className="absolute bottom-6 text-xs text-white/40 transition-colors hover:text-white/70"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.8 }}
            >
              skip intro →
            </motion.button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
