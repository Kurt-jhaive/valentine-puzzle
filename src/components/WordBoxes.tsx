"use client";

import { motion, AnimatePresence } from "framer-motion";
import { VALID_WORDS, ValidWord } from "@/hooks/useGameLogic";

interface WordBoxesProps {
  solvedWords: Set<ValidWord>;
  gaveUp: boolean;
  animateToCenter?: boolean;
  showQuestionMark?: boolean;
}

export default function WordBoxes({
  solvedWords,
  gaveUp,
  animateToCenter = false,
  showQuestionMark = false,
}: WordBoxesProps) {
  const containerVariants = {
    normal: {
      y: 0,
      scale: 1,
    },
    centered: {
      y: 0,
      scale: 1.1,
      transition: {
        duration: 0.8,
        ease: "easeInOut" as const,
      },
    },
  };

  const wordVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
      },
    }),
  };

  const letterVariants = {
    empty: {
      backgroundColor: "rgba(255, 255, 255, 0.3)",
      borderColor: "rgba(255, 255, 255, 0.5)",
    },
    filled: {
      backgroundColor: "rgba(255, 255, 255, 0.9)",
      borderColor: "rgba(244, 114, 182, 0.8)",
      boxShadow: "0 0 20px rgba(244, 114, 182, 0.5)",
    },
    gaveUpFill: (i: number) => ({
      backgroundColor: "rgba(255, 255, 255, 0.9)",
      borderColor: "rgba(244, 114, 182, 0.8)",
      boxShadow: "0 0 20px rgba(244, 114, 182, 0.5)",
      transition: {
        delay: i * 0.05,
        duration: 0.3,
      },
    }),
  };

  return (
    <motion.div
      className="flex flex-col items-center gap-3"
      variants={containerVariants}
      animate={animateToCenter ? "centered" : "normal"}
    >
      {VALID_WORDS.map((word, wordIndex) => {
        const isSolved = solvedWords.has(word);

        return (
          <motion.div
            key={word}
            className="flex items-center gap-1"
            variants={wordVariants}
            initial="hidden"
            animate="visible"
            custom={wordIndex}
          >
            {/* Star icon for solved words (left side) */}
            <div className="w-8 flex items-center justify-center">
              <AnimatePresence>
                {isSolved && (
                  <motion.span
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0 }}
                    transition={{ type: "spring", stiffness: 200, damping: 10 }}
                    className="text-xl"
                  >
                    ⭐
                  </motion.span>
                )}
              </AnimatePresence>
            </div>

            {/* Letter boxes */}
            <div className="flex gap-1">
              {word.split("").map((letter, letterIndex) => (
                <motion.div
                  key={`${word}-${letterIndex}`}
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg border-2 flex items-center justify-center text-lg sm:text-xl font-bold"
                  variants={letterVariants}
                  initial="empty"
                  animate={
                    isSolved
                      ? gaveUp
                        ? "gaveUpFill"
                        : "filled"
                      : "empty"
                  }
                  custom={wordIndex * 10 + letterIndex}
                  whileHover={{ scale: 1.05 }}
                >
                  <AnimatePresence mode="wait">
                    {isSolved && (
                      <motion.span
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{
                          scale: 1,
                          opacity: 1,
                          transition: {
                            delay: gaveUp
                              ? (wordIndex * 10 + letterIndex) * 0.05
                              : letterIndex * 0.05,
                          },
                        }}
                        className="text-pink-600"
                      >
                        {letter}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>

            {/* Question mark after VALENTINE (before right star) */}
            {word === "VALENTINE" && showQuestionMark && (
              <motion.div
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg border-2 flex items-center justify-center text-lg sm:text-xl font-bold ml-1"
                initial={{ scale: 0, opacity: 0 }}
                animate={{
                  scale: 1,
                  opacity: 1,
                  backgroundColor: "rgba(255, 255, 255, 0.9)",
                  borderColor: "rgba(244, 114, 182, 0.8)",
                  boxShadow: "0 0 20px rgba(244, 114, 182, 0.5)",
                }}
                transition={{
                  type: "spring",
                  stiffness: 200,
                  damping: 15,
                  delay: 0.3,
                }}
              >
                <motion.span
                  className="text-pink-600"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  ?
                </motion.span>
              </motion.div>
            )}

            {/* Star icon for solved words (right side) */}
            <div className="w-8 flex items-center justify-center">
              <AnimatePresence>
                {isSolved && (
                  <motion.span
                    initial={{ scale: 0, rotate: 180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0 }}
                    transition={{
                      type: "spring",
                      stiffness: 200,
                      damping: 10,
                      delay: 0.2,
                    }}
                    className="text-xl"
                  >
                    ⭐
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
