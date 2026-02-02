import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '../supabase/supabaseClient'

export default function Hero() {
  const [hero, setHero] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchHero()
  }, [])

  const fetchHero = async () => {
    try {
      const { data, error } = await supabase
        .from('hero')
        .select('*')
        .single()

      if (error) throw error
      setHero(data)
    } catch (error) {
      console.error('Error fetching hero:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="h-screen bg-[#0B0F1A] flex items-center justify-center">
        <div className="text-yellow-500 text-xl animate-pulse font-medium">Loading...</div>
      </div>
    )
  }

  return (
    <section className="relative h-screen w-full overflow-hidden bg-[#0B0F1A] flex items-center justify-center">
      
      {/* ⭐ Yellow Theme Background Mesh - Static & Subtle */}
      <div className="absolute inset-0">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-yellow-600 rounded-full mix-blend-screen filter blur-[120px] opacity-[0.07]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-amber-500 rounded-full mix-blend-screen filter blur-[120px] opacity-[0.07]"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Profile Image - Permanent Color & Static */}
          <motion.div
            className="flex justify-center lg:justify-start"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <div className="relative">
              {/* Permanent Soft Yellow Glow */}
              <div className="absolute inset-0 bg-yellow-500 rounded-full blur-3xl opacity-20"></div>
              
              {hero?.photo_url ? (
                <img
                  src={hero.photo_url}
                  alt="Profile"
                  className="relative w-56 h-56 md:w-64 md:h-64 lg:w-80 lg:h-80 rounded-full object-cover border-4 border-yellow-400 shadow-2xl"
                />
              ) : (
                <div className="w-56 h-56 md:w-64 md:h-64 lg:w-80 lg:h-80 rounded-full bg-yellow-400/10 backdrop-blur-sm flex items-center justify-center border-4 border-yellow-400/20 shadow-2xl">
                  <span className="text-6xl text-yellow-400/50">👤</span>
                </div>
              )}
            </div>
          </motion.div>

          {/* Text Content - Clear Hierarchy */}
          <motion.div
            className="text-center lg:text-left"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {/* Small Label */}
            

            {/* Name - Pure White */}
            <motion.h1
              className="text-5xl md:text-7xl lg:text-8xl font-black mb-4 text-white tracking-tighter"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              {hero?.name || 'Your Name'}
            </motion.h1>

            {/* Visual Divider */}
            <motion.div 
              className="h-1.5 w-20 bg-yellow-500 mb-6 mx-auto lg:mx-0 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: 80 }}
              transition={{ delay: 0.7, duration: 0.6 }}
            />

            {/* Designation - Yellow */}
            <motion.p
              className="text-xl md:text-2xl lg:text-3xl text-yellow-400 font-bold tracking-tight mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              {hero?.designation || 'Your Designation'}
            </motion.p>

            {/* Bio Text */}
            
          </motion.div>
        </div>
      </div>
    </section>
  )
}