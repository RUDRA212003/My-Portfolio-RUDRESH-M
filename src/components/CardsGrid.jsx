import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "../supabase/supabaseClient";

export default function CardsGrid() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCards();
  }, []);

  const fetchCards = async () => {
    try {
      const { data, error } = await supabase
        .from("cards")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCards(data || []);
    } catch (error) {
      console.error("Error fetching cards:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async (card) => {
    const shareId = card.uuid_id || card.id;
    const url = `${window.location.origin}/card/${shareId}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: card.title,
          text: "Check out this item!",
          url,
        });
      } catch (err) {
        console.log("Share canceled", err);
      }
    } else {
      await navigator.clipboard.writeText(url);
      alert("Link copied to clipboard!");
    }
  };

  if (loading) {
    return (
      <section className="py-20 bg-[#0B0F1A]">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="text-yellow-400 text-xl font-bold animate-pulse uppercase tracking-widest">
            Loading...
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 bg-[#0B0F1A] overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        
        {/* Header */}
        <div className="flex flex-col items-center mb-16">
          <h2 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter">
            Explore <span className="text-yellow-400">Collection</span>
          </h2>
          <div className="h-1.5 w-16 bg-yellow-400 mt-4 rounded-full" />
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {cards.map((card) => {
            const routeId = card.uuid_id || card.id;

            return (
              <motion.div
                key={routeId}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="relative group"
              >
                {/* Background Glow on Hover */}
                <div className="absolute inset-0 bg-yellow-400/5 rounded-2xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* MAIN CLICK AREA */}
                <Link 
                  to={`/card/${routeId}`}
                  className="relative block bg-[#111827] rounded-2xl border border-white/5 overflow-hidden transition-all duration-300 hover:border-yellow-400/40 hover:-translate-y-2 shadow-2xl"
                >
                  {card.image_url && (
                    <div className="h-48 overflow-hidden relative border-b border-white/5">
                      <img
                        src={card.image_url}
                        alt={card.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#111827]/80 to-transparent opacity-60" />
                    </div>
                  )}

                  <div className="p-6">
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-yellow-400 transition-colors">
                      {card.title}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="h-px w-4 bg-yellow-400" />
                      <p className="text-[10px] text-yellow-400 font-black uppercase tracking-widest">
                        {card.type}
                      </p>
                    </div>
                  </div>
                </Link>

                {/* SHARE BUTTON */}
                <button
                  onClick={() => handleShare(card)}
                  className="absolute top-3 right-3 z-10 bg-yellow-400 text-black px-3 py-1.5 
                  rounded-lg text-[10px] font-black uppercase tracking-widest shadow-xl 
                  hover:bg-white transition-all duration-300 transform scale-90 opacity-0 group-hover:opacity-100 group-hover:scale-100"
                >
                  Share
                </button>
              </motion.div>
            );
          })}
        </div>

        {/* Empty State */}
        {cards.length === 0 && (
          <div className="text-center text-slate-500 py-20 font-bold uppercase tracking-widest">
            No items available yet.
          </div>
        )}
      </div>
    </section>
  );
}