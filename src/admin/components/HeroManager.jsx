import { useEffect, useState } from 'react'
import { supabase } from '../../supabase/supabaseClient'
import { useFileUpload } from '../../hooks/useFileUpload'
import ImageUpload from '../../components/ImageUpload'

export default function HeroManager() {
  const [hero, setHero] = useState({ name: '', designation: '', photo_url: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const { uploadFile } = useFileUpload()

  useEffect(() => {
    fetchHero()
  }, [])

  const fetchHero = async () => {
    try {
      const { data, error } = await supabase
        .from('hero')
        .select('*')
        .single()

      if (error && error.code !== 'PGRST116') throw error
      if (data) {
        setHero(data)
      }
    } catch (error) {
      console.error('Error fetching hero:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (file) => {
    if (!file) return

    setUploading(true)
    try {
      const fileName = `profile-${Date.now()}.${file.name.split('.').pop()}`
      const { url, error } = await uploadFile(file, 'profile_images', fileName)

      if (error) throw error

      setHero({ ...hero, photo_url: url })
    } catch (error) {
      console.error('Error uploading image:', error)
      alert('Failed to upload image')
    } finally {
      setUploading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const { error } = await supabase.from('hero').upsert({
        id: hero.id || 1,
        name: hero.name,
        designation: hero.designation,
        photo_url: hero.photo_url,
      })

      if (error) throw error

      alert('Hero section updated successfully!')
      fetchHero()
    } catch (error) {
      console.error('Error saving hero:', error)
      alert('Failed to save hero section')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Manage Hero Section</h2>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Profile Photo
        </label>
        <div className="max-w-md">
          <ImageUpload
            onUpload={handleImageUpload}
            currentImage={hero.photo_url}
            uploading={uploading}
            className="mb-2"
          />
          {hero.photo_url && (
            <div className="mt-4 flex justify-center">
              <img
                src={hero.photo_url}
                alt="Profile"
                className="w-32 h-32 rounded-full object-cover border-4 border-gray-200"
              />
            </div>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Name
        </label>
        <input
          type="text"
          value={hero.name}
          onChange={(e) => setHero({ ...hero, name: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Your Name"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Designation
        </label>
        <input
          type="text"
          value={hero.designation}
          onChange={(e) => setHero({ ...hero, designation: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Your Designation"
        />
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









