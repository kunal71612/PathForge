import { useState, useEffect } from 'react';
import { opportunitiesApi, adminApi } from '../../api/endpoints';
import { Card, Badge, Modal, LoadingState, ErrorState } from '../../components/ui/Common';
import { Compass, Plus, Trash2, Edit3, ExternalLink, Search } from 'lucide-react';

export default function AdminOpportunitiesPage() {
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    organization: '',
    category: 'INTERNSHIP',
    eligibility: '',
    deadline: '',
    mode: 'online',
    cost: 'free',
    applyUrl: '',
    description: '',
  });
  const [saving, setSaving] = useState(false);

  const fetchOpps = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await opportunitiesApi.getAll();
      setOpportunities(data);
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to load opportunities');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOpps();
  }, []);

  const openCreateModal = () => {
    setEditingId(null);
    setFormData({
      title: '',
      organization: '',
      category: 'INTERNSHIP',
      eligibility: '',
      deadline: '',
      mode: 'online',
      cost: 'free',
      applyUrl: '',
      description: '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (opp: any) => {
    setEditingId(opp.id);
    setFormData({
      title: opp.title,
      organization: opp.organization || '',
      category: opp.category,
      eligibility: opp.eligibility || '',
      deadline: opp.deadline ? opp.deadline.split('T')[0] : '',
      mode: opp.mode || 'online',
      cost: opp.cost || 'free',
      applyUrl: opp.applyUrl || '',
      description: opp.description || '',
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        ...formData,
        deadline: formData.deadline ? new Date(formData.deadline).toISOString() : null,
      };

      if (editingId) {
        await adminApi.updateOpportunity(editingId, payload);
      } else {
        await adminApi.createOpportunity(payload);
      }
      setIsModalOpen(false);
      fetchOpps();
    } catch (err: any) {
      alert(err?.response?.data?.error || 'Failed to save opportunity');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this opportunity?')) return;
    try {
      await adminApi.deleteOpportunity(id);
      setOpportunities((prev) => prev.filter((o) => o.id !== id));
    } catch (err: any) {
      alert(err?.response?.data?.error || 'Failed to delete opportunity');
    }
  };

  const filteredOpps = opportunities.filter((o) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      o.title.toLowerCase().includes(q) ||
      o.organization?.toLowerCase().includes(q) ||
      o.category.toLowerCase().includes(q)
    );
  });

  if (loading) return <LoadingState message="Loading opportunities manager..." />;
  if (error) return <ErrorState message={error} onRetry={fetchOpps} />;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-primary flex items-center gap-2">
            <Compass className="w-6 h-6" /> Manage Opportunities
          </h1>
          <p className="text-sm text-secondary mt-1">
            Publish, edit, and curate hackathons, internships, scholarships, and fellowships.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-lg text-xs font-semibold hover:bg-black transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" /> Add Opportunity
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="w-4 h-4 text-secondary absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Filter by title, organization, category..."
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
                <th className="py-3 px-4">Opportunity</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Mode / Cost</th>
                <th className="py-3 px-4">Deadline</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredOpps.map((opp) => (
                <tr key={opp.id} className="hover:bg-muted/30 transition-colors">
                  <td className="py-3 px-4">
                    <p className="font-bold text-primary">{opp.title}</p>
                    <p className="text-[11px] text-secondary">{opp.organization || 'Open Opportunity'}</p>
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant="outline" className="text-[10px] uppercase font-semibold">
                      {opp.category}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 capitalize text-secondary">
                    {opp.mode || 'Online'} • {opp.cost || 'Free'}
                  </td>
                  <td className="py-3 px-4 text-secondary">
                    {opp.deadline
                      ? new Date(opp.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
                      : 'Rolling'}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEditModal(opp)}
                        className="p-1.5 text-secondary hover:text-primary rounded hover:bg-muted transition-colors"
                        title="Edit Opportunity"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(opp.id)}
                        className="p-1.5 text-secondary hover:text-danger rounded hover:bg-danger-light transition-colors"
                        title="Delete Opportunity"
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
        title={editingId ? 'Edit Opportunity' : 'Create New Opportunity'}
      >
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-primary block mb-1">Opportunity Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Google Summer of Code 2026"
              className="w-full p-2.5 border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-primary block mb-1">Organization</label>
              <input
                type="text"
                value={formData.organization}
                onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                placeholder="e.g. Google, MIT, Devpost"
                className="w-full p-2.5 border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="font-bold text-primary block mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full p-2.5 border border-border rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="INTERNSHIP">Internship</option>
                <option value="HACKATHON">Hackathon</option>
                <option value="SCHOLARSHIP">Scholarship</option>
                <option value="COMPETITION">Competition</option>
                <option value="RESEARCH">Research</option>
                <option value="WORKSHOP">Workshop</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="font-bold text-primary block mb-1">Mode</label>
              <select
                value={formData.mode}
                onChange={(e) => setFormData({ ...formData, mode: e.target.value })}
                className="w-full p-2.5 border border-border rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="online">Online / Remote</option>
                <option value="hybrid">Hybrid</option>
                <option value="offline">In-Person</option>
              </select>
            </div>
            <div>
              <label className="font-bold text-primary block mb-1">Cost</label>
              <select
                value={formData.cost}
                onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                className="w-full p-2.5 border border-border rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="free">Free</option>
                <option value="paid">Paid</option>
              </select>
            </div>
            <div>
              <label className="font-bold text-primary block mb-1">Deadline</label>
              <input
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                className="w-full p-2.5 border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-primary block mb-1">Official Application URL</label>
            <input
              type="url"
              value={formData.applyUrl}
              onChange={(e) => setFormData({ ...formData, applyUrl: e.target.value })}
              placeholder="https://example.com/apply"
              className="w-full p-2.5 border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div>
            <label className="font-bold text-primary block mb-1">Description</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Detailed program description, eligibility requirements, expectations..."
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
              {saving ? 'Saving...' : editingId ? 'Update Opportunity' : 'Create Opportunity'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
