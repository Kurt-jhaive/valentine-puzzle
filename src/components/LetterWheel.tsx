"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface LetterWheelProps {
  letters: string[];
  currentSelection: string;
  onSelectionChange: (selection: string) => void;
  onSelectionComplete: (selection: string) => void;
  onShuffle?: () => void;
  disabled?: boolean;
}

export default function LetterWheel({
  letters,
  currentSelection,
  onSelectionChange,
  onSelectionComplete,
  onShuffle,
  disabled = false,
}: LetterWheelProps) {
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const letterRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  // Use a ref to avoid stale closure issues during pointer events
  const selectedIndicesRef = useRef<number[]>([]);
  const isDraggingRef = useRef(false);

  const radius = letters.length <= 5 ? 70 : letters.length > 13 ? 130 : 110;
  const containerSize = letters.length <= 5 ? 200 : letters.length > 13 ? 320 : 280;
  const centerX = containerSize / 2;
  const centerY = containerSize / 2;

  const getLetterPosition = (index: number, total: number) => {
    const angle = (index * 2 * Math.PI) / total - Math.PI / 2;
    return {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
    };
  };

  const getLetterAtPoint = useCallback(
    (clientX: number, clientY: number): number | null => {
      for (const [index, element] of letterRefs.current.entries()) {
        const rect = element.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const distance = Math.sqrt(
          Math.pow(clientX - centerX, 2) + Math.pow(clientY - centerY, 2)
        );
        if (distance < 30) {
          return index;
        }
      }
      return null;
    },
    []
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (disabled) return;
      e.preventDefault();
      isDraggingRef.current = true;
      setIsDragging(true);
      const letterIndex = getLetterAtPoint(e.clientX, e.clientY);
      if (letterIndex !== null) {
        selectedIndicesRef.current = [letterIndex];
        setSelectedIndices([letterIndex]);
        onSelectionChange(letters[letterIndex]);
      }
    },
    [disabled, getLetterAtPoint, letters, onSelectionChange]
  );

  const handlePointerMove = useCallback(
    (e: PointerEvent) => {
      if (!isDraggingRef.current || disabled) return;
      const letterIndex = getLetterAtPoint(e.clientX, e.clientY);
      if (letterIndex !== null && !selectedIndicesRef.current.includes(letterIndex)) {
        const newIndices = [...selectedIndicesRef.current, letterIndex];
        selectedIndicesRef.current = newIndices;
        setSelectedIndices(newIndices);
        onSelectionChange(newIndices.map((i) => letters[i]).join(""));
      }
    },
    [disabled, getLetterAtPoint, letters, onSelectionChange]
  );

  const handlePointerUp = useCallback(() => {
    if (isDraggingRef.current && selectedIndicesRef.current.length > 0) {
      const word = selectedIndicesRef.current.map((i) => letters[i]).join("");
      onSelectionComplete(word);
    }
    isDraggingRef.current = false;
    selectedIndicesRef.current = [];
    setIsDragging(false);
    setSelectedIndices([]);
  }, [letters, onSelectionComplete]);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("pointermove", handlePointerMove);
      window.addEventListener("pointerup", handlePointerUp);
      return () => {
        window.removeEventListener("pointermove", handlePointerMove);
        window.removeEventListener("pointerup", handlePointerUp);
      };
    }
  }, [isDragging, handlePointerMove, handlePointerUp]);

  const renderConnectionLines = () => {
    if (selectedIndices.length < 2) return null;

    return (
      <svg
        className="absolute inset-0 pointer-events-none"
        width={containerSize}
        height={containerSize}
      >
        {selectedIndices.slice(0, -1).map((fromIndex, i) => {
          const toIndex = selectedIndices[i + 1];
          const fromPos = getLetterPosition(fromIndex, letters.length);
          const toPos = getLetterPosition(toIndex, letters.length);
          return (
            <motion.line
              key={`line-${i}-${fromIndex}-${toIndex}`}
              x1={fromPos.x}
              y1={fromPos.y}
              x2={toPos.x}
              y2={toPos.y}
              stroke="rgba(255, 182, 193, 0.8)"
              strokeWidth="4"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.1 }}
            />
          );
        })}
      </svg>
    );
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Current selection display */}
      <motion.div
        className="h-12 flex items-center justify-center min-w-[200px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <AnimatePresence mode="wait">
          {currentSelection && (
            <motion.div
              key={currentSelection}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="text-3xl font-bold text-white tracking-widest drop-shadow-lg"
            >
              {currentSelection}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Letter wheel */}
      <div
        ref={containerRef}
        className="relative touch-none select-none"
        style={{ width: containerSize, height: containerSize }}
        onPointerDown={handlePointerDown}
      >
        {/* Background circle */}
        <div className="absolute inset-4 rounded-full bg-white/20 backdrop-blur-sm border-2 border-white/30" />

        {/* Connection lines */}
        {renderConnectionLines()}

        {/* Letters */}
        {letters.map((letter, index) => {
          const pos = getLetterPosition(index, letters.length);
          const isSelected = selectedIndices.includes(index);

          return (
            <motion.div
              key={`${letter}-${index}`}
              ref={(el) => {
                if (el) letterRefs.current.set(index, el);
              }}
              className={`absolute w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold cursor-pointer transition-all duration-150 ${
                isSelected
                  ? "bg-pink-400 text-white scale-110 shadow-lg shadow-pink-400/50"
                  : "bg-white text-pink-600 hover:bg-pink-100"
              } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
              style={{
                left: pos.x - 24,
                top: pos.y - 24,
              }}
              whileHover={!disabled && !isDragging ? { scale: 1.1 } : {}}
              whileTap={!disabled ? { scale: 0.95 } : {}}
              animate={
                isSelected
                  ? {
                      boxShadow: [
                        "0 0 0 0 rgba(244, 114, 182, 0)",
                        "0 0 20px 5px rgba(244, 114, 182, 0.5)",
                        "0 0 0 0 rgba(244, 114, 182, 0)",
                      ],
                    }
                  : {}
              }
              transition={
                isSelected
                  ? { duration: 0.5, repeat: Infinity }
                  : { duration: 0.2 }
              }
            >
              {letter}
            </motion.div>
          );
        })}

        {/* Center shuffle button */}
        <motion.button
          type="button"
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 cursor-pointer bg-transparent border-none outline-none"
          onClick={(e) => {
            e.stopPropagation();
            onShuffle?.();
          }}
          whileHover={{ scale: 1.3 }}
          whileTap={{ scale: 0.9, rotate: 180 }}
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          title="Shuffle letters"
        >
          <span className="text-4xl">💕</span>
        </motion.button>
      </div>
    </div>
  );
}
