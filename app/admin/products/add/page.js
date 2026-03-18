'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import RichTextEditor from '@/components/RichTextEditor';

export default function AddProduct() {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', slug: '', description: '', price: '', category_id: '', stock: '', image_url: '', db_reference: '' });
  const [selectedCategories, setSelectedCategories] = useState([]);

  useEffect(() => {
    fetch('/api/admin/categories').then(r => r.json()).then(setCategories);
  }, []);

  const generateSlug = (name) =>
    name.trim().toLowerCase().replace(/[\s]+/g, '-').replace(/[^\w\u0900-\u097F-]/g, '').replace(/--+/g, '-');

  const handleNameChange = (e) => {
    const name = e.target.value;
    setForm(f => ({ ...f, name, slug: generateSlug(name) }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch('/api/admin/upload', { method: 'POST', body: formData });
    const data = await res.json();
    if (data.url) {
      setForm(f => ({ ...f, image_url: data.url }));
    } else {
      alert('Image upload failed: ' + JSON.stringify(data.error));
    }
    setUploading(false);
  };

  const handleSubmit = async () => {
    if (uploading) { alert('Image still uploading, please wait...'); return; }
    setSaving(true);
    const res = await fetch('/api/admin/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        category_id: selectedCategories[0] || null,
        category_ids: selectedCategories,
      }),
    });
    if (res.ok) {
      router.push('/admin/products');
    } else {
      const err = await res.json();
      alert('Error: ' + JSON.stringify(err));
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-2xl font-bold text-stone-800 mb-6">Add Product</h1>
      <div className="bg-white rounded-xl shadow p-6 max-w-2xl space-y-4">

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <input value={form.name} onChange={handleNameChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-400" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
          <input value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-400" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <RichTextEditor value={form.description} onChange={val => setForm(f => ({ ...f, description: val }))} />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
          <input value={form.price} onChange={e => setForm({ ...form, price: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-400" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
          <input value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-400" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
          <input type="file" accept="image/*" onChange={handleImageUpload}
            className="w-full border border-gray-300 rounded-lg px-3 py-2" />
          {uploading && <p className="text-sm text-amber-500 mt-1">Uploading... please wait</p>}
          {form.image_url && !uploading && (
            <img src={form.image_url} alt="preview" className="mt-2 h-24 rounded-lg object-cover" />
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Categories (एक से अधिक चुन सकते हैं)</label>
          <div className="border border-gray-300 rounded-lg p-3 grid grid-cols-2 gap-2">
            {categories.map(c => (
              <label key={c.id} className="flex items-center gap-2 cursor-pointer hover:bg-amber-50 px-2 py-1 rounded">
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(c.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedCategories(prev => [...prev, c.id]);
                    } else {
                      setSelectedCategories(prev => prev.filter(id => id !== c.id));
                    }
                  }}
                  className="accent-amber-500"
                />
                <span className="text-sm text-gray-700">{c.name}</span>
              </label>
            ))}
          </div>
          {selectedCategories.length > 0 && (
            <p className="text-xs text-amber-600 mt-1">✓ {selectedCategories.length} category चुनी गई</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">DB Reference / SKU Code</label>
          <input value={form.db_reference} onChange={e => setForm({ ...form, db_reference: e.target.value })}
            placeholder="अपना internal code / SKU यहाँ डालें"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-400" />
          <p className="text-xs text-gray-400 mt-1">यह code सिर्फ आपके reference के लिए है — customer को नहीं दिखेगा</p>
        </div>

        <button onClick={handleSubmit} disabled={uploading || saving}
          className="bg-amber-500 text-white px-6 py-2 rounded-lg hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed">
          {saving ? 'Saving...' : 'Save Product'}
        </button>
      </div>
    </div>
  );
}