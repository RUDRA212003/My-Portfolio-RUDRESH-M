import { useEffect, useState, useMemo } from 'react'
import { supabase } from '../../supabase/supabaseClient'
import { useFileUpload } from '../../hooks/useFileUpload'
import ImageUpload from '../../components/ImageUpload'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'

export default function ExperiencesManager() {
  const [experiences, setExperiences] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingExperience, setEditingExperience] = useState(null)

  // Form State
  const [formData, setFormData] = useState({
    company_name: '',
    company_logo_url: '',
    role: '',
    short_description: '',
    full_description: '',
    start_date: '',
    end_date: '',
    is_ongoing: false,
    technologies: [],
    responsibilities: [],
    achievements: [],
    sort_order: 0,
    status: 'published',
  })

  // Helper states for dynamic array inputs
  const [techInput, setTechInput] = useState('')
  const [respInput, setRespInput] = useState('')
  const [achInput, setAchInput] = useState('')

  const { uploadFile } = useFileUpload()
  const [uploading, setUploading] = useState(false)

  // ReactQuill modules configuration
  const modules = useMemo(
    () => ({
      toolbar: [
        [{ header: [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'clean'],
        [{ list: 'ordered' }, { list: 'bullet' }],
        ['link'],
      ],
    }),
    []
  )

  const formats = ['header', 'bold', 'italic', 'underline', 'list', 'bullet', 'link']

  useEffect(() => {
    fetchExperiences()
  }, [])

  const fetchExperiences = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('experiences')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('start_date', { ascending: false })

      if (error) throw error
      setExperiences(data || [])
    } catch (error) {
      console.error('Error fetching experiences:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (file) => {
    if (!file) return
    setUploading(true)

    try {
      const fileName = `logo-${Date.now()}.${file.name.split('.').pop()}`
      // Using project_images bucket which is pre-configured and public
      const { url, error } = await uploadFile(file, 'project_images', fileName)
      if (error) throw error

      setFormData((prev) => ({ ...prev, company_logo_url: url }))
    } catch (error) {
      console.error('Error uploading logo:', error)
      alert('Failed to upload logo image')
    } finally {
      setUploading(false)
    }
  }

  const handleAddTech = () => {
    if (!techInput.trim()) return
    const newTech = techInput.trim()
    if (!formData.technologies.includes(newTech)) {
      setFormData((prev) => ({
        ...prev,
        technologies: [...prev.technologies, newTech],
      }))
    }
    setTechInput('')
  }

  const handleRemoveTech = (indexToRemove) => {
    setFormData((prev) => ({
      ...prev,
      technologies: prev.technologies.filter((_, idx) => idx !== indexToRemove),
    }))
  }

  const handleAddResponsibility = () => {
    if (!respInput.trim()) return
    setFormData((prev) => ({
      ...prev,
      responsibilities: [...prev.responsibilities, respInput.trim()],
    }))
    setRespInput('')
  }

  const handleRemoveResponsibility = (indexToRemove) => {
    setFormData((prev) => ({
      ...prev,
      responsibilities: prev.responsibilities.filter((_, idx) => idx !== indexToRemove),
    }))
  }

  const handleAddAchievement = () => {
    if (!achInput.trim()) return
    setFormData((prev) => ({
      ...prev,
      achievements: [...prev.achievements, achInput.trim()],
    }))
    setAchInput('')
  }

  const handleRemoveAchievement = (indexToRemove) => {
    setFormData((prev) => ({
      ...prev,
      achievements: prev.achievements.filter((_, idx) => idx !== indexToRemove),
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const submitData = {
      ...formData,
      // If ongoing, end_date should be null
      end_date: formData.is_ongoing ? null : formData.end_date || null,
    }

    try {
      if (editingExperience) {
        const { error } = await supabase
          .from('experiences')
          .update(submitData)
          .eq('id', editingExperience.id)
        if (error) throw error
        alert('Experience updated successfully!')
      } else {
        const { error } = await supabase.from('experiences').insert(submitData)
        if (error) throw error
        alert('Experience added successfully!')
      }

      resetForm()
      fetchExperiences()
    } catch (error) {
      console.error('Error saving experience:', error)
      alert('Failed to save experience. Ensure the SQL schema has been run in Supabase.')
    }
  }

  const handleEdit = (exp) => {
    setEditingExperience(exp)
    setFormData({
      company_name: exp.company_name,
      company_logo_url: exp.company_logo_url || '',
      role: exp.role,
      short_description: exp.short_description || '',
      full_description: exp.full_description || '',
      start_date: exp.start_date || '',
      end_date: exp.end_date || '',
      is_ongoing: exp.is_ongoing || false,
      technologies: exp.technologies || [],
      responsibilities: exp.responsibilities || [],
      achievements: exp.achievements || [],
      sort_order: exp.sort_order || 0,
      status: exp.status || 'draft',
    })
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this experience record?')) return
    try {
      const { error } = await supabase.from('experiences').delete().eq('id', id)
      if (error) throw error
      alert('Experience record deleted successfully!')
      fetchExperiences()
    } catch (error) {
      console.error('Error deleting experience:', error)
      alert('Failed to delete experience.')
    }
  }

  const resetForm = () => {
    setFormData({
      company_name: '',
      company_logo_url: '',
      role: '',
      short_description: '',
      full_description: '',
      start_date: '',
      end_date: '',
      is_ongoing: false,
      technologies: [],
      responsibilities: [],
      achievements: [],
      sort_order: 0,
      status: 'published',
    })
    setTechInput('')
    setRespInput('')
    setAchInput('')
    setEditingExperience(null)
    setShowForm(false)
  }

  if (loading) return <div className="text-center py-8 text-gray-500">Loading experiences...</div>

  if (showForm) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 bg-white p-8 rounded-2xl border shadow-sm">
        <div className="flex justify-between items-center border-b pb-4">
          <h2 className="text-2xl font-bold text-gray-800">
            {editingExperience ? 'Edit Experience' : 'Add New Experience'}
          </h2>
          <button
            onClick={resetForm}
            className="text-gray-500 hover:text-gray-700 text-sm font-medium"
          >
            Cancel
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Company Name & Job Title */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Company Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Google"
                className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.company_name}
                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Job Title / Role *</label>
              <input
                type="text"
                required
                placeholder="e.g. Senior Software Engineer"
                className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              />
            </div>
          </div>

          {/* Company Logo Upload */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Company Logo / Image</label>
            <ImageUpload
              onUpload={handleImageUpload}
              uploading={uploading}
              currentImage={formData.company_logo_url}
            />
          </div>

          {/* Start Date, End Date, Ongoing */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end bg-gray-50 p-4 rounded-xl border border-gray-100">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Start Date *</label>
              <input
                type="date"
                required
                className="w-full border p-2.5 rounded-lg bg-white outline-none"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                End Date {formData.is_ongoing ? '(Disabled)' : '*'}
              </label>
              <input
                type="date"
                required={!formData.is_ongoing}
                disabled={formData.is_ongoing}
                className="w-full border p-2.5 rounded-lg bg-white disabled:bg-gray-200 outline-none"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
              />
            </div>
            <div className="flex items-center pb-3">
              <input
                type="checkbox"
                id="is_ongoing"
                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                checked={formData.is_ongoing}
                onChange={(e) => setFormData({ ...formData, is_ongoing: e.target.checked })}
              />
              <label htmlFor="is_ongoing" className="ml-2.5 text-sm font-semibold text-gray-700 select-none">
                Ongoing Position (Present)
              </label>
            </div>
          </div>

          {/* Short Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Short Description (for Listing Card) *</label>
            <textarea
              required
              rows="2"
              placeholder="Provide a concise 1-2 sentence overview of your experience."
              className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              value={formData.short_description}
              onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
            />
          </div>

          {/* Full Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Full Description (Rich Text for Details Page)</label>
            <div className="bg-white">
              <ReactQuill
                theme="snow"
                value={formData.full_description}
                onChange={(value) => setFormData({ ...formData, full_description: value })}
                modules={modules}
                formats={formats}
                placeholder="Describe your role, accomplishments, projects worked on, etc..."
              />
            </div>
          </div>

          {/* Technologies & Skills (Tag manager) */}
          <div className="border-t pt-4">
            <label className="block text-sm font-semibold text-gray-700 mb-1">Technologies / Skills Used</label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                placeholder="e.g. React, Node.js, Go"
                className="flex-1 border p-2.5 rounded-lg outline-none text-sm"
                value={techInput}
                onChange={(e) => setTechInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTech())}
              />
              <button
                type="button"
                onClick={handleAddTech}
                className="bg-gray-800 text-white px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-gray-700"
              >
                Add Tag
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.technologies.map((tech, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 border border-blue-100 px-3 py-1 rounded-full text-xs font-semibold"
                >
                  {tech}
                  <button
                    type="button"
                    onClick={() => handleRemoveTech(idx)}
                    className="text-blue-500 hover:text-blue-800 font-bold"
                  >
                    ✕
                  </button>
                </span>
              ))}
              {formData.technologies.length === 0 && (
                <span className="text-sm text-gray-400 italic">No technologies added yet.</span>
              )}
            </div>
          </div>

          {/* Responsibilities list manager */}
          <div className="border-t pt-4">
            <label className="block text-sm font-semibold text-gray-700 mb-1">Responsibilities</label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                placeholder="Add a responsibility bullet point"
                className="flex-1 border p-2.5 rounded-lg outline-none text-sm"
                value={respInput}
                onChange={(e) => setRespInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddResponsibility())}
              />
              <button
                type="button"
                onClick={handleAddResponsibility}
                className="bg-gray-800 text-white px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-gray-700"
              >
                Add
              </button>
            </div>
            <ul className="space-y-2 bg-gray-50 p-4 rounded-xl border border-gray-100">
              {formData.responsibilities.map((resp, idx) => (
                <li key={idx} className="flex justify-between items-center text-sm text-gray-700 bg-white p-2 rounded border border-gray-200">
                  <span className="flex-1 pr-4">{resp}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveResponsibility(idx)}
                    className="text-red-500 hover:text-red-700 font-semibold px-2"
                  >
                    Remove
                  </button>
                </li>
              ))}
              {formData.responsibilities.length === 0 && (
                <span className="text-sm text-gray-400 italic">No responsibilities added yet.</span>
              )}
            </ul>
          </div>

          {/* Achievements list manager */}
          <div className="border-t pt-4">
            <label className="block text-sm font-semibold text-gray-700 mb-1">Key Achievements</label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                placeholder="Add a key achievement"
                className="flex-1 border p-2.5 rounded-lg outline-none text-sm"
                value={achInput}
                onChange={(e) => setAchInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddAchievement())}
              />
              <button
                type="button"
                onClick={handleAddAchievement}
                className="bg-gray-800 text-white px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-gray-700"
              >
                Add
              </button>
            </div>
            <ul className="space-y-2 bg-gray-50 p-4 rounded-xl border border-gray-100">
              {formData.achievements.map((ach, idx) => (
                <li key={idx} className="flex justify-between items-center text-sm text-gray-700 bg-white p-2 rounded border border-gray-200">
                  <span className="flex-1 pr-4">{ach}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveAchievement(idx)}
                    className="text-red-500 hover:text-red-700 font-semibold px-2"
                  >
                    Remove
                  </button>
                </li>
              ))}
              {formData.achievements.length === 0 && (
                <span className="text-sm text-gray-400 italic">No achievements added yet.</span>
              )}
            </ul>
          </div>

          {/* Sort Order & Status */}
          <div className="border-t pt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Display Order (Sort Order)</label>
              <input
                type="number"
                placeholder="0"
                className="w-full border p-2.5 rounded-lg outline-none text-sm"
                value={formData.sort_order}
                onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Publishing Status</label>
              <select
                className="w-full border p-2.5 rounded-lg outline-none text-sm bg-white"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex gap-4 pt-6 border-t">
            <button
              type="submit"
              disabled={uploading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg shadow-md disabled:bg-gray-400 transition-colors"
            >
              {uploading ? 'Processing Image...' : editingExperience ? 'Update Experience' : 'Save Experience'}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="px-8 py-3 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black uppercase tracking-tight text-gray-900">Manage Experience</h2>
          <p className="text-sm text-gray-500">Document and present your career milestones</p>
        </div>
        <button
          onClick={() => {
            setShowForm(true)
            setEditingExperience(null)
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-xl shadow-md transition-all active:scale-95 text-sm"
        >
          + Add Experience
        </button>
      </div>

      {experiences.length === 0 ? (
        <div className="py-20 text-center border-2 border-dashed rounded-3xl">
          <p className="text-gray-400 font-medium">No experience history found. Click "+ Add Experience" to get started.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {experiences.map((exp) => (
            <div key={exp.id} className="border rounded-2xl overflow-hidden bg-white shadow-sm flex flex-col hover:shadow-md transition-shadow">
              {/* Logo Area */}
              <div className="h-40 bg-gray-50 flex items-center justify-center p-6 border-b border-gray-100">
                {exp.company_logo_url ? (
                  <img src={exp.company_logo_url} alt={exp.company_name} className="max-w-full max-h-full object-contain" />
                ) : (
                  <div className="text-gray-400 font-semibold uppercase tracking-widest text-xs">No Logo</div>
                )}
              </div>

              {/* Metadata */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg text-gray-900 leading-tight">{exp.company_name}</h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      exp.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {exp.status}
                    </span>
                  </div>
                  <p className="text-blue-600 font-medium text-sm mb-3">{exp.role}</p>
                  <p className="text-gray-500 text-xs mb-3 font-semibold">
                    {exp.start_date} to {exp.is_ongoing ? 'Present' : exp.end_date}
                  </p>
                  <p className="text-gray-600 text-sm line-clamp-3 mb-4">{exp.short_description}</p>
                </div>

                <div className="flex justify-start gap-4 border-t pt-4 mt-auto">
                  <button
                    onClick={() => handleEdit(exp)}
                    className="text-blue-600 hover:text-blue-800 font-bold text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(exp.id)}
                    className="text-red-500 hover:text-red-700 font-bold text-sm"
                  >
                    Delete
                  </button>
                  <span className="ml-auto text-xs text-gray-400 font-medium self-center">Order: {exp.sort_order}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
