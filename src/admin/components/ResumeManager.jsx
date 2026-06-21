import { useEffect, useState } from 'react'
import { supabase } from '../../supabase/supabaseClient'
import { useFileUpload } from '../../hooks/useFileUpload'

export default function ResumeManager() {
  const [resume, setResume] = useState(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const { uploadFile } = useFileUpload()

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

  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setUploading(true)
    try {
      const fileName = `resume-${Date.now()}.${file.name.split('.').pop()}`
      const { url, error } = await uploadFile(file, 'resume_files', fileName)

      if (error) throw error

      const { error: dbError } = await supabase.from('resume').upsert({
        id: resume?.id || 1,
        file_url: url,
      })

      if (dbError) throw dbError

      alert('Resume uploaded successfully!')
      fetchResume()
    } catch (error) {
      console.error('Error uploading resume:', error)
      alert('Failed to upload resume')
    } finally {
      setUploading(false)
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Manage Resume</h2>

      <div className="border border-gray-200 rounded-lg p-6">
        {resume?.file_url ? (
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-2">Current Resume:</p>
              <a
                href={resume.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800"
              >
                View Current Resume →
              </a>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Replace Resume
              </label>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileUpload}
                disabled={uploading}
                className="block text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {uploading && (
                <p className="text-sm text-gray-500 mt-1">Uploading...</p>
              )}
            </div>
          </div>
        ) : (
          <div>
            <p className="text-gray-600 mb-4">No resume uploaded yet.</p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Resume
              </label>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileUpload}
                disabled={uploading}
                className="block text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {uploading && (
                <p className="text-sm text-gray-500 mt-1">Uploading...</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}









