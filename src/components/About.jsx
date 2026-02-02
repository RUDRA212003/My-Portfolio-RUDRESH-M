import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "../supabase/supabaseClient";

export default function About() {
  const [about, setAbout] = useState(null);
  const [heroImage, setHeroImage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAbout();
    fetchHeroImage();
  }, []);

  const fetchAbout = async () => {
    const { data } = await supabase.from("about").select("*").single();
    setAbout(data);
    setLoading(false);
  };

  const fetchHeroImage = async () => {
    const { data } = await supabase.from("hero").select("photo_url").single();
    if (data?.photo_url) setHeroImage(data.photo_url);
  };

  if (loading || !about) return null;

  const paragraphs = getParagraphs(about.content);

  return (
    <section className="py-16 md:py-24 bg-[#0B0F1A] overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          
          {/* IMAGE SECTION */}
          <motion.div 
            className="w-full lg:w-1/3 flex justify-center"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {heroImage && (
              <div className="relative group">
                {/* Permanent Yellow Glow to match Hero */}
                <div className="absolute -inset-2 bg-yellow-500/10 rounded-full blur-2xl opacity-50 transition duration-1000"></div>
                <img
                  src={heroImage}
                  alt="Profile"
                  className="relative w-48 h-48 md:w-64 md:h-64 lg:w-80 lg:h-80 rounded-full object-cover border-4 border-yellow-400 shadow-2xl"
                />
              </div>
            )}
          </motion.div>

          {/* TEXT SECTION */}
          <div className="w-full lg:w-2/3">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mb-4 text-white text-center lg:text-left tracking-tighter">
                About <span className="text-yellow-400">Me</span>
              </h2>

              {/* Accent Bar */}
              <div className="h-1.5 w-16 bg-yellow-400 rounded-full mb-8 mx-auto lg:mx-0" />
              
              <div className="space-y-6">
                {paragraphs.map((text, index) => (
                  <p
                    key={index}
                    className="text-base md:text-lg lg:text-xl text-slate-300 leading-relaxed text-center lg:text-left font-medium"
                  >
                    {text}
                  </p>
                ))}
              </div>
              
              {/* Secondary Detail Line */}
              <motion.div 
                className="mt-10 flex justify-center lg:justify-start"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
              >
                
              </motion.div>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------
    UTIL
---------------------------------------- */
function getParagraphs(html) {
  if (!html) return [];
  return html
    .split("</p>")
    .map(p => p.replace(/<[^>]+>/g, "").trim())
    .filter(Boolean);
}