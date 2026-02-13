"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useCallback } from "react";
import LetterWheel from "@/components/LetterWheel";

const YES_LETTERS = ["Y", "E", "S"];

interface YesInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  showError: boolean;
  errorMessage: string;
  completed: boolean;
}

export default function YesInput({
  value,
  onChange,
  onSubmit,
  showError,
  errorMessage,
  completed,
}: YesInputProps) {
  const [currentSlide, setCurrentSlide] = useState("");

  const handleSelectionChange = useCallback(
    (selection: string) => {
      setCurrentSlide(selection);
      onChange(selection);
    },
    [onChange]
  );

  const handleSelectionComplete = useCallback(
    (word: string) => {
      setCurrentSlide("");
      onChange(word);
      if (word.length === 3) {
        setTimeout(() => {
          onSubmit();
        }, 300);
      }
    },
    [onChange, onSubmit]
  );

  if (completed) {
    return (
      <motion.div
        className="flex flex-col items-center gap-6 mt-8"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 200 }}
      >
        <motion.div
          className="text-6xl"
          animate={{
            scale: [1, 1.3, 1],
            rotate: [0, 10, -10, 0],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
          }}
        >
          💘
        </motion.div>
        <motion.p
          className="text-3xl font-bold text-white text-center drop-shadow-lg"
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          YAYYY! dapat lang no HAHAHAHAHAHAHA
        </motion.p>
        <motion.p
          className="text-xl text-white/90 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          happy valentine&apos;s day, jhunnice!
        </motion.p>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="flex flex-col items-center gap-2 mt-8"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
    >
      <motion.p
        className="text-xl font-semibold text-white text-center drop-shadow-lg"
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        So... what do you say? 
      </motion.p>

      {/* 3 Letter Boxes */}
      <div className="flex gap-2">
        {[0, 1, 2].map((index) => (
          <motion.div
            key={index}
            className="w-14 h-14 rounded-lg border-2 border-white/50 bg-white/30 backdrop-blur-sm flex items-center justify-center text-2xl font-bold text-pink-600"
            whileHover={{ scale: 1.05 }}
            animate={
              showError
                ? {
                    x: [-5, 5, -5, 5, 0],
                    borderColor: [
                      "rgba(239, 68, 68, 0.8)",
                      "rgba(255, 255, 255, 0.5)",
                    ],
                  }
                : value[index]
                  ? {
                      backgroundColor: "rgba(255, 255, 255, 0.9)",
                      borderColor: "rgba(244, 114, 182, 0.8)",
                    }
                  : {}
            }
            transition={{ duration: 0.4 }}
          >
            {value[index] || ""}
          </motion.div>
        ))}
      </div>

      {/* Error message */}
      <AnimatePresence>
        {showError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white/90 text-pink-600 px-6 py-3 rounded-xl font-semibold text-center max-w-xs shadow-lg"
          >
            {errorMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Letter wheel for Y, E, S */}
      <LetterWheel
        letters={YES_LETTERS}
        currentSelection={currentSlide}
        onSelectionChange={handleSelectionChange}
        onSelectionComplete={handleSelectionComplete}
      />

      <motion.p
        className="text-white/70 text-sm"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        Slide the letters to answer! 
      </motion.p>
    </motion.div>
  );
}
