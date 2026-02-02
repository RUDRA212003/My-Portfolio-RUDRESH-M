import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring, AnimatePresence } from "framer-motion";

export default function CustomCursor() {
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [isVisible, setIsVisible] = useState(false); // New state to track if mouse is in window

  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);

  const springConfig = { stiffness: 1000, damping: 50, mass: 0.5 };
  const cursorX = useSpring(rawX, springConfig);
  const cursorY = useSpring(rawY, springConfig);

  useEffect(() => {
    const handleMouseMove = (e) => {
      // If it's the first movement, make it visible
      if (!isVisible) setIsVisible(true);
      rawX.set(e.clientX);
      rawY.set(e.clientY);
    };

    const handleMouseDown = () => setIsClicked(true);
    const handleMouseUp = () => setIsClicked(false);

    const handleMouseLeave = () => setIsVisible(false); // Hide when mouse leaves window
    const handleMouseEnter = () => setIsVisible(true);  // Show when mouse enters window

    const handleMouseOver = (e) => {
      const target = e.target;
      const isInteractive = 
        target.tagName === "A" || 
        target.tagName === "BUTTON" || 
        target.closest("a") || 
        target.closest("button");
      
      setIsHovered(isInteractive);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("mouseover", handleMouseOver);
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("mouseover", handleMouseOver);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
    };
  }, [rawX, rawY, isVisible]);

  return (
    <motion.div
      className="fixed top-0 left-0 pointer-events-none z-[99999] hidden md:block"
      style={{ x: cursorX, y: cursorY, willChange: "transform" }}
      // ⭐ ANIMATE VISIBILITY
      animate={{
        opacity: isVisible ? 1 : 0,
        scale: isVisible ? 1 : 0.5,
      }}
      transition={{ duration: 0.2 }}
    >
      <div className="relative flex items-center justify-center">
        
        {/* ⭐ THE YELLOW BLUSH (Background Glow) */}
        <AnimatePresence>
          {isHovered && isVisible && (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              className="absolute w-24 h-24 bg-yellow-400/10 blur-[30px] rounded-full"
            />
          )}
        </AnimatePresence>

        {/* 1. THE EXPANDING DISC */}
        <motion.div
          animate={{
            scale: isHovered ? 4 : 1,
            backgroundColor: isHovered ? "rgba(250, 204, 21, 0.15)" : "#facc15",
            border: isHovered ? "1px solid rgba(250, 204, 21, 0.5)" : "none",
          }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="absolute w-2 h-2 rounded-full z-10"
        />

        {/* 2. THE SHARP TRIANGLE CURSOR */}
        <motion.div
          animate={{
            rotate: isClicked ? -15 : 0,
            scale: isClicked ? 0.9 : 1,
          }}
          className="relative z-20 origin-top-left"
          style={{ marginLeft: "4px", marginTop: "4px" }}
        >
          <svg
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M5.5 3.21V20.8L10.27 13.92H18.9L5.5 3.21Z"
              fill={isHovered ? "black" : "#facc15"}
              stroke={isHovered ? "#facc15" : "black"}
              strokeWidth="1.5"
            />
          </svg>
        </motion.div>

        {/* 3. CLICK RIPPLE */}
        <AnimatePresence>
          {isClicked && (
            <motion.div
              initial={{ opacity: 1, scale: 0 }}
              animate={{ opacity: 0, scale: 4 }}
              exit={{ opacity: 0 }}
              className="absolute w-4 h-4 rounded-full border-2 border-yellow-400"
            />
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}