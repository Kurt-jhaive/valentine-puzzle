"use client";

import { useState, useCallback } from "react";

export const VALID_WORDS = ["WILL", "YOU", "BE", "MY", "VALENTINE"] as const;

export type ValidWord = (typeof VALID_WORDS)[number];

export interface GameState {
  solvedWords: Set<ValidWord>;
  currentSelection: string;
  wrongAttempts: number;
  showGiveUp: boolean;
  gaveUp: boolean;
  showYesInput: boolean;
  yesInput: string;
  yesCompleted: boolean;
  lastAttemptCorrect: boolean | null;
  showIncorrectMessage: boolean;
  hintMessage: string;
  showYesError: boolean;
  yesErrorMessage: string;
}

const YES_ERROR_MESSAGES = [
  "SAY YES! IT'S OBVIOUS, IT'S 3 LETTERS! 💕",
  "Come on... just type Y-E-S! 🥺",
  "Hint: It rhymes with 'bless' 💝",
  "Three little letters... Y... E... S... 💗",
  "The answer is literally staring at you! 😘",
  "Just say YES already! 💘",
  "Not that hard... starts with Y! 💖",
];

const WORD_HINTS: Record<string, string[]> = {
  WILL: [
    "Used to express the future.",
    "It shows determination.",
    "4 letters. Starts with W.",
  ],
  YOU: [
    "Refers to the person being addressed.",
    "3 letters. Sounds like 'yoo'.",
    "It's about the reader.",
  ],
  BE: [
    "To exist.",
    "A simple verb.",
    "2 letters. Often used in questions.",
  ],
  MY: [
    "Shows possession.",
    "Belonging to me.",
    "2 letters. Rhymes with 'why'.",
  ],
  VALENTINE: [
    "Associated with February 14.",
    "A person you care about deeply.",
    "9 letters. Starts with V.",
  ],
};


export function useGameLogic() {
  const [gameState, setGameState] = useState<GameState>({
    solvedWords: new Set(),
    currentSelection: "",
    wrongAttempts: 0,
    showGiveUp: false,
    gaveUp: false,
    showYesInput: false,
    yesInput: "",
    yesCompleted: false,
    lastAttemptCorrect: null,
    showIncorrectMessage: false,
    hintMessage: "",
    showYesError: false,
    yesErrorMessage: "",
  });

  const updateSelection = useCallback((selection: string) => {
    setGameState((prev) => ({
      ...prev,
      currentSelection: selection,
      showIncorrectMessage: false,
    }));
  }, []);

  const submitWord = useCallback((word: string) => {
    const upperWord = word.toUpperCase() as ValidWord;

    if (VALID_WORDS.includes(upperWord)) {
      setGameState((prev) => {
        if (prev.solvedWords.has(upperWord)) {
          return {
            ...prev,
            currentSelection: "",
            showIncorrectMessage: true,
            lastAttemptCorrect: false,
          };
        }

        const newSolvedWords = new Set(prev.solvedWords);
        newSolvedWords.add(upperWord);

        const allSolved = VALID_WORDS.every((w) => newSolvedWords.has(w));

        return {
          ...prev,
          solvedWords: newSolvedWords,
          currentSelection: "",
          wrongAttempts: prev.wrongAttempts,
          lastAttemptCorrect: true,
          showIncorrectMessage: false,
          showYesInput: allSolved,
        };
      });
      return true;
    } else {
      setGameState((prev) => {
        const newWrongAttempts = prev.wrongAttempts + 1;
        // Pick a random hint from an unsolved word
        const unsolvedWords = VALID_WORDS.filter((w) => !prev.solvedWords.has(w));
        let hint = "";
        if (unsolvedWords.length > 0) {
          const randomWord = unsolvedWords[Math.floor(Math.random() * unsolvedWords.length)];
          const hints = WORD_HINTS[randomWord];
          hint = hints[Math.floor(Math.random() * hints.length)];
        }
        return {
          ...prev,
          currentSelection: "",
          wrongAttempts: newWrongAttempts,
          showGiveUp: newWrongAttempts >= 4,
          lastAttemptCorrect: false,
          showIncorrectMessage: true,
          hintMessage: hint,
        };
      });
      return false;
    }
  }, []);

  const handleGiveUp = useCallback(() => {
    setGameState((prev) => ({
      ...prev,
      gaveUp: true,
      solvedWords: new Set(VALID_WORDS),
      showYesInput: true,
    }));
  }, []);

  const updateYesInput = useCallback((input: string) => {
    const upperInput = input.toUpperCase().slice(0, 3);
    setGameState((prev) => ({
      ...prev,
      yesInput: upperInput,
      showYesError: false,
    }));
  }, []);

  const submitYes = useCallback(() => {
    setGameState((prev) => {
      if (prev.yesInput === "YES") {
        return {
          ...prev,
          yesCompleted: true,
          showYesError: false,
        };
      } else {
        const randomMessage =
          YES_ERROR_MESSAGES[
            Math.floor(Math.random() * YES_ERROR_MESSAGES.length)
          ];
        return {
          ...prev,
          showYesError: true,
          yesErrorMessage: randomMessage,
          yesInput: "",
        };
      }
    });
  }, []);

  const resetIncorrectMessage = useCallback(() => {
    setGameState((prev) => ({
      ...prev,
      showIncorrectMessage: false,
    }));
  }, []);

  return {
    gameState,
    updateSelection,
    submitWord,
    handleGiveUp,
    updateYesInput,
    submitYes,
    resetIncorrectMessage,
  };
}
