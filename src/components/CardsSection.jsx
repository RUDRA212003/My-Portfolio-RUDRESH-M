import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { supabase } from '../supabase/supabaseClient'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
    },
  },
}

export default function CardsSection() {
  const [cards, setCards] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCards()
  }, [])

  const fetchCards = async () => {
    try {
      const { data, error } = await supabase
        .from('cards')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setCards(data || [])
    } catch (error) {
      console.error('Error fetching cards:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleShare = async (card) => {
    const shareId = card.uuid_id || card.id
    const url = `${window.location.origin}/card/${shareId}`
    const fullTitle = card.title

    if (navigator.share) {
      try {
        await navigator.share({
          title: fullTitle,
          text: fullTitle,
          url,
        })
      } catch (err) {
        console.log("Share canceled", err)
      }
    } else {
      await navigator.clipboard.writeText(url)
      alert(`Link for "${card.title}" copied!`)
    }
  }

  if (loading) {
    return (
      <section className="py-20 bg-[#0B0F1A]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center text-yellow-500 font-bold animate-pulse uppercase tracking-widest">
            Loading Gallery...
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-24 bg-[#0B0F1A] overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* SECTION HEADER */}
        <div className="flex flex-col items-center mb-16">
          <motion.h2
            className="text-4xl md:text-4xl font-black text-white uppercase tracking-tighter"
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Explore <span className="text-yellow-400">More</span>
          </motion.h2>
          <div className="h-1.5 w-16 bg-yellow-400 mt-4 rounded-full" />
        </div>

        {/* CARDS GRID */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
        >
          {cards.map((card) => {
            const routeId = card.uuid_id || card.id

            return (
              <motion.div
                key={routeId}
                variants={cardVariants}
                className="group relative"
              >
                <div className="relative">
                  {/* MAIN CARD: Dark Theme Glass-morphism */}
                  <Link
                    to={`/card/${routeId}`}
                    className="block bg-[#111827] rounded-2xl border border-white/5 shadow-2xl 
                    hover:border-yellow-400/40 transition-all duration-500 overflow-hidden h-full"
                  >
                    {card.image_url && (
                      <div className="h-44 overflow-hidden relative border-b border-white/5">
                        <motion.img
                          src={card.image_url}
                          alt={card.title}
                          className="w-full h-full object-cover"
                          whileHover={{ scale: 1.05 }}
                          transition={{ duration: 0.6 }}
                        />
                        {/* Permanent Yellow Tint Overlay */}
                        <div className="absolute inset-0 bg-yellow-400/5 mix-blend-overlay"></div>
                      </div>
                    )}
                    
                    <div className="p-6">
                      <h3 className="text-lg font-bold text-white mb-2 group-hover:text-yellow-400 transition-colors duration-300">
                        {card.title}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className="h-px w-4 bg-yellow-400"></span>
                        <p className="text-[10px] text-yellow-400 uppercase font-black tracking-widest">
                          {card.type}
                        </p>
                      </div>
                    </div>
                  </Link>

                  {/* SHARE BUTTON: Minimalist Yellow */}
                  <button
                    onClick={() => handleShare(card)}
                    className="absolute top-3 right-3 bg-yellow-400 text-black font-black
                    text-[9px] uppercase tracking-widest px-3 py-1.5 rounded-lg shadow-xl 
                    hover:bg-white transition-all duration-300"
                  >
                    Share
                  </button>
                </div>
              </motion.div>
            )
          })}
        </motion.div>

        {/* EMPTY STATE */}
        {cards.length === 0 && (
          <motion.div
            className="text-center text-slate-500 py-20 bg-white/5 rounded-3xl border border-white/5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            No entries available in this collection.
          </motion.div>
        )}
      </div>
    </section>
  )
}