"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import LetterWheel from "@/components/LetterWheel";
import WordBoxes from "@/components/WordBoxes";
import FloatingHearts from "@/components/FloatingHearts";
import YesInput from "@/components/YesInput";
import { useGameLogic, VALID_WORDS } from "@/hooks/useGameLogic";

// Letters needed: W I L L Y O U B E M Y V A L E N T I N E
// Include duplicates so all words can be spelled: WILL (2×L), VALENTINE (2×E, 2×N)
const WHEEL_LETTERS = ["W", "I", "L", "L", "Y", "O", "U", "B", "E", "E", "M", "V", "A", "N", "N", "T"];

interface BackgroundHeart {
  left: number;
  top: number;
  fontSize: number;
  duration: number;
  delay: number;
}

export default function ValentineGame() {
  const {
    gameState,
    updateSelection,
    submitWord,
    handleGiveUp,
    updateYesInput,
    submitYes,
    resetIncorrectMessage,
  } = useGameLogic();

  const [showHearts, setShowHearts] = useState(false);
  const [showShake, setShowShake] = useState(false);
  const [backgroundHearts, setBackgroundHearts] = useState<BackgroundHeart[]>([]);
  const [shuffledLetters, setShuffledLetters] = useState<string[]>([]);

  // Shuffle helper
  const shuffleArray = useCallback((arr: string[]) => {
    const shuffled = [...arr];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }, []);

  // Auto-shuffle on load
  useEffect(() => {
    setShuffledLetters(shuffleArray(WHEEL_LETTERS));
  }, [shuffleArray]);

  const handleShuffle = useCallback(() => {
    setShuffledLetters(shuffleArray(WHEEL_LETTERS));
  }, [shuffleArray]);

  // Generate random background hearts on client-side only to avoid hydration mismatch
  useEffect(() => {
    setBackgroundHearts(
      Array.from({ length: 20 }, () => ({
        left: Math.random() * 100,
        top: Math.random() * 100,
        fontSize: Math.random() * 30 + 20,
        duration: 4 + Math.random() * 2,
        delay: Math.random() * 2,
      }))
    );
  }, []);

  const allWordsSolved = VALID_WORDS.every((word) =>
    gameState.solvedWords.has(word)
  );

  const handleSelectionComplete = useCallback(
    (word: string) => {
      if (word.length > 0) {
        const isCorrect = submitWord(word);
        if (isCorrect) {
          setShowHearts(true);
          setTimeout(() => setShowHearts(false), 100);
        } else {
          setShowShake(true);
          setTimeout(() => setShowShake(false), 500);
        }
      }
    },
    [submitWord]
  );

  useEffect(() => {
    if (gameState.showIncorrectMessage) {
      const timeout = setTimeout(resetIncorrectMessage, 2000);
      return () => clearTimeout(timeout);
    }
  }, [gameState.showIncorrectMessage, resetIncorrectMessage]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-400 via-rose-400 to-red-400 flex flex-col items-center justify-between py-8 px-4 overflow-hidden">
      {/* Floating hearts effect */}
      <FloatingHearts trigger={showHearts} count={15} />

      {/* Background decorations */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {backgroundHearts.map((heart, i) => (
          <motion.div
            key={i}
            className="absolute text-pink-300/30"
            style={{
              left: `${heart.left}%`,
              top: `${heart.top}%`,
              fontSize: `${heart.fontSize}px`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.2, 0.4, 0.2],
              rotate: [0, 10, -10, 0],
            }}
            transition={{
              duration: heart.duration,
              repeat: Infinity,
              delay: heart.delay,
            }}
          >
            💕
          </motion.div>
        ))}
      </div>

      {/* Word boxes section */}
      <motion.div
        className="flex-1 flex items-center justify-center z-10"
        animate={showShake ? { x: [-10, 10, -10, 10, 0] } : {}}
        transition={{ duration: 0.4 }}
      >
        <WordBoxes
          solvedWords={gameState.solvedWords}
          gaveUp={gameState.gaveUp}
          animateToCenter={gameState.showYesInput}
          showQuestionMark={gameState.showYesInput}
        />
      </motion.div>

      {/* Yes Input Section */}
      <AnimatePresence>
        {gameState.showYesInput && (
          <YesInput
            value={gameState.yesInput}
            onChange={updateYesInput}
            onSubmit={submitYes}
            showError={gameState.showYesError}
            errorMessage={gameState.yesErrorMessage}
            completed={gameState.yesCompleted}
          />
        )}
      </AnimatePresence>

      {/* Incorrect message with hint */}
      <AnimatePresence>
        {gameState.showIncorrectMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.8 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/95 text-pink-600 px-8 py-4 rounded-2xl font-bold text-center shadow-xl z-50 max-w-xs"
          >
            <p className="text-xl">Not the word of love </p>
            {gameState.hintMessage && (
              <p className="text-sm font-medium text-pink-400 mt-2">
                {gameState.hintMessage}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom section - Letter wheel and controls */}
      {!gameState.showYesInput && (
        <div className="flex flex-col items-center gap-4 z-10">
          <LetterWheel
            letters={shuffledLetters}
            currentSelection={gameState.currentSelection}
            onSelectionChange={updateSelection}
            onSelectionComplete={handleSelectionComplete}
            onShuffle={handleShuffle}
            disabled={allWordsSolved}
          />

          {/* Give up button */}
          <AnimatePresence>
            {gameState.showGiveUp && !gameState.gaveUp && (
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                onClick={handleGiveUp}
                className="px-6 py-3 bg-white/20 backdrop-blur-sm border-2 border-white/50 rounded-full text-white font-semibold hover:bg-white/30 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Give Up?
              </motion.button>
            )}
          </AnimatePresence>

          {/* Wrong attempts counter */}
          {gameState.wrongAttempts > 0 && !gameState.gaveUp && (
            <motion.p
              className="text-white/80 text-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              Wrong attempts: {gameState.wrongAttempts}/4
            </motion.p>
          )}
        </div>
      )}

      {/* Final celebration */}
      <AnimatePresence>
        {gameState.yesCompleted && (
          <motion.div
            className="fixed inset-0 pointer-events-none z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {[...Array(30)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute text-4xl"
                style={{
                  left: `${Math.random() * 100}%`,
                }}
                initial={{ y: "100vh", opacity: 1 }}
                animate={{
                  y: "-20vh",
                  rotate: [0, 360],
                }}
                transition={{
                  duration: 3 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              >
                {["💕", "💖", "💗", "💘", "💝", "❤️", "🎉", "✨"][
                  Math.floor(Math.random() * 8)
                ]}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
