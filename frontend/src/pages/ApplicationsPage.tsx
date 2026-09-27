import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { applicationsApi } from '../api/endpoints';
import { Card, Badge, ErrorState, Skeleton } from '../components/ui/Common';
import {
  BookmarkCheck, Clock, ExternalLink, Trash2, Edit3, CheckCircle2,
  AlertTriangle, ArrowRight, Filter, Plus, ChevronRight, FileText
} from 'lucide-react';

const PIPELINE_STAGES = [
  { key: 'SAVED', label: 'Saved', color: 'bg-slate-100 text-slate-700 border-slate-200' },
  { key: 'PREPARING', label: 'Preparing', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { key: 'READY', label: 'Ready', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  { key: 'APPLIED', label: 'Applied', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  { key: 'SHORTLISTED', label: 'Shortlisted', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  { key: 'SELECTED', label: 'Selected 🎉', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
];

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNotes, setEditNotes] = useState('');

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [apps, st] = await Promise.all([
        applicationsApi.getAll(),
        applicationsApi.getStats().catch(() => null),
      ]);
      setApplications(apps);
      setStats(st);
    } catch (err: unknown) {
      const apiErr = err as { message?: string };
      setError(apiErr.message || 'Unable to load applications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleStatusChange = async (appId: string, newStatus: string) => {
    try {
      await applicationsApi.update(appId, { status: newStatus });
      fetchData();
    } catch (err: unknown) {
      const apiErr = err as { message?: string };
      alert(apiErr.message || 'Failed to update status');
    }
  };

  const handleSaveNotes = async (appId: string) => {
    try {
      await applicationsApi.update(appId, { notes: editNotes });
      setEditingId(null);
      fetchData();
    } catch (err: unknown) {
      const apiErr = err as { message?: string };
      alert(apiErr.message || 'Failed to save notes');
    }
  };

  const handleDelete = async (appId: string) => {
    if (!confirm('Remove this opportunity from your application tracker?')) return;
    try {
      await applicationsApi.delete(appId);
      setApplications((prev) => prev.filter((a) => a.id !== appId));
    } catch (err: unknown) {
      const apiErr = err as { message?: string };
      alert(apiErr.message || 'Failed to delete application');
    }
  };

  const filteredApps = useMemo(() => {
    if (selectedStatus === 'ALL') return applications;
    return applications.filter((a) => a.status === selectedStatus);
  }, [applications, selectedStatus]);

  if (loading) {
    return (
      <div className="space-y-6 max-w-6xl mx-auto py-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-20 w-full rounded-2xl" />
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error && applications.length === 0) {
    return (
      <div className="max-w-xl mx-auto py-16">
        <ErrorState
          title="We couldn't load your application tracker."
          message={error}
          onRetry={fetchData}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2.5">
            <BookmarkCheck className="w-7 h-7 text-blue-600" /> Application Pipeline
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Track your progress across every opportunity from initial save to final selection.
          </p>
        </div>
        <Link
          to="/opportunities"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-subtle transition-all"
        >
          <Plus className="w-4 h-4" /> Discover More
        </Link>
      </div>

      {/* Visual Pipeline Bar: SAVED → PREPARING → READY → APPLIED → SHORTLISTED → SELECTED */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-subtle">
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">
          LIFECYCLE PIPELINE
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {PIPELINE_STAGES.map((stage, idx) => {
            const count = applications.filter((a) => a.status === stage.key).length;
            const isFilterActive = selectedStatus === stage.key;

            return (
              <button
                key={stage.key}
                onClick={() => setSelectedStatus(isFilterActive ? 'ALL' : stage.key)}
                className={`p-3 rounded-2xl border text-left transition-all relative ${
                  isFilterActive
                    ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold text-slate-400">0{idx + 1}</span>
                  <span className={`text-xs font-extrabold px-1.5 py-0.2 rounded-full ${
                    count > 0 ? 'bg-slate-900 text-white' : 'text-slate-400'
                  }`}>
                    {count}
                  </span>
                </div>
                <p className="text-xs font-bold text-slate-900 line-clamp-1">{stage.label}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter indicator */}
      {selectedStatus !== 'ALL' && (
        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl text-xs text-blue-900 font-semibold border border-blue-200">
          <span>Filtering by stage: <strong>{selectedStatus}</strong> ({filteredApps.length})</span>
          <button onClick={() => setSelectedStatus('ALL')} className="underline text-blue-700">Show All</button>
        </div>
      )}

      {/* Application List */}
      {filteredApps.length === 0 ? (
        <div className="py-16 text-center bg-slate-50 border border-dashed border-slate-200 rounded-3xl">
          <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No applications in this stage</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Save opportunities or transition existing entries through the pipeline.
          </p>
          <Link
            to="/opportunities"
            className="mt-4 inline-block px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition-all"
          >
            Explore Opportunities
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredApps.map((app) => {
            const opp = app.opportunity;
            const isEditing = editingId === app.id;
            const deadline = opp?.deadline ? new Date(opp.deadline) : null;
            const daysLeft = deadline
              ? Math.ceil((deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
              : null;

            return (
              <div
                key={app.id}
                className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-subtle hover:border-slate-300 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700">
                        {opp?.category || 'Opportunity'}
                      </span>
                      {daysLeft != null && (
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                          daysLeft <= 2
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : daysLeft <= 7
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          {daysLeft <= 0 ? 'Due today' : `${daysLeft} days left`}
                        </span>
                      )}
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-slate-900">
                      {opp?.title || 'Untitled Opportunity'}
                    </h3>
                    <p className="text-xs font-semibold text-slate-500">
                      {opp?.organization || 'Verified Program Partner'}
                    </p>
                  </div>

                  {/* Stage Switcher Dropdown */}
                  <div className="flex items-center gap-3 shrink-0">
                    <select
                      value={app.status}
                      onChange={(e) => handleStatusChange(app.id, e.target.value)}
                      className="py-1.5 px-3 text-xs font-bold border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
                    >
                      {PIPELINE_STAGES.map((s) => (
                        <option key={s.key} value={s.key}>
                          {s.label}
                        </option>
                      ))}
                      <option value="REJECTED">Archived / Rejected</option>
                    </select>

                    <button
                      onClick={() => handleDelete(app.id)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                      title="Delete from tracker"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Notes & Action Area */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex-1">
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={editNotes}
                          onChange={(e) => setEditNotes(e.target.value)}
                          placeholder="Application notes, links, contacts..."
                          className="flex-1 p-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                          onClick={() => handleSaveNotes(app.id)}
                          className="px-3 py-2 bg-slate-900 text-white font-bold rounded-xl"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="px-2 py-2 text-slate-500"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-slate-500">
                        <span className="italic">{app.notes || 'No notes added.'}</span>
                        <button
                          onClick={() => { setEditingId(app.id); setEditNotes(app.notes || ''); }}
                          className="text-blue-600 hover:underline flex items-center gap-1 font-semibold"
                        >
                          <Edit3 className="w-3 h-3" /> Edit
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {opp?.applyUrl && (
                      <a
                        href={opp.applyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline"
                      >
                        <span>Official Portal</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                    <Link
                      to={`/opportunities/${opp?.id}`}
                      className="px-3.5 py-1.5 bg-slate-900 hover:bg-blue-600 text-white font-bold rounded-xl transition-all"
                    >
                      Details →
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
