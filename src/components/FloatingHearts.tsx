"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

interface Heart {
  id: number;
  x: number;
  delay: number;
  size: number;
  emoji: string;
}

interface FloatingHeartsProps {
  trigger: boolean;
  count?: number;
}

const HEART_EMOJIS = ["💕", "💖", "💗", "💘", "💝", "❤️", "💓", "💞"];

export default function FloatingHearts({
  trigger,
  count = 10,
}: FloatingHeartsProps) {
  const [hearts, setHearts] = useState<Heart[]>([]);

  useEffect(() => {
    if (trigger) {
      const newHearts = Array.from({ length: count }, (_, i) => ({
        id: Date.now() + i,
        x: Math.random() * 100,
        delay: Math.random() * 0.5,
        size: Math.random() * 1.5 + 0.8,
        emoji: HEART_EMOJIS[Math.floor(Math.random() * HEART_EMOJIS.length)],
      }));
      setHearts(newHearts);

      const timeout = setTimeout(() => {
        setHearts([]);
      }, 3000);

      return () => clearTimeout(timeout);
    }
  }, [trigger, count]);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
      <AnimatePresence>
        {hearts.map((heart) => (
          <motion.div
            key={heart.id}
            className="absolute text-2xl"
            style={{
              left: `${heart.x}%`,
              fontSize: `${heart.size}rem`,
            }}
            initial={{ y: "100vh", opacity: 1, rotate: 0 }}
            animate={{
              y: "-20vh",
              opacity: [1, 1, 0],
              rotate: [0, 15, -15, 0],
              x: [0, 20, -20, 0],
            }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 2.5,
              delay: heart.delay,
              ease: "easeOut",
            }}
          >
            {heart.emoji}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
