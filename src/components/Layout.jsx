import { Outlet, Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import SmoothScroll from "./SmoothScroll";
import { useEffect, useState } from "react";
import CustomCursor from "./CustomCursor"; // Import the cursor

export default function Layout() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");

  const [scrolled, setScrolled] = useState(false);
  const [routeLoading, setRouteLoading] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setRouteLoading(true);
    const timer = setTimeout(() => setRouteLoading(false), 500);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  const navbarBg = scrolled
    ? "bg-[#0B0F1A]/95 backdrop-blur-md border-b border-yellow-400/10 py-4 shadow-2xl"
    : "bg-transparent py-7";

  const content = (
    <div className="min-h-screen bg-[#0B0F1A] text-slate-300 selection:bg-yellow-400 selection:text-black">
      {/* 🖱️ CUSTOM CURSOR MOUNTED AT ROOT */}
      <CustomCursor />

      <AnimatePresence>
        {routeLoading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed top-0 left-0 w-full h-[2px] z-[9999] bg-yellow-400 shadow-[0_0_10px_#facc15]"
          />
        )}
      </AnimatePresence>

      <motion.nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${navbarBg}`}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex justify-between items-center">
            <Link to="/" className="group relative">
              <span className="text-xl md:text-2xl font-black text-white uppercase tracking-tighter">
                Rudresh <span className="text-yellow-400">M</span>
              </span>
              <span className="inline-block w-1.5 h-1.5 bg-yellow-400 rounded-full ml-1 mb-1"></span>
            </Link>

            <div className="flex items-center space-x-6 md:space-x-10">
              {["Home", "Projects", "Resume"].map((item) => (
                <Link
                  key={item}
                  to={item === "Home" ? "/" : `/${item.toLowerCase()}`}
                  className={`text-[10px] md:text-xs uppercase tracking-[0.25em] font-bold ${
                    location.pathname === (item === "Home" ? "/" : `/${item.toLowerCase()}`)
                      ? "text-yellow-400"
                      : "text-white/60 hover:text-yellow-400 transition-colors"
                  }`}
                >
                  {item}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </motion.nav>

      <main className={location.pathname === "/" ? "" : "pt-24"}>
        <Outlet />
      </main>

      <footer className="bg-[#080C14] border-t border-yellow-400/5 py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 text-center md:text-left">
          <div className="flex flex-col md:flex-row justify-between items-center gap-10">
            <div>
              <h3 className="text-white font-black text-3xl uppercase tracking-tighter mb-2">
                Rudresh <span className="text-yellow-400">Manjunath</span>
              </h3>
              <p className="text-slate-500 text-sm max-w-xs font-medium">
                Designing and developing digital solutions with precision.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );

  if (isAdminRoute) return content;
  return <SmoothScroll>{content}</SmoothScroll>;
}