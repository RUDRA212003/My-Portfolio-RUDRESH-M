import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring, AnimatePresence } from "framer-motion";

export default function CustomCursor() {
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);

  // Smooth spring physics configuration
  const springConfig = { stiffness: 800, damping: 45, mass: 0.4 };
  const cursorX = useSpring(rawX, springConfig);
  const cursorY = useSpring(rawY, springConfig);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isVisible) setIsVisible(true);
      rawX.set(e.clientX);
      rawY.set(e.clientY);
    };

    const handleMouseDown = () => setIsClicked(true);
    const handleMouseUp = () => setIsClicked(false);

    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    const handleMouseOver = (e) => {
      const target = e.target;
      const isInteractive = 
        target.tagName === "A" || 
        target.tagName === "BUTTON" || 
        target.closest("a") || 
        target.closest("button") ||
        target.closest("[role='button']") ||
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT";
      
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
      animate={{
        opacity: isVisible ? 1 : 0,
        scale: isClicked ? 0.92 : 1, // Slight shrink on click for tactile feel
      }}
      transition={{ duration: 0.15 }}
    >
      <div className="relative">
        
        {/* Subtle background glow blush on hover */}
        <AnimatePresence>
          {isHovered && isVisible && (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              className="absolute -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-yellow-400/5 blur-[20px] rounded-full"
              style={{ left: 0, top: 0 }}
            />
          )}
        </AnimatePresence>

        {/* CLICK RIPPLE centered on pointer tip */}
        <AnimatePresence>
          {isClicked && (
            <motion.div
              initial={{ opacity: 0.8, scale: 0 }}
              animate={{ opacity: 0, scale: 2.5 }}
              exit={{ opacity: 0 }}
              className="absolute w-4 h-4 -translate-x-1/2 -translate-y-1/2 rounded-full border border-yellow-400/50 pointer-events-none"
              style={{ left: 0, top: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            />
          )}
        </AnimatePresence>

        <div className="absolute top-0 left-0 pointer-events-none">
          {isHovered ? (
            /* macOS Pointing Hand Pointer */
            <div style={{ transform: "translate(-9px, -5.5px)" }}>
              <svg
                width="26"
                height="26"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{ filter: "drop-shadow(0px 2px 3px rgba(0,0,0,0.35))" }}
              >
                <path
                  d="M12 11h-.5V7a1.5 1.5 0 0 0-3 0v10.5L6.5 16a1.5 1.5 0 0 0-2 2.2l3.8 3.8A3 3 0 0 0 10.5 23H16a4 4 0 0 0 4-4v-5a1.5 1.5 0 0 0-3 0v-1a1.5 1.5 0 0 0-3 0v-1a1.5 1.5 0 0 0-3 0z"
                  fill="white"
                  stroke="black"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          ) : (
            /* macOS Default Black Arrow Pointer */
            <div style={{ transform: "translate(-4.5px, -3px)" }}>
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{ filter: "drop-shadow(0px 2px 3px rgba(0,0,0,0.4))" }}
              >
                <path
                  d="M4.5 3v15.2l3.8-3.8 2.9 6.8 2.9-1.2-2.9-6.8H17L4.5 3z"
                  fill="black"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinejoin="miter"
                />
              </svg>
            </div>
          )}
        </div>

      </div>
    </motion.div>
  );
}