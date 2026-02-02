import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '../supabase/supabaseClient'

export default function Resume() {
  const [resume, setResume] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchResume()
  }, [])

  const fetchResume = async () => {
    try {
      const { data, error } = await supabase
        .from('resume')
        .select('*')
        .single()

      if (error && error.code !== 'PGRST116') throw error
      setResume(data)
    } catch (error) {
      console.error('Error fetching resume:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = () => {
    if (resume?.file_url) {
      window.open(resume.file_url, '_blank')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0F1A] flex items-center justify-center">
        <div className="text-yellow-500 text-xl font-bold animate-pulse uppercase tracking-widest">
          Loading Document...
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0B0F1A] py-24">
      <div className="max-w-5xl mx-auto px-6">
        
        {/* HEADER SECTION */}
        <div className="text-center mb-16">
          <motion.h1
            className="text-5xl md:text-4xl font-black text-white uppercase tracking-tighter"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            My <span className="text-yellow-400">Resume</span>
          </motion.h1>
          <div className="h-1.5 w-20 bg-yellow-400 mx-auto mt-6 rounded-full" />
        </div>

        <motion.div
          className="bg-[#111827] rounded-[2.5rem] shadow-2xl p-6 md:p-12 border border-white/5 relative overflow-hidden"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {/* Subtle Glow Background */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-yellow-400/5 blur-[120px] pointer-events-none" />

          {resume?.file_url ? (
            <div className="relative z-10 space-y-10">
              
              {/* DOWNLOAD CARDS */}
              <div className="bg-[#0B0F1A] border border-white/5 rounded-3xl p-8 md:p-10 text-center">
                <p className="text-slate-400 mb-8 text-lg font-medium">
                  Review my professional journey or save a copy for later.
                </p>
                
                <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                  <motion.button
                    onClick={handleDownload}
                    className="w-full sm:w-auto bg-yellow-400 text-black px-8 py-4 rounded-2xl hover:bg-yellow-300 transition-all shadow-xl shadow-yellow-400/10 font-black uppercase tracking-widest text-sm"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    View / Print
                  </motion.button>
                  
                  <motion.a
                    href={resume.file_url}
                    download
                    className="w-full sm:w-auto bg-white/5 text-white border border-white/10 px-8 py-4 rounded-2xl hover:bg-white/10 transition-all font-bold uppercase tracking-widest text-sm"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Direct Download
                  </motion.a>
                </div>
              </div>

              {/* PDF PREVIEWER */}
              <div className="relative group">
                <div className="absolute -inset-1 bg-yellow-400/20 rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
                <iframe
                  src={resume.file_url}
                  className="relative w-full h-[800px] border-2 border-white/5 rounded-[1.5rem] shadow-2xl bg-white"
                  title="Resume Preview"
                />
              </div>
            </div>
          ) : (
            <div className="text-center text-slate-500 py-20 font-bold uppercase tracking-widest border-2 border-dashed border-white/5 rounded-3xl">
              Document currently under revision.
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}