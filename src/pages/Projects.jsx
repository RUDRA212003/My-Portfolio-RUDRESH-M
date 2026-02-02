import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../supabase/supabaseClient";

/* --------------------------------------------
   Animations
-------------------------------------------- */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

/* --------------------------------------------
   Dark/Yellow Skeletons
-------------------------------------------- */
function HeaderSkeleton() {
  return (
    <div className="animate-pulse mb-16 px-4">
      <div className="h-12 bg-white/5 w-full max-w-md mx-auto rounded-full"></div>
      <div className="h-1.5 w-24 bg-yellow-400/20 mx-auto mt-4 rounded-full"></div>
    </div>
  );
}

function ProjectCardSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-4">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="bg-[#111827] rounded-3xl border border-white/5 p-6 animate-pulse">
          <div className="h-48 bg-white/5 rounded-2xl mb-4"></div>
          <div className="h-6 bg-white/5 rounded-full w-3/4 mb-3"></div>
          <div className="h-4 bg-white/5 rounded-full w-full mb-2"></div>
        </div>
      ))}
    </div>
  );
}

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [feedbackForm, setFeedbackForm] = useState({ name: "", email: "", message: "" });
  const [submitting, setSubmitting] = useState(false);

  const gridLayer1 = useRef(null);
  const gridLayer2 = useRef(null);
  const pointer = useRef({ x: 0.5, y: 0.5 });
  const scroll = useRef(0);

  useEffect(() => { fetchProjects(); }, []);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const req = supabase.from("projects").select("*").order("sort_order", { ascending: true });
      const delay = new Promise((res) => setTimeout(res, 800));
      const [{ data, error }] = await Promise.all([req, delay]);
      if (error) throw error;
      setProjects(data || []);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => {
    function onPointerMove(e) {
      pointer.current.x = e.clientX / window.innerWidth;
      pointer.current.y = e.clientY / window.innerHeight;
    }
    function onScroll() { scroll.current = window.scrollY; }
    window.addEventListener("mousemove", onPointerMove);
    window.addEventListener("scroll", onScroll);
    function animate() {
      const x = (pointer.current.x - 0.5) * 2;
      if (gridLayer1.current) gridLayer1.current.style.transform = `translate3d(${x * 12}px, ${scroll.current * 0.03}px, 0)`;
      if (gridLayer2.current) gridLayer2.current.style.transform = `translate3d(${x * 6}px, ${scroll.current * 0.015}px, 0)`;
      requestAnimationFrame(animate);
    }
    animate();
    return () => {
      window.removeEventListener("mousemove", onPointerMove);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { error } = await supabase.from("project_feedback").insert({
        project_id: selectedProject.id,
        ...feedbackForm,
      });
      if (error) throw error;
      alert("Feedback submitted!");
      setShowFeedbackForm(false);
      setFeedbackForm({ name: "", email: "", message: "" });
    } catch (err) { alert("Error submitting feedback."); } finally { setSubmitting(false); }
  };

  const wrapperClass = "relative min-h-screen bg-[#0B0F1A] py-20 overflow-hidden";

  if (loading) {
    return (
      <div className={wrapperClass}>
        <div ref={gridLayer1} className="grid-layer-1"></div>
        <div ref={gridLayer2} className="grid-layer-2"></div>
        <div className="max-w-7xl mx-auto px-4">
          <HeaderSkeleton />
          <ProjectCardSkeleton />
        </div>
        <style>{GRID_CSS}</style>
      </div>
    );
  }

  return (
    <div className={wrapperClass}>
      <div ref={gridLayer1} className="grid-layer-1"></div>
      <div ref={gridLayer2} className="grid-layer-2"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <motion.div initial={{ opacity: 0, y: -25 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <h1 className="text-5xl md:text-4xl font-black text-white uppercase tracking-tighter">
            My <span className="text-yellow-400">Projects</span>
          </h1>
          <div className="h-1.5 w-20 bg-yellow-400 mx-auto mt-6 rounded-full" />
        </motion.div>

        <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" variants={containerVariants} initial="hidden" animate="visible">
          {projects.map((project) => (
            <motion.div key={project.id} variants={cardVariants} whileHover={{ y: -10 }} className="group">
              <div
                onClick={() => { setSelectedProject(project); setShowFeedbackForm(false); }}
                className="bg-[#111827] rounded-[2rem] border border-white/5 hover:border-yellow-400/40 transition-all duration-500 cursor-pointer overflow-hidden flex flex-col h-full shadow-2xl"
              >
                <div className="aspect-video bg-[#0B0F1A] border-b border-white/5 flex items-center justify-center overflow-hidden relative">
                  <div className="absolute inset-0 bg-yellow-400/5 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  {project.image_url ? (
                    <motion.img src={project.image_url} className="w-full h-full object-contain p-6 relative z-10" whileHover={{ scale: 1.05 }} />
                  ) : (
                    <div className="text-slate-500 font-bold uppercase tracking-widest text-xs">No Preview</div>
                  )}
                </div>

                <div className="p-8 flex flex-col flex-1">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white group-hover:text-yellow-400 transition mb-3 uppercase tracking-tight">
                      {project.title}
                    </h3>
                    <p className="text-slate-400 line-clamp-2 text-sm leading-relaxed">
                      {project.description}
                    </p>
                  </div>
                  <div className="flex gap-3 mt-8">
                    {project.github_link && (
                      <a href={project.github_link} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="flex-1 text-center py-3 bg-white/5 text-white rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/10 hover:bg-white/10 transition">Git repo</a>
                    )}
                    {project.demo_link && (
                      <a href={project.demo_link} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="flex-1 text-center py-3 bg-yellow-400 text-black rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-yellow-300 shadow-lg shadow-yellow-400/20 transition">Visit</a>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Modal Logic Remains Similar but Styled Dark */}
        <AnimatePresence>
          {selectedProject && (
            <motion.div className="fixed inset-0 bg-black/90 backdrop-blur-xl flex justify-center items-center p-4 z-[100]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedProject(null)}>
              <motion.div className="bg-[#111827] rounded-[2.5rem] overflow-hidden max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/10 relative" initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} onClick={(e) => e.stopPropagation()}>
                <button onClick={() => setSelectedProject(null)} className="absolute top-6 right-6 z-20 bg-yellow-400 text-black rounded-full w-10 h-10 flex items-center justify-center font-bold">✕</button>

                {!showFeedbackForm ? (
                  <div className="flex flex-col md:flex-row h-full">
                    <div className="w-full md:w-1/2 bg-[#0B0F1A] flex items-center justify-center p-10 border-b md:border-b-0 md:border-r border-white/5 relative">
                      <div className="absolute inset-0 bg-yellow-400/5 blur-[100px]" />
                      <img src={selectedProject.image_url} alt="" className="w-full h-auto max-h-[350px] object-contain rounded-2xl relative z-10" />
                    </div>
                    <div className="w-full md:w-1/2 p-10 flex flex-col justify-center">
                      <h2 className="text-3xl md:text-5xl font-black text-white mb-4 uppercase tracking-tighter">{selectedProject.title}</h2>
                      <div className="h-1.5 w-16 bg-yellow-400 rounded-full mb-8" />
                      <p className="text-slate-400 text-lg leading-relaxed mb-10 font-medium">{selectedProject.description}</p>
                      <div className="flex flex-col sm:flex-row gap-3">
                         <div className="flex flex-1 gap-3">
                            {selectedProject.github_link && <a href={selectedProject.github_link} className="flex-1 text-center bg-white/5 text-white py-4 rounded-2xl font-bold uppercase tracking-widest text-xs border border-white/10 transition">Github repo</a>}
                            {selectedProject.demo_link && <a href={selectedProject.demo_link} className="flex-1 text-center bg-yellow-400 text-black py-4 rounded-2xl font-bold uppercase tracking-widest text-xs shadow-xl transition">Visit</a>}
                         </div>
                         <button onClick={() => setShowFeedbackForm(true)} className="px-8 py-4 bg-transparent text-yellow-400 border-2 border-yellow-400/20 rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-yellow-400/10 transition">Feedback</button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-10 md:p-16">
                    <button onClick={() => setShowFeedbackForm(false)} className="mb-8 text-yellow-400 font-bold uppercase tracking-widest text-xs flex items-center gap-2">← Details</button>
                    <h3 className="text-3xl md:text-5xl font-black text-white mb-10 uppercase tracking-tighter">Drop a <span className="text-yellow-400">Feedback</span></h3>
                    <form onSubmit={handleFeedbackSubmit} className="space-y-6 max-w-2xl">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <input type="text" placeholder="Name" className="w-full bg-white/5 border border-white/10 px-6 py-4 rounded-2xl text-white focus:border-yellow-400 outline-none transition" value={feedbackForm.name} onChange={(e) => setFeedbackForm({ ...feedbackForm, name: e.target.value })} />
                        <input type="email" placeholder="Email" className="w-full bg-white/5 border border-white/10 px-6 py-4 rounded-2xl text-white focus:border-yellow-400 outline-none transition" value={feedbackForm.email} onChange={(e) => setFeedbackForm({ ...feedbackForm, email: e.target.value })} />
                      </div>
                      <textarea placeholder="Message" rows={4} className="w-full bg-white/5 border border-white/10 px-6 py-4 rounded-2xl text-white focus:border-yellow-400 outline-none transition" value={feedbackForm.message} onChange={(e) => setFeedbackForm({ ...feedbackForm, message: e.target.value })} />
                      <button type="submit" disabled={submitting} className="w-full bg-yellow-400 text-black py-5 rounded-2xl font-black uppercase tracking-widest text-lg hover:bg-yellow-300 transition-all shadow-2xl shadow-yellow-400/20">
                        {submitting ? "Sending..." : "Submit Feedback"}
                      </button>
                    </form>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <style>{GRID_CSS}</style>
    </div>
  );
}

const GRID_CSS = `
.grid-layer-1, .grid-layer-2 { position: fixed !important; top: 0; left: 0; width: 100vw; height: 100vh; pointer-events: none; z-index: -1 !important; will-change: transform; }
.grid-layer-1 { background-image: linear-gradient(rgba(250,204,21,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(250,204,21,0.08) 1px, transparent 1px); background-size: 30px 30px; }
.grid-layer-2 { background-image: linear-gradient(rgba(250,204,21,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(250,204,21,0.04) 1px, transparent 1px); background-size: 60px 60px; }
`;