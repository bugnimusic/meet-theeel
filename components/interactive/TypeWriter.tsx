"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface TypeWriterProps {
  text: string;
  speed?: number;
  delay?: number;
  className?: string;
  showCursor?: boolean;
  onComplete?: () => void;
}

export default function TypeWriter({
  text,
  speed = 80,
  delay = 500,
  className = "",
  showCursor = true,
  onComplete,
}: TypeWriterProps) {
  const [displayText, setDisplayText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showCursorState, setShowCursorState] = useState(showCursor);

  useEffect(() => {
    const startTimeout = setTimeout(() => {
      setIsTyping(true);
    }, delay);

    return () => clearTimeout(startTimeout);
  }, [delay]);

  useEffect(() => {
    if (!isTyping) return;

    if (displayText.length < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText(text.slice(0, displayText.length + 1));
      }, speed);
      return () => clearTimeout(timeout);
    } else {
      if (onComplete) onComplete();
      if (!showCursor) {
        setTimeout(() => setShowCursorState(false), 1000);
      }
    }
  }, [displayText, text, speed, isTyping, onComplete, showCursor]);

  return (
    <span className={className}>
      {displayText}
      {showCursorState && (
        <motion.span
          className="inline-block w-[3px] h-[1em] bg-[#a855f7] ml-1 align-middle"
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.8, repeat: Infinity, repeatType: "reverse" }}
        />
      )}
    </span>
  );
}
