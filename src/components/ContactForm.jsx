import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, User, MessageSquare } from 'lucide-react'
import { supabase } from '../supabase/supabaseClient'

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const { error } = await supabase.from('contact_messages').insert({
        name: formData.name,
        email: formData.email,
        message: formData.message,
      })

      if (error) throw error

      setToast(true)
      setFormData({ name: '', email: '', message: '' })

      setTimeout(() => setToast(false), 4000)
    } catch (error) {
      alert("Failed to send message")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="relative py-28 overflow-hidden bg-[#0B0F1A]">
      
      {/* Subtle Yellow Glow Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-yellow-400/5 blur-[120px] rounded-full"></div>
      </div>

      {/* Main Title */}
      <div className="text-center mb-10 px-6">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter"
        >
          Get in <span className="text-yellow-400">Touch</span>
        </motion.h2>
        <div className="h-1.5 w-16 bg-yellow-400 mx-auto mt-6 rounded-full" />
        <p className="text-slate-400 mt-6 text-lg font-medium">Let's build something exceptional together.</p>
      </div>

      <div className="max-w-4xl mx-auto px-6">
        {/* Contact Form */}
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-[#111827] border border-white/5 p-8 md:p-12 rounded-[2.5rem] shadow-2xl space-y-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name */}
            <div className="relative group">
              <User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-yellow-400 transition-colors w-5 h-5" />
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full pl-14 pr-6 py-5 rounded-2xl bg-[#0B0F1A] border border-white/10 focus:border-yellow-400 text-white outline-none transition-all font-medium"
                placeholder="Name"
              />
            </div>

            {/* Email */}
            <div className="relative group">
              <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-yellow-400 transition-colors w-5 h-5" />
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full pl-14 pr-6 py-5 rounded-2xl bg-[#0B0F1A] border border-white/10 focus:border-yellow-400 text-white outline-none transition-all font-medium"
                placeholder="Email Address"
              />
            </div>
          </div>

          {/* Message */}
          <div className="relative group">
            <MessageSquare className="absolute left-5 top-6 text-slate-500 group-focus-within:text-yellow-400 transition-colors w-5 h-5" />
            <textarea
              rows="6"
              required
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className="w-full pl-14 pr-6 py-5 rounded-2xl bg-[#0B0F1A] border border-white/10 focus:border-yellow-400 text-white outline-none transition-all resize-none font-medium"
              placeholder="Your Message"
            ></textarea>
          </div>

          {/* Submit Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={submitting}
            className="w-full py-5 text-lg font-black uppercase tracking-widest text-black bg-yellow-400 rounded-2xl shadow-[0_10px_30px_rgba(250,204,21,0.2)] hover:bg-yellow-300 transition-all disabled:opacity-50"
          >
            {submitting ? "Sending..." : "Send Message"}
          </motion.button>
        </motion.form>

        {/* Social Links Grid */}
        {/* <div className="mt-20">
          <h3 className="text-center text-sm font-black text-yellow-400/50 uppercase tracking-[0.3em] mb-10">
            Digital Presence
          </h3>
          <div className="flex flex-wrap justify-center gap-4">
            {[
              { name: "linkedin", url: "https://www.linkedin.com/in/rudresh-manjunath21/" },
              { name: "github", url: "https://github.com/RUDRA212003" },
              { name: "x", url: "https://x.com/yo_rudra" },
              { name: "instagram", url: "https://www.instagram.com/yoyorudra_offical/?hl=en" },
              { name: "youtube", url: "https://www.youtube.com/@yoyorudraandroidtech" },
              { name: "gmail", url: "mailto:rudreshmanjunath15@gmail.com" }
            ].map((social) => (
              <a
                key={social.name}
                href={social.url}
                target="_blank"
                rel="noreferrer"
                className="group flex items-center justify-center w-14 h-14 bg-[#111827] border border-white/5 rounded-2xl hover:bg-yellow-400 transition-all duration-300 shadow-xl"
              >
                <img 
                  src={`https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/${social.name}.svg`} 
                  className="w-6 h-6 invert group-hover:invert-0 transition-all" 
                  alt={social.name}
                />
              </a>
            ))}
          </div>
        </div> */}

        {/* Toast Notification */}
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              className="fixed bottom-10 right-10 bg-yellow-400 shadow-2xl p-5 rounded-2xl flex items-center gap-4 z-50"
            >
              <div className="w-2 h-2 bg-black rounded-full animate-ping"></div>
              <p className="text-black font-black uppercase tracking-widest text-xs">Message sent , I will contact you shortly</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}