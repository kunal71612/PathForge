import { useState, useEffect } from 'react';
import { roadmapsApi, goalsApi, adminApi } from '../../api/endpoints';
import { Card, Badge, Modal, LoadingState, ErrorState } from '../../components/ui/Common';
import { Map, Plus, Trash2, Layers, BookOpen, Brain } from 'lucide-react';

export default function AdminRoadmapsPage() {
  const [roadmaps, setRoadmaps] = useState<any[]>([]);
  const [goals, setGoals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    goalId: '',
  });
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [rmData, goalsData] = await Promise.all([
        roadmapsApi.getAll(),
        goalsApi.getAll().catch(() => []),
      ]);
      setRoadmaps(rmData);
      setGoals(goalsData);
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to load roadmaps');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminApi.createRoadmap({
        title: formData.title,
        description: formData.description,
        goalId: formData.goalId || null,
      });
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      alert(err?.response?.data?.error || 'Failed to create roadmap');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this roadmap and its modules?')) return;
    try {
      await adminApi.deleteRoadmap(id);
      setRoadmaps((prev) => prev.filter((r) => r.id !== id));
    } catch (err: any) {
      alert(err?.response?.data?.error || 'Failed to delete roadmap');
    }
  };

  if (loading) return <LoadingState message="Loading roadmaps architecture..." />;
  if (error) return <ErrorState message={error} onRetry={fetchData} />;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-primary flex items-center gap-2">
            <Map className="w-6 h-6" /> Manage Learning Roadmaps
          </h1>
          <p className="text-sm text-secondary mt-1">
            Build structured learning milestones, link skills, and configure goal tracks.
          </p>
        </div>
        <button
          onClick={() => {
            setFormData({ title: '', description: '', goalId: goals[0]?.id || '' });
            setIsModalOpen(true);
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-lg text-xs font-semibold hover:bg-black transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" /> Create Roadmap
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {roadmaps.map((rm) => (
          <Card key={rm.id} className="flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <Badge variant="default">{rm.goal?.name || 'Track'}</Badge>
                <button
                  onClick={() => handleDelete(rm.id)}
                  className="p-1.5 text-secondary hover:text-danger rounded hover:bg-danger-light transition-colors"
                  title="Delete Roadmap"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <h3 className="text-lg font-bold text-primary">{rm.title}</h3>
              <p className="text-xs text-secondary mt-1 leading-relaxed">{rm.description}</p>

              {/* Modules count preview */}
              <div className="mt-4 pt-3 border-t border-border flex items-center gap-4 text-xs text-secondary">
                <span className="flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5" /> {rm.modules?.length || 0} Modules
                </span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Create Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Learning Roadmap"
      >
        <form onSubmit={handleCreate} className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-primary block mb-1">Roadmap Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Modern Full-Stack Web Development Track"
              className="w-full p-2.5 border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div>
            <label className="font-bold text-primary block mb-1">Target Goal Track</label>
            <select
              value={formData.goalId}
              onChange={(e) => setFormData({ ...formData, goalId: e.target.value })}
              className="w-full p-2.5 border border-border rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">None / Standalone</option>
              {goals.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-bold text-primary block mb-1">Description</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Detailed description of what this roadmap covers from basics to production..."
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
              {saving ? 'Creating...' : 'Create Roadmap'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
