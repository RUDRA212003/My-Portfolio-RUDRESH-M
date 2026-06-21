import { supabase } from '../supabase/supabaseClient'

export const useFileUpload = () => {
  const uploadFile = async (file, bucket, fileName) => {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true,
        })

      if (error) throw error

      const {
        data: { publicUrl },
      } = supabase.storage.from(bucket).getPublicUrl(data.path)

      return { url: publicUrl, error: null }
    } catch (error) {
      console.error('Error uploading file:', error)
      return { url: null, error }
    }
  }

  return { uploadFile }
}









