import { useEffect, useState } from 'react'
import { supabase } from '../../supabase/supabaseClient'
import { useFileUpload } from '../../hooks/useFileUpload'
import CardItemsManager from './CardItemsManager'
import ImageUpload from '../../components/ImageUpload'

export default function CardsManager() {
  const [cards, setCards] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingCard, setEditingCard] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({ title: '', type: '', image_url: '' })
  const [uploading, setUploading] = useState(false)
  const [selectedCard, setSelectedCard] = useState(null)
  const { uploadFile } = useFileUpload()

  useEffect(() => {
    fetchCards()
  }, [])

  const fetchCards = async () => {
    try {
      const { data, error } = await supabase
        .from('cards')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setCards(data || [])
    } catch (error) {
      console.error('Error fetching cards:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (file) => {
    if (!file) return

    setUploading(true)
    try {
      const fileName = `card-${Date.now()}.${file.name.split('.').pop()}`
      const { url, error } = await uploadFile(file, 'card_images', fileName)

      if (error) throw error

      setFormData({ ...formData, image_url: url })
    } catch (error) {
      console.error('Error uploading image:', error)
      alert('Failed to upload image')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingCard) {
        const { error } = await supabase
          .from('cards')
          .update(formData)
          .eq('id', editingCard.id)

        if (error) throw error
      } else {
        const { error } = await supabase.from('cards').insert(formData)
        if (error) throw error
      }

      alert('Card saved successfully!')
      setShowForm(false)
      setEditingCard(null)
      setFormData({ title: '', type: '', image_url: '' })
      fetchCards()
    } catch (error) {
      console.error('Error saving card:', error)
      alert('Failed to save card')
    }
  }

  const handleEdit = (card) => {
    setEditingCard(card)
    setFormData({ title: card.title, type: card.type, image_url: card.image_url || '' })
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this card?')) return

    try {
      const { error } = await supabase.from('cards').delete().eq('id', id)
      if (error) throw error

      alert('Card deleted successfully!')
      fetchCards()
    } catch (error) {
      console.error('Error deleting card:', error)
      alert('Failed to delete card')
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading...</div>
  }

  if (selectedCard) {
    return (
      <CardItemsManager
        card={selectedCard}
        onBack={() => setSelectedCard(null)}
        onRefresh={fetchCards}
      />
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Manage Cards</h2>
        <button
          onClick={() => {
            setShowForm(true)
            setEditingCard(null)
            setFormData({ title: '', type: '', image_url: '' })
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Add New Card
        </button>
      </div>

      {showForm && (
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">
            {editingCard ? 'Edit Card' : 'Add New Card'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type
              </label>
              <input
                type="text"
                required
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Projects, Achievements, Certifications"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Image
              </label>
              <ImageUpload
                onUpload={handleImageUpload}
                currentImage={formData.image_url}
                uploading={uploading}
              />
            </div>
            <div className="flex space-x-4">
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                {editingCard ? 'Update' : 'Create'} Card
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false)
                  setEditingCard(null)
                  setFormData({ title: '', type: '', image_url: '' })
                }}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card) => (
          <div
            key={card.id}
            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            {card.image_url && (
              <img
                src={card.image_url}
                alt={card.title}
                className="w-full h-32 object-cover rounded mb-2"
              />
            )}
            <h3 className="font-semibold text-gray-800">{card.title}</h3>
            <p className="text-sm text-gray-500">{card.type}</p>
            <div className="flex space-x-2 mt-4">
              <button
                onClick={() => handleEdit(card)}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                Edit
              </button>
              <button
                onClick={() => setSelectedCard(card)}
                className="text-green-600 hover:text-green-800 text-sm"
              >
                Manage Items
              </button>
              <button
                onClick={() => handleDelete(card.id)}
                className="text-red-600 hover:text-red-800 text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {cards.length === 0 && (
        <div className="text-center text-gray-500 py-8">No cards yet.</div>
      )}
    </div>
  )
}









