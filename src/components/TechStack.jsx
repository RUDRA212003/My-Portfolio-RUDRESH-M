import { useEffect, useState } from "react";
import supabase from "../supabase/supabaseClient";
import { motion } from "framer-motion";

export default function TechStack() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from("techstack").select("*");
      setItems(data || []);
    }
    load();
  }, []);

  return (
    <section className="w-full py-20 bg-[#0B0F1A]">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Minimal Title */}
        <div className="flex flex-col items-center mb-20">
          <h2 className="text-center text-4xl md:text-4xl font-black text-white uppercase tracking-tighter">
            Known <span className="text-yellow-400">Skills</span>
          </h2>
          <div className="h-1 w-12 bg-yellow-400 mt-4 rounded-full" />
        </div>

        {/* LOGO AREA - No Boxes, Permanent Glow */}
        <div className="flex flex-wrap justify-center items-center gap-12 md:gap-20">
          {items.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.05, duration: 0.8 }}
              className="group relative flex flex-col items-center"
            >
              {/* Permanent Yellow Glow Background */}
              <div className="absolute inset-0 bg-yellow-400/10 rounded-full blur-[40px] pointer-events-none" />
              
              {/* Logo Container */}
              <div className="relative z-10 w-16 h-16 md:w-24 md:h-24 flex items-center justify-center">
                <img
                  src={item.logo_url}
                  alt={item.name}
                  /* Permanent yellow drop shadow filter */
                  className="w-full h-full object-contain filter drop-shadow-[0_0_12px_rgba(250,204,21,0.4)] transition-transform duration-300 group-hover:scale-110"
                />
              </div>

              {/* Permanent Yellow Name Label */}
              <p className="mt-4 text-[10px] md:text-xs font-black uppercase tracking-[0.25em] text-yellow-400/80 group-hover:text-yellow-400 transition-colors">
                {item.name}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}