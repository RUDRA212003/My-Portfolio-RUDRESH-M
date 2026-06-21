import { useEffect, useState, useMemo } from 'react'
import { supabase } from '../../supabase/supabaseClient'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'

export default function AboutManager() {
  const [about, setAbout] = useState({ content: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchAbout()
  }, [])

  const fetchAbout = async () => {
    try {
      const { data, error } = await supabase
        .from('about')
        .select('*')
        .single()

      if (error && error.code !== 'PGRST116') throw error
      if (data) {
        setAbout(data)
      }
    } catch (error) {
      console.error('Error fetching about:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const { error } = await supabase.from('about').upsert({
        id: about.id || 1,
        content: about.content,
      })

      if (error) throw error

      alert('About section updated successfully!')
      fetchAbout()
    } catch (error) {
      console.error('Error saving about:', error)
      alert('Failed to save about section')
    } finally {
      setSaving(false)
    }
  }

  const modules = useMemo(
    () => ({
      toolbar: [
        [{ header: [1, 2, 3, 4, 5, 6, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ list: 'ordered' }, { list: 'bullet' }],
        [{ script: 'sub' }, { script: 'super' }],
        [{ indent: '-1' }, { indent: '+1' }],
        [{ align: [] }],
        ['link', 'image'],
        [{ color: [] }, { background: [] }],
        ['clean'],
      ],
    }),
    []
  )

  const formats = [
    'header',
    'bold',
    'italic',
    'underline',
    'strike',
    'list',
    'bullet',
    'script',
    'indent',
    'align',
    'link',
    'image',
    'color',
    'background',
  ]

  if (loading) {
    return <div className="text-center py-8">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Manage About Section</h2>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          About Content
        </label>
        <div className="bg-white">
          <ReactQuill
            theme="snow"
            value={about.content}
            onChange={(value) => setAbout({ ...about, content: value })}
            modules={modules}
            formats={formats}
            placeholder="Write about yourself..."
            style={{ minHeight: '300px' }}
          />
        </div>
        <p className="text-sm text-gray-500 mt-2">
          Use the toolbar above to format your text with bold, italic, headings, lists, and more.
        </p>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
      >
        {saving ? 'Saving...' : 'Save Changes'}
      </button>
    </div>
  )
}









