"use client";

import { motion } from "framer-motion";

export const LoadingScreen = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-white">
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="text-center"
    >
      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-xl font-light tracking-[0.3em] text-gray-400 uppercase"
      >
        CAVO
      </motion.h1>

      <motion.div
        initial={{ width: 0 }}
        animate={{ width: 40 }}
        transition={{ delay: 0.4, duration: 0.8 }}
        className="h-px bg-gray-300 mx-auto my-3"
      />

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="text-[9px] tracking-[0.2em] text-gray-300 uppercase"
      >
        Minimum Form. Maximum Presence.
      </motion.p>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="flex justify-center gap-1 mt-4"
      >
        {[0, 0.2, 0.4].map((delay, i) => (
          <motion.span
            key={i}
            animate={{
              y: [0, -6, 0],
              opacity: [0.3, 1, 0.3],
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              delay: delay,
            }}
            className="w-1.5 h-1.5 bg-gray-400 rounded-full"
          />
        ))}
      </motion.div>
    </motion.div>
  </div>
);
