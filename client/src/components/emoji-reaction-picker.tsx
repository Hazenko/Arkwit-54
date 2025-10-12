import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, ThumbsUp, Laugh, Frown, Angry, Sparkles } from "lucide-react";

export const REACTIONS = [
  { type: "love", emoji: "❤️", label: "حب", icon: Heart, color: "#e74c3c" },
  { type: "like", emoji: "👍", label: "إعجاب", icon: ThumbsUp, color: "#3498db" },
  { type: "haha", emoji: "😂", label: "ضحك", icon: Laugh, color: "#f39c12" },
  { type: "wow", emoji: "😮", label: "تعجب", icon: Sparkles, color: "#9b59b6" },
  { type: "sad", emoji: "😢", label: "حزن", icon: Frown, color: "#95a5a6" },
  { type: "angry", emoji: "😡", label: "غضب", icon: Angry, color: "#e67e22" },
];

interface EmojiReactionPickerProps {
  onReactionSelect: (reactionType: string) => void;
  currentReaction?: string;
  disabled?: boolean;
}

export function EmojiReactionPicker({
  onReactionSelect,
  currentReaction,
  disabled = false,
}: EmojiReactionPickerProps) {
  const [showPicker, setShowPicker] = useState(false);
  const [selectedReaction, setSelectedReaction] = useState(currentReaction);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const buttonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSelectedReaction(currentReaction);
  }, [currentReaction]);

  const handleMouseDown = () => {
    if (disabled) return;
    longPressTimer.current = setTimeout(() => {
      setShowPicker(true);
    }, 500);
  };

  const handleMouseUp = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const handleClick = () => {
    if (disabled) return;
    if (!showPicker) {
      if (selectedReaction) {
        onReactionSelect("");
        setSelectedReaction(undefined);
      } else {
        onReactionSelect("like");
        setSelectedReaction("like");
      }
    }
  };

  const handleReactionSelect = (reactionType: string) => {
    onReactionSelect(reactionType);
    setSelectedReaction(reactionType);
    setShowPicker(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    handleMouseDown();
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    handleMouseUp();
    if (!showPicker) {
      handleClick();
    }
  };

  const currentReactionData = REACTIONS.find((r) => r.type === selectedReaction);

  return (
    <div className="relative" ref={buttonRef}>
      <motion.div
        className={`cursor-pointer select-none ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onClick={handleClick}
        whileTap={{ scale: disabled ? 1 : 0.9 }}
        data-testid="reaction-button"
      >
        {currentReactionData ? (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full"
            style={{ backgroundColor: `${currentReactionData.color}20` }}
          >
            <span className="text-xl" data-testid={`reaction-${currentReactionData.type}`}>
              {currentReactionData.emoji}
            </span>
            <span className="text-xs font-medium" style={{ color: currentReactionData.color }}>
              {currentReactionData.label}
            </span>
          </motion.div>
        ) : (
          <motion.div
            className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
            whileHover={{ scale: disabled ? 1 : 1.05 }}
          >
            <ThumbsUp className="w-4 h-4" />
            <span className="text-xs font-medium">إعجاب</span>
          </motion.div>
        )}
      </motion.div>

      <AnimatePresence>
        {showPicker && (
          <>
            <motion.div
              className="fixed inset-0 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPicker(false)}
              data-testid="reaction-picker-overlay"
            />
            <motion.div
              className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50"
              initial={{ opacity: 0, y: 10, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.8 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              data-testid="reaction-picker"
            >
              <div className="bg-white dark:bg-gray-900 rounded-full shadow-2xl border border-gray-200 dark:border-gray-700 px-2 py-2 flex gap-1">
                {REACTIONS.map((reaction, index) => (
                  <motion.button
                    key={reaction.type}
                    className="relative group"
                    onClick={() => handleReactionSelect(reaction.type)}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.3, y: -8 }}
                    whileTap={{ scale: 0.9 }}
                    data-testid={`reaction-option-${reaction.type}`}
                  >
                    <div className="relative">
                      <span className="text-2xl block transition-transform">
                        {reaction.emoji}
                      </span>
                      <motion.div
                        className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none"
                        initial={{ opacity: 0 }}
                        whileHover={{ opacity: 1 }}
                      >
                        {reaction.label}
                      </motion.div>
                    </div>
                  </motion.button>
                ))}
              </div>
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-3 h-3 bg-white dark:bg-gray-900 border-r border-b border-gray-200 dark:border-gray-700 rotate-45" />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
