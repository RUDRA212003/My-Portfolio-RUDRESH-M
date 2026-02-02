import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { supabase } from '../supabase/supabaseClient'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
}

const cardVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
}

export default function ProjectsSection() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedProject, setSelectedProject] = useState(null)
  const [showFeedbackForm, setShowFeedbackForm] = useState(false)
  const [hoverTimer, setHoverTimer] = useState(null)

  const [feedbackForm, setFeedbackForm] = useState({
    name: '',
    email: '',
    message: '',
  })

  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false })

      if (error) throw error
      setProjects(data || [])
    } catch (error) {
      console.error('Error fetching projects:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault()
    if (!selectedProject) return

    setSubmitting(true)
    try {
      const { error } = await supabase.from('project_feedback').insert({
        project_id: selectedProject.id,
        name: feedbackForm.name,
        email: feedbackForm.email,
        message: feedbackForm.message,
      })

      if (error) throw error

      setSubmitted(true)
      setFeedbackForm({ name: '', email: '', message: '' })

      setTimeout(() => {
        setSubmitted(false)
        setShowFeedbackForm(false)
      }, 3000)
    } catch (error) {
      console.error('Error submitting feedback:', error)
      alert('Failed to submit feedback. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <section className="py-20 bg-[#0B0F1A]">
        <div className="max-w-7xl mx-auto px-4 text-center text-yellow-500 animate-pulse">
          Loading Projects...
        </div>
      </section>
    )
  }

  return (
    <section className="py-24 bg-[#0B0F1A] overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.div
          className="flex justify-between items-end mb-16"
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div>
            <h2 className="text-4xl md:text-4xl font-black text-white uppercase tracking-tighter">
              Featured <span className="text-yellow-400">Projects</span>
            </h2>
            <div className="h-1.5 w-20 bg-yellow-400 mt-4 rounded-full" />
          </div>

          <Link to="/projects">
            <motion.div
              className="text-yellow-400 hover:text-yellow-300 font-bold text-sm uppercase tracking-widest flex items-center cursor-pointer pb-2"
              whileHover={{ x: 5 }}
            >
              View All →
            </motion.div>
          </Link>
        </motion.div>

        {/* Horizontal Scroll Area */}
        <motion.div
          className="flex gap-8 overflow-x-auto scrollbar-hide pb-12 px-2"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          style={{ scrollSnapType: "x mandatory" }}
        >
          {projects.map((project) => (
            <motion.div
              key={project.id}
              variants={cardVariants}
              className="group relative"
              style={{ scrollSnapAlign: "start" }}
              onMouseEnter={() => {
                const timer = setTimeout(() => {
                  setSelectedProject(project)
                  setShowFeedbackForm(false)
                }, 1200)
                setHoverTimer(timer)
              }}
              onMouseLeave={() => clearTimeout(hoverTimer)}
              whileHover={{ y: -10 }}
            >
              {/* Main Card Item */}
              <div className="bg-[#111827] rounded-3xl border border-white/5 shadow-2xl hover:border-yellow-400/50 transition-all duration-500 min-w-[300px] max-w-[320px] flex flex-col overflow-hidden h-full">
                
                {/* Image Section */}
                <div className="aspect-video w-full overflow-hidden bg-[#0B0F1A] flex items-center justify-center relative border-b border-white/5">
                    {/* Permanent Glow behind image */}
                    <div className="absolute inset-0 bg-yellow-400/5 blur-2xl" />
                  {project.image_url ? (
                    <img
                      src={project.image_url}
                      alt={project.title}
                      className="w-full h-full object-contain p-6 transition-transform duration-700 group-hover:scale-110 relative z-10"
                    />
                  ) : (
                    <div className="text-slate-500 text-xs font-bold uppercase tracking-widest">No Preview</div>
                  )}
                </div>

                {/* Content Section */}
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white group-hover:text-yellow-400 transition-colors line-clamp-1">
                      {project.title}
                    </h3>
                    <p className="text-slate-400 text-sm mt-3 line-clamp-2 leading-relaxed">
                      {project.description}
                    </p>
                  </div>

                  <div className="flex gap-3 mt-6">
                    {project.github_link && (
                      <a
                        href={project.github_link}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 text-center py-3 bg-white/5 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-white/10 transition-all border border-white/10"
                      >
                        Code
                      </a>
                    )}
                    {project.demo_link && (
                      <a
                        href={project.demo_link}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 text-center py-3 bg-yellow-400 text-black rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-yellow-300 shadow-lg shadow-yellow-400/20 transition-all"
                      >
                        Live
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Empty State */}
        {projects.length === 0 && (
          <div className="text-center text-slate-500 py-20 font-bold uppercase tracking-widest">No projects found.</div>
        )}

        {/* Expanded Modal */}
        <AnimatePresence>
          {selectedProject && (
            <motion.div
              className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center p-4 z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setSelectedProject(null)
                setShowFeedbackForm(false)
              }}
            >
              <motion.div
                className="bg-[#111827] rounded-[2rem] overflow-hidden max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/10 relative"
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Close Button */}
                <button
                  onClick={() => setSelectedProject(null)}
                  className="absolute top-5 right-5 z-20 bg-yellow-400 hover:bg-yellow-300 text-black rounded-full w-10 h-10 flex items-center justify-center shadow-lg transition-all font-bold"
                >
                  ✕
                </button>

                {!showFeedbackForm ? (
                  <div className="flex flex-col md:flex-row min-h-[500px]">
                    {/* MODAL LEFT: Image */}
                    <div className="w-full md:w-1/2 bg-[#0B0F1A] flex items-center justify-center p-10 border-b md:border-b-0 md:border-r border-white/5 relative">
                        <div className="absolute inset-0 bg-yellow-400/5 blur-[100px]" />
                      {selectedProject.image_url && (
                        <img
                          src={selectedProject.image_url}
                          alt={selectedProject.title}
                          className="w-full h-auto max-h-[400px] object-contain rounded-2xl drop-shadow-[0_0_20px_rgba(250,204,21,0.2)] relative z-10"
                        />
                      )}
                    </div>

                    {/* MODAL RIGHT: Details */}
                    <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
                      <div className="mb-8">
                        <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter mb-4">
                          {selectedProject.title}
                        </h2>
                        <div className="h-1.5 w-16 bg-yellow-400 rounded-full mb-8" />
                        <p className="text-slate-400 text-lg leading-relaxed font-medium">
                          {selectedProject.description}
                        </p>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex flex-1 gap-3">
                          {selectedProject.github_link && (
                            <a
                              href={selectedProject.github_link}
                              target="_blank"
                              rel="noreferrer"
                              className="flex-1 text-center bg-white/5 text-white px-6 py-4 rounded-2xl hover:bg-white/10 border border-white/10 transition-all font-bold uppercase tracking-widest text-sm"
                            >
                              Source
                            </a>
                          )}
                          {selectedProject.demo_link && (
                            <a
                              href={selectedProject.demo_link}
                              target="_blank"
                              rel="noreferrer"
                              className="flex-1 text-center bg-yellow-400 text-black px-6 py-4 rounded-2xl hover:bg-yellow-300 shadow-xl shadow-yellow-400/20 transition-all font-bold uppercase tracking-widest text-sm"
                            >
                              Launch
                            </a>
                          )}
                        </div>
                        <button
                          onClick={() => setShowFeedbackForm(true)}
                          className="px-8 py-4 bg-transparent text-yellow-400 rounded-2xl font-bold border-2 border-yellow-400/20 hover:bg-yellow-400/10 transition-all uppercase tracking-widest text-sm"
                        >
                          Feedback
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Feedback Form */
                  <div className="p-8 md:p-16">
                    <button 
                      onClick={() => setShowFeedbackForm(false)}
                      className="mb-8 text-yellow-400 font-bold hover:text-yellow-300 flex items-center gap-2 uppercase tracking-widest text-sm"
                    >
                      ← Back to Details
                    </button>
                    <h3 className="text-3xl md:text-5xl font-black text-white mb-10 uppercase tracking-tighter">
                        Drop a <span className="text-yellow-400">FeedBack</span>
                    </h3>
                    <form onSubmit={handleFeedbackSubmit} className="space-y-6 max-w-2xl">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <input
                          type="text"
                          required
                          placeholder="Name"
                          className="w-full bg-white/5 border border-white/10 px-6 py-4 rounded-2xl focus:outline-none focus:border-yellow-400 text-white transition-all font-medium"
                          value={feedbackForm.name}
                          onChange={(e) => setFeedbackForm({ ...feedbackForm, name: e.target.value })}
                        />
                        <input
                          type="email"
                          required
                          placeholder="Email"
                          className="w-full bg-white/5 border border-white/10 px-6 py-4 rounded-2xl focus:outline-none focus:border-yellow-400 text-white transition-all font-medium"
                          value={feedbackForm.email}
                          onChange={(e) => setFeedbackForm({ ...feedbackForm, email: e.target.value })}
                        />
                      </div>
                      <textarea
                        required
                        rows="5"
                        placeholder="Message"
                        className="w-full bg-white/5 border border-white/10 px-6 py-4 rounded-2xl focus:outline-none focus:border-yellow-400 text-white transition-all font-medium"
                        value={feedbackForm.message}
                        onChange={(e) => setFeedbackForm({ ...feedbackForm, message: e.target.value })}
                      />
                      <button
                        type="submit"
                        disabled={submitting}
                        className="w-full bg-yellow-400 text-black py-5 rounded-2xl font-black uppercase tracking-widest text-lg hover:bg-yellow-300 disabled:bg-slate-700 shadow-2xl shadow-yellow-400/20 transition-all"
                      >
                        {submitting ? 'Sending...' : 'Send FeedBack'}
                      </button>
                    </form>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}