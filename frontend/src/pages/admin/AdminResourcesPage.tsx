import { useState, useEffect } from 'react';
import { resourcesApi, skillsApi, adminApi } from '../../api/endpoints';
import { Card, Badge, Modal, LoadingState, ErrorState } from '../../components/ui/Common';
import { BookOpen, Plus, Trash2, Edit3, ExternalLink, Search } from 'lucide-react';

export default function AdminResourcesPage() {
  const [resources, setResources] = useState<any[]>([]);
  const [skills, setSkills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    provider: '',
    url: '',
    type: 'YOUTUBE',
    duration: '',
    difficulty: 'beginner',
    skillId: '',
    description: '',
  });
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [resData, skillsData] = await Promise.all([
        resourcesApi.getAll(),
        skillsApi.getAll().catch(() => []),
      ]);
      setResources(resData);
      setSkills(skillsData);
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to load resources');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openCreateModal = () => {
    setEditingId(null);
    setFormData({
      title: '',
      provider: '',
      url: '',
      type: 'YOUTUBE',
      duration: '',
      difficulty: 'beginner',
      skillId: skills[0]?.id || '',
      description: '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (res: any) => {
    setEditingId(res.id);
    setFormData({
      title: res.title,
      provider: res.provider || '',
      url: res.url,
      type: res.type,
      duration: res.duration || '',
      difficulty: res.difficulty || 'beginner',
      skillId: res.skillId || '',
      description: res.description || '',
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        ...formData,
        skillId: formData.skillId || null,
      };

      if (editingId) {
        await adminApi.updateResource(editingId, payload);
      } else {
        await adminApi.createResource(payload);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      alert(err?.response?.data?.error || 'Failed to save resource');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this resource?')) return;
    try {
      await adminApi.deleteResource(id);
      setResources((prev) => prev.filter((r) => r.id !== id));
    } catch (err: any) {
      alert(err?.response?.data?.error || 'Failed to delete resource');
    }
  };

  const filtered = resources.filter((r) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      r.title.toLowerCase().includes(q) ||
      r.provider?.toLowerCase().includes(q) ||
      r.skill?.name?.toLowerCase().includes(q)
    );
  });

  if (loading) return <LoadingState message="Loading resource catalog..." />;
  if (error) return <ErrorState message={error} onRetry={fetchData} />;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-primary flex items-center gap-2">
            <BookOpen className="w-6 h-6" /> Curated Learning Catalog
          </h1>
          <p className="text-sm text-secondary mt-1">
            Manage high-quality external resources, tutorials, documentation, and repositories mapped to skills.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-lg text-xs font-semibold hover:bg-black transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" /> Add Resource
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="w-4 h-4 text-secondary absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Filter by title, provider, skill..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-2 text-xs border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      {/* Table */}
      <div className="bg-white border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted text-secondary font-semibold uppercase tracking-wider border-b border-border">
              <tr>
                <th className="py-3 px-4">Title / URL</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Mapped Skill</th>
                <th className="py-3 px-4">Provider / Duration</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((res) => (
                <tr key={res.id} className="hover:bg-muted/30 transition-colors">
                  <td className="py-3 px-4 max-w-xs">
                    <p className="font-bold text-primary truncate">{res.title}</p>
                    <a
                      href={res.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-secondary hover:underline flex items-center gap-1 truncate"
                    >
                      <span className="truncate">{res.url}</span>
                      <ExternalLink className="w-3 h-3 shrink-0" />
                    </a>
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant="outline" className="text-[10px] uppercase font-semibold">
                      {res.type}
                    </Badge>
                  </td>
                  <td className="py-3 px-4">
                    {res.skill ? (
                      <span className="font-semibold text-primary">{res.skill.name}</span>
                    ) : (
                      <span className="text-secondary italic">General</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-secondary">
                    {res.provider || 'Web'} {res.duration ? `• ${res.duration}` : ''}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEditModal(res)}
                        className="p-1.5 text-secondary hover:text-primary rounded hover:bg-muted transition-colors"
                        title="Edit Resource"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(res.id)}
                        className="p-1.5 text-secondary hover:text-danger rounded hover:bg-danger-light transition-colors"
                        title="Delete Resource"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? 'Edit Resource' : 'Add Learning Resource'}
      >
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-primary block mb-1">Resource Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Full Modern React Tutorial (2026)"
              className="w-full p-2.5 border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div>
            <label className="font-bold text-primary block mb-1">Direct External URL *</label>
            <input
              type="url"
              required
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              placeholder="https://youtube.com/... or https://docs..."
              className="w-full p-2.5 border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-primary block mb-1">Format / Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full p-2.5 border border-border rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="YOUTUBE">YouTube Video</option>
                <option value="DOCUMENTATION">Official Documentation</option>
                <option value="COURSE">Interactive Course</option>
                <option value="ARTICLE">Article / Tutorial</option>
                <option value="GITHUB">GitHub Repository</option>
                <option value="PRACTICE">Hands-on Practice</option>
              </select>
            </div>
            <div>
              <label className="font-bold text-primary block mb-1">Target Skill</label>
              <select
                value={formData.skillId}
                onChange={(e) => setFormData({ ...formData, skillId: e.target.value })}
                className="w-full p-2.5 border border-border rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="">None / General</option>
                {skills.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-primary block mb-1">Provider / Channel</label>
              <input
                type="text"
                value={formData.provider}
                onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                placeholder="e.g. FreeCodeCamp, MDN, Fireship"
                className="w-full p-2.5 border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="font-bold text-primary block mb-1">Estimated Duration</label>
              <input
                type="text"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                placeholder="e.g. 45 mins, 2 hours"
                className="w-full p-2.5 border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-primary block mb-1">Description</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="What will the student learn from this resource?"
              className="w-full p-2.5 border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="pt-3 border-t border-border flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 border border-border rounded-lg text-secondary hover:bg-muted"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-primary text-white rounded-lg font-bold hover:bg-black disabled:opacity-50"
            >
              {saving ? 'Saving...' : editingId ? 'Update Resource' : 'Add Resource'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
