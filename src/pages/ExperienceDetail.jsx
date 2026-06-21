import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { supabase } from '../supabase/supabaseClient'
import { Calendar, Briefcase, ChevronLeft, Share2, Shield, Award, Terminal } from 'lucide-react'

export default function ExperienceDetail() {
  const { id } = useParams()
  const [experience, setExperience] = useState(null)
  const [loading, setLoading] = useState(true)
  const [shared, setShared] = useState(false)

  useEffect(() => {
    // Scroll to top on page load
    window.scrollTo({ top: 0, behavior: 'smooth' })
    fetchExperienceDetails()
  }, [id])

  const fetchExperienceDetails = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('experiences')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      setExperience(data)
    } catch (error) {
      console.error('Error fetching experience details:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  }

  const getDuration = (exp) => {
    const start = formatDate(exp.start_date)
    const end = exp.is_ongoing ? 'Present' : formatDate(exp.end_date)
    return `${start} — ${end}`
  }

  const handleShare = async () => {
    const url = window.location.href
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${experience?.role} at ${experience?.company_name}`,
          text: `Check out my work experience as a ${experience?.role} at ${experience?.company_name}!`,
          url,
        })
      } catch (err) {
        console.log('Sharing canceled', err)
      }
    } else {
      await navigator.clipboard.writeText(url)
      setShared(true)
      setTimeout(() => setShared(false), 3000)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0F1A] py-24 px-6 flex flex-col items-center justify-center">
        <div className="max-w-4xl w-full space-y-8 animate-pulse">
          <div className="h-64 bg-white/5 rounded-3xl" />
          <div className="h-10 bg-white/5 w-1/3 rounded-full" />
          <div className="h-4 bg-white/5 w-full rounded-full" />
          <div className="h-4 bg-white/5 w-5/6 rounded-full" />
        </div>
      </div>
    )
  }

  if (!experience) {
    return (
      <div className="min-h-screen bg-[#0B0F1A] py-24 px-6 flex flex-col items-center justify-center text-center">
        <Briefcase className="w-16 h-16 text-yellow-400/40 mb-6" />
        <h2 className="text-3xl font-black text-white uppercase tracking-tight mb-2">Experience Record Not Found</h2>
        <p className="text-slate-400 mb-8 max-w-sm">The experience detail you are trying to view does not exist or has been removed.</p>
        <Link to="/" className="bg-yellow-400 hover:bg-yellow-300 text-black px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-sm transition-all shadow-lg shadow-yellow-400/20">
          Back to Portfolio
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0B0F1A] py-12 pb-24 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] bg-gradient-to-b from-yellow-400/5 to-transparent blur-[120px] rounded-full pointer-events-none" />

      {/* Large Faded Background Logo Hero Section */}
      <div className="absolute top-0 left-0 right-0 h-[450px] overflow-hidden opacity-10 pointer-events-none">
        {experience.company_logo_url ? (
          <img
            src={experience.company_logo_url}
            alt=""
            className="w-full h-full object-cover blur-3xl scale-125"
          />
        ) : (
          <div className="w-full h-full bg-yellow-400/10 blur-3xl" />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0B0F1A]/10 via-[#0B0F1A]/70 to-[#0B0F1A]" />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* --- Top Navigation Controls --- */}
        <div className="flex justify-between items-center mb-12">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-widest text-slate-400 hover:text-yellow-400 transition-colors group"
          >
            <ChevronLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
            Back to Home
          </Link>

          <button
            onClick={handleShare}
            className="bg-white/5 border border-white/10 hover:border-yellow-400/40 text-slate-300 hover:text-yellow-400 p-3 rounded-2xl transition-all flex items-center gap-2 text-xs font-black uppercase tracking-widest"
          >
            <Share2 className="w-4 h-4" />
            <span>{shared ? 'Link Copied!' : 'Share'}</span>
          </button>
        </div>

        {/* --- HERO HEADER CARD --- */}
        <div className="bg-[#111827]/70 backdrop-blur-md rounded-[2.5rem] p-8 md:p-12 mb-12 border border-white/5 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/[0.02] to-transparent pointer-events-none" />
          
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8 relative z-10">
            {/* Company Logo Display */}
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-3xl bg-[#0A0D16] border border-white/10 p-6 flex items-center justify-center shadow-2xl relative group-hover:scale-105 transition-transform">
              {experience.company_logo_url ? (
                <img
                  src={experience.company_logo_url}
                  alt={experience.company_name}
                  className="max-w-full max-h-full object-contain"
                />
              ) : (
                <Briefcase className="w-16 h-16 text-yellow-400" />
              )}
            </div>

            {/* Info details */}
            <div className="text-center md:text-left flex-1 space-y-4">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                <span className="text-sm font-black text-yellow-400 uppercase tracking-[0.25em]">
                  {experience.company_name}
                </span>
                <span className="h-1.5 w-1.5 bg-slate-500 rounded-full hidden md:inline-block" />
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
                  Experience Detail
                </span>
              </div>

              <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter leading-none">
                {experience.role}
              </h1>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-2">
                <div className="flex items-center gap-2 text-slate-300 font-semibold bg-white/5 border border-white/5 px-4 py-2 rounded-2xl text-sm">
                  <Calendar className="w-4 h-4 text-yellow-400" />
                  <span>{getDuration(experience)}</span>
                </div>
                {experience.is_ongoing && (
                  <span className="bg-yellow-400/10 text-yellow-400 border border-yellow-400/20 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider animate-pulse">
                    Active Role
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* --- MAIN PAGE CONTENT GRID --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT/MAIN COLUMN (2/3 width) */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Full description */}
            {experience.full_description && (
              <div className="bg-[#111827]/40 backdrop-blur-sm rounded-3xl p-8 md:p-10 border border-white/5 shadow-xl space-y-6">
                <h2 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                  <Shield className="w-5 h-5 text-yellow-400" />
                  Role Summary
                </h2>
                <div className="h-1 w-12 bg-yellow-400 rounded-full" />
                
                {/* HTML prose content styled dynamically */}
                <div
                  className="prose prose-invert max-w-none text-slate-300 leading-relaxed text-base font-medium space-y-4 prose-a:text-yellow-400 hover:prose-a:underline"
                  dangerouslySetInnerHTML={{ __html: experience.full_description }}
                />
              </div>
            )}

            {/* Responsibilities bullet points */}
            {experience.responsibilities && experience.responsibilities.length > 0 && (
              <div className="bg-[#111827]/40 backdrop-blur-sm rounded-3xl p-8 md:p-10 border border-white/5 shadow-xl space-y-6">
                <h2 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                  <Briefcase className="w-5 h-5 text-yellow-400" />
                  Core Responsibilities
                </h2>
                <div className="h-1 w-12 bg-yellow-400 rounded-full" />

                <ul className="space-y-4">
                  {experience.responsibilities.map((resp, i) => (
                    <li key={i} className="flex gap-4 items-start group">
                      <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 border border-yellow-300 mt-2 flex-shrink-0 group-hover:scale-125 transition-transform" />
                      <span className="text-slate-300 font-medium leading-relaxed">{resp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Achievements Bullet points */}
            {experience.achievements && experience.achievements.length > 0 && (
              <div className="bg-[#111827]/40 backdrop-blur-sm rounded-3xl p-8 md:p-10 border border-white/5 shadow-xl space-y-6 relative overflow-hidden">
                {/* Subtle light effect for achievements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-400/5 blur-2xl rounded-full" />
                
                <h2 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                  <Award className="w-5 h-5 text-yellow-400" />
                  Key Achievements
                </h2>
                <div className="h-1 w-12 bg-yellow-400 rounded-full" />

                <ul className="space-y-4">
                  {experience.achievements.map((ach, i) => (
                    <li key={i} className="flex gap-4 items-start group">
                      <span className="w-6 h-6 rounded-lg bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:bg-yellow-400 group-hover:text-black transition-all">
                        ⭐
                      </span>
                      <span className="text-slate-300 font-semibold leading-relaxed">{ach}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

          </div>

          {/* RIGHT COLUMN/SIDEBAR (1/3 width) */}
          <div className="space-y-8">
            
            {/* Tech Stack widget */}
            {experience.technologies && experience.technologies.length > 0 && (
              <div className="bg-[#111827]/60 backdrop-blur-md rounded-3xl p-8 border border-white/5 shadow-xl space-y-6">
                <h2 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                  <Terminal className="w-5 h-5 text-yellow-400" />
                  Skills & Tools
                </h2>
                <div className="h-1 w-12 bg-yellow-400 rounded-full" />

                <div className="flex flex-wrap gap-2.5">
                  {experience.technologies.map((tech, i) => (
                    <span
                      key={i}
                      className="text-xs font-black uppercase tracking-wider bg-white/5 border border-white/10 hover:border-yellow-400/50 hover:bg-yellow-400/5 text-slate-300 hover:text-yellow-400 px-3.5 py-2 rounded-2xl transition-all cursor-default"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Summary Sidebar Card */}
            <div className="bg-[#111827]/40 backdrop-blur-sm rounded-3xl p-8 border border-white/5 shadow-xl space-y-6">
              <h3 className="font-bold text-white uppercase text-sm tracking-widest">At a Glance</h3>
              <div className="space-y-4 text-sm text-slate-400">
                <div className="flex justify-between py-2 border-b border-white/5">
                  <span className="font-semibold">Company</span>
                  <span className="font-bold text-white">{experience.company_name}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/5">
                  <span className="font-semibold">Role</span>
                  <span className="font-bold text-white text-right ml-2">{experience.role}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="font-semibold">Timeline</span>
                  <span className="font-bold text-white text-right ml-2">{getDuration(experience)}</span>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  )
}
