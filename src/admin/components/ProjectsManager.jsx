import { useEffect, useState } from 'react'
import { supabase } from '../../supabase/supabaseClient'
import { useFileUpload } from '../../hooks/useFileUpload'
import ImageUpload from '../../components/ImageUpload'

export default function ProjectsManager() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingProject, setEditingProject] = useState(null)
  const [selectedProject, setSelectedProject] = useState(null)

  const [feedback, setFeedback] = useState([])
  const [feedbackCounts, setFeedbackCounts] = useState({})

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image_url: '',
    github_link: '',
    demo_link: '',
    sort_order: 1,
  })

  const { uploadFile } = useFileUpload()
  const [uploading, setUploading] = useState(false)

  /* ----------------------------------
      INITIAL LOAD + REALTIME
  ---------------------------------- */
  useEffect(() => {
    fetchProjects()
    fetchUnreadFeedbackCounts()

    const channel = supabase
      .channel('project-feedback-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'project_feedback' },
        () => fetchUnreadFeedbackCounts()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  /* ----------------------------------
      FETCH PROJECTS
  ---------------------------------- */
  const fetchProjects = async () => {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false })

    if (!error) setProjects(data || [])
    setLoading(false)
  }

  /* ----------------------------------
      FEEDBACK LOGIC
  ---------------------------------- */
  const fetchFeedback = async (projectId) => {
    const { data, error } = await supabase
      .from('project_feedback')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })

    if (!error) setFeedback(data || [])
  }

  const fetchUnreadFeedbackCounts = async () => {
    const { data, error } = await supabase
      .from('project_feedback')
      .select('project_id')
      .eq('is_read', false)

    if (error) return

    const counts = {}
    data.forEach((item) => {
      counts[item.project_id] = (counts[item.project_id] || 0) + 1
    })

    setFeedbackCounts(counts)
  }

  const handleViewFeedback = async (project) => {
    setSelectedProject(project)
    fetchFeedback(project.id)

    await supabase
      .from('project_feedback')
      .update({ is_read: true })
      .eq('project_id', project.id)
      .eq('is_read', false)

    fetchUnreadFeedbackCounts()
  }

  /* ----------------------------------
      IMAGE UPLOAD
  ---------------------------------- */
  const handleImageUpload = async (file) => {
    if (!file) return
    setUploading(true)

    const fileName = `project-${Date.now()}.${file.name.split('.').pop()}`
    const { url } = await uploadFile(file, 'project_images', fileName)

    setFormData({ ...formData, image_url: url })
    setUploading(false)
  }

  /* ----------------------------------
      CREATE / UPDATE
  ---------------------------------- */
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (editingProject) {
      await supabase
        .from('projects')
        .update(formData)
        .eq('id', editingProject.id)
    } else {
      await supabase.from('projects').insert(formData)
    }

    setShowForm(false)
    setEditingProject(null)
    setFormData({
      title: '',
      description: '',
      image_url: '',
      github_link: '',
      demo_link: '',
      sort_order: 1,
    })

    fetchProjects()
  }

  const handleEdit = (project) => {
    setEditingProject(project)
    setFormData(project)
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete project?')) return
    await supabase.from('projects').delete().eq('id', id)
    fetchProjects()
  }

  /* ----------------------------------
      LOADING
  ---------------------------------- */
  if (loading) return <div className="text-center py-8">Loading...</div>

  /* ----------------------------------
      1. FEEDBACK VIEW (Conditional)
  ---------------------------------- */
  if (selectedProject) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => {
            setSelectedProject(null)
            setFeedback([])
          }}
          className="text-blue-600 font-medium"
        >
          ← Back to Projects
        </button>

        <h2 className="text-2xl font-bold">Feedback for {selectedProject.title}</h2>

        {feedback.length === 0 ? (
          <p className="text-gray-500">No feedback yet.</p>
        ) : (
          <div className="space-y-4">
            {feedback.map((item) => (
              <div key={item.id} className="border p-4 rounded-xl bg-gray-50">
                <p className="font-semibold text-gray-900">{item.name}</p>
                <p className="text-sm text-gray-500">{item.email}</p>
                <p className="mt-3 text-gray-700 leading-relaxed">{item.message}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  /* ----------------------------------
      2. ADD/EDIT FORM VIEW (Conditional)
  ---------------------------------- */
  if (showForm) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 bg-white p-6 rounded-2xl border shadow-sm">
        <h2 className="text-2xl font-bold">
          {editingProject ? 'Edit Project' : 'Add New Project'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1">Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Crisp AI Assistant"
              className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">Description</label>
            <textarea
              required
              rows="4"
              className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Project Image</label>
            <ImageUpload 
              onUpload={handleImageUpload} 
              uploading={uploading} 
              currentImage={formData.image_url} 
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1">GitHub URL</label>
              <input
                type="url"
                className="w-full border p-2.5 rounded-lg"
                value={formData.github_link}
                onChange={(e) => setFormData({ ...formData, github_link: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Live Demo URL</label>
              <input
                type="url"
                className="w-full border p-2.5 rounded-lg"
                value={formData.demo_link}
                onChange={(e) => setFormData({ ...formData, demo_link: e.target.value })}
              />
            </div>
          </div>

          <div className="flex gap-3 pt-6 border-top mt-4">
            <button
              type="submit"
              disabled={uploading}
              className="flex-1 bg-blue-600 text-white font-bold py-2.5 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
            >
              {uploading ? 'Processing Image...' : editingProject ? 'Update Project' : 'Save Project'}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setEditingProject(null);
              }}
              className="px-6 py-2.5 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    )
  }

  /* ----------------------------------
      3. MAIN GRID VIEW
  ---------------------------------- */
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black uppercase tracking-tight">Manage Projects</h2>
          <p className="text-sm text-gray-500">Curate your portfolio showcase</p>
        </div>
        <button
          onClick={() => {
            setShowForm(true)
            setEditingProject(null)
            setFormData({ title: '', description: '', image_url: '', github_link: '', demo_link: '', sort_order: 1 })
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-xl shadow-md transition-all active:scale-95"
        >
          + Add Project
        </button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <div key={project.id} className="border rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
            <div className="h-40 bg-gray-100 overflow-hidden">
              {project.image_url ? (
                <img src={project.image_url} alt={project.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
              )}
            </div>
            
            <div className="p-4">
              <h3 className="font-bold text-lg mb-1">{project.title}</h3>
              <p className="text-sm text-gray-600 line-clamp-2 mb-4 h-10">
                {project.description}
              </p>

              <div className="flex items-center justify-between mt-auto border-t pt-4">
                <div className="flex gap-3">
                  <button
                    onClick={() => handleEdit(project)}
                    className="text-blue-600 hover:text-blue-800 font-bold text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(project.id)}
                    className="text-red-500 hover:text-red-700 font-bold text-sm"
                  >
                    Delete
                  </button>
                </div>

                <button
                  onClick={() => handleViewFeedback(project)}
                  className="relative flex items-center gap-1 bg-green-50 hover:bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold transition-colors"
                >
                  Feedback
                  {feedbackCounts[project.id] > 0 && (
                    <span className="flex items-center justify-center bg-red-600 text-white text-[10px] w-5 h-5 rounded-full ring-2 ring-white">
                      {feedbackCounts[project.id]}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {projects.length === 0 && (
        <div className="py-20 text-center border-2 border-dashed rounded-3xl">
          <p className="text-gray-400 font-medium">Your portfolio is empty. Time to build something great!</p>
        </div>
      )}
    </div>
  )
}