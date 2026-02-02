import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../supabase/supabaseClient";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

/* -----------------------------------------
    ⭐ DARK HEADER SKELETON
------------------------------------------ */
function HeaderSkeleton() {
  return (
    <div className="bg-[#111827] rounded-3xl p-8 mb-12 border border-white/5 animate-pulse">
      <div className="w-full max-w-md h-48 bg-white/5 rounded-2xl mx-auto mb-6"></div>
      <div className="h-10 bg-white/5 rounded-full w-2/3 mx-auto mb-4"></div>
      <div className="h-4 bg-yellow-400/20 rounded-full w-1/4 mx-auto"></div>
    </div>
  );
}

/* -----------------------------------------
    ⭐ DARK GRID SKELETON
------------------------------------------ */
function GridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="bg-[#111827] rounded-3xl border border-white/5 p-6 animate-pulse"
        >
          <div className="h-48 bg-white/5 rounded-2xl mb-6"></div>
          <div className="h-6 bg-white/5 rounded-full w-3/4 mb-4"></div>
          <div className="h-4 bg-white/5 rounded-full w-full mb-2"></div>
          <div className="h-4 bg-white/5 rounded-full w-5/6"></div>
        </div>
      ))}
    </div>
  );
}

export default function CardDetail() {
  const { id } = useParams();
  const [card, setCard] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [previewItem, setPreviewItem] = useState(null);
  const [hoverTimer, setHoverTimer] = useState(null);

  const isMobile = window.innerWidth < 768;
  const isUUID = /^[0-9a-fA-F-]{36}$/.test(id);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [id]);

  useEffect(() => {
    fetchCardData();
  }, [id]);

  const fetchCardData = async () => {
    setLoading(true);
    const minDelay = new Promise((res) => setTimeout(res, 800));

    try {
      const cardQuery = isUUID
        ? supabase.from("cards").select("*").eq("uuid_id", id).single()
        : supabase.from("cards").select("*").eq("id", id).single();

      const itemsQuery = isUUID
        ? supabase.from("card_items").select("*").eq("card_uuid", id).order("created_at", { ascending: false })
        : supabase.from("card_items").select("*").eq("card_id", id).order("created_at", { ascending: false });

      const [cardRes, itemsRes] = await Promise.all([cardQuery, itemsQuery, minDelay]);

      if (cardRes.error) throw cardRes.error;
      if (itemsRes.error) throw itemsRes.error;

      setCard(cardRes.data);
      setItems(itemsRes.data || []);
    } catch (error) {
      console.error("Error fetching card data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleShareItem = async (item) => {
    const itemId = item.uuid_id || item.id;
    const cardId = card?.uuid_id || card?.id;
    const url = `${window.location.origin}/card/${cardId}/item/${itemId}`;

    if (navigator.share) {
      try {
        await navigator.share({ title: item.title, text: "Check this out!", url });
      } catch (err) { console.log("Canceled", err); }
    } else {
      await navigator.clipboard.writeText(url);
      alert("Link copied!");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0F1A] py-24">
        <div className="max-w-7xl mx-auto px-6">
          <HeaderSkeleton />
          <GridSkeleton />
        </div>
      </div>
    );
  }

  if (!card) {
    return (
      <div className="min-h-screen bg-[#0B0F1A] flex items-center justify-center text-slate-500 font-bold uppercase tracking-widest">
        Record not found.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0F1A] py-24">
      <div className="max-w-7xl mx-auto px-6">

        {/* --- CARD HEADER --- */}
        <div className="bg-[#111827] rounded-[2.5rem] shadow-2xl p-10 mb-16 border border-white/5 relative overflow-hidden">
          {/* Subtle Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-yellow-400/5 blur-[120px]" />
          
          {card.image_url && (
            <motion.img
              src={card.image_url}
              alt={card.title}
              className="w-full max-w-lg h-56 object-contain rounded-2xl mx-auto mb-8 relative z-10 drop-shadow-[0_0_20px_rgba(250,204,21,0.2)]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            />
          )}

          <motion.h1
            className="text-4xl md:text-6xl font-black text-white mb-4 text-center uppercase tracking-tighter"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {card.title}
          </motion.h1>

          <div className="flex justify-center items-center gap-3">
            <div className="h-px w-8 bg-yellow-400" />
            <p className="text-sm md:text-base text-yellow-400 uppercase font-black tracking-[0.3em]">
              {card.type}
            </p>
            <div className="h-px w-8 bg-yellow-400" />
          </div>
        </div>

        {/* --- ITEMS GRID --- */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {items.map((item) => (
            <motion.div
              key={item.uuid_id || item.id}
              variants={itemVariants}
              className="bg-[#111827] rounded-3xl border border-white/5 hover:border-yellow-400/40 overflow-hidden transition-all duration-500 group cursor-pointer shadow-xl"
              onMouseEnter={() => !isMobile && setHoverTimer(setTimeout(() => setPreviewItem(item), 800))}
              onMouseLeave={() => !isMobile && clearTimeout(hoverTimer)}
              onClick={() => isMobile && setPreviewItem(item)}
            >
              <div className="h-56 overflow-hidden relative">
                <img
                  src={item.image_url}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#111827] to-transparent opacity-60" />
              </div>

              <div className="p-8">
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-yellow-400 transition-colors uppercase tracking-tight">
                  {item.title}
                </h3>
                <p className="text-slate-400 mb-6 line-clamp-2 leading-relaxed">
                  {item.description}
                </p>

                <button
                  onClick={(e) => { e.stopPropagation(); handleShareItem(item); }}
                  className="w-full bg-white/5 text-yellow-400 border border-yellow-400/20 text-[10px] font-black uppercase tracking-widest py-3 rounded-xl hover:bg-yellow-400 hover:text-black transition-all"
                >
                  Share 
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {items.length === 0 && (
          <div className="text-center text-slate-600 py-20 font-bold uppercase tracking-widest border border-dashed border-white/10 rounded-3xl">
            Gallery is currently empty.
          </div>
        )}

        {/* --- MODAL (Glassmorphism) --- */}
        <AnimatePresence>
          {previewItem && (
            <motion.div
              className="fixed inset-0 bg-black/90 backdrop-blur-xl flex items-center justify-center p-6 z-[100]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPreviewItem(null)}
            >
              <motion.div
                className="bg-[#111827] border border-white/10 rounded-[2rem] shadow-[0_0_50px_rgba(0,0,0,0.5)] max-w-5xl w-full p-8 flex flex-col md:flex-row gap-10 relative"
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}
              >
                <button onClick={() => setPreviewItem(null)} className="absolute top-6 right-6 text-slate-500 hover:text-yellow-400 text-xl font-bold">✕</button>
                
                <div className="md:w-1/2 w-full flex justify-center items-center bg-[#0B0F1A] rounded-2xl p-4">
                  <img
                    src={previewItem.image_url}
                    alt={previewItem.title}
                    className="w-full max-h-[500px] object-contain rounded-xl drop-shadow-[0_0_30px_rgba(250,204,21,0.1)]"
                  />
                </div>

                <div className="md:w-1/2 w-full flex flex-col justify-center">
                  <h2 className="text-3xl md:text-5xl font-black text-white mb-6 uppercase tracking-tighter">
                    {previewItem.title}
                  </h2>
                  <div className="h-1.5 w-16 bg-yellow-400 rounded-full mb-8" />
                  <p className="text-slate-400 text-lg leading-relaxed whitespace-pre-line font-medium">
                    {previewItem.description}
                  </p>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}