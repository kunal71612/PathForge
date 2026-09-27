import { useState, useEffect, useMemo } from 'react';
import { resourcesApi, skillsApi } from '../api/endpoints';
import { Card, Badge, ErrorState, Skeleton } from '../components/ui/Common';
import {
  BookOpen, Search, ExternalLink, CheckCircle2, Circle, Clock,
  PlayCircle, FileText, Code2, GraduationCap, Filter, Sparkles
} from 'lucide-react';

export default function LearnPage() {
  const [resources, setResources] = useState<any[]>([]);
  const [myProgress, setMyProgress] = useState<any[]>([]);
  const [skills, setSkills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [resData, progData, skillsData] = await Promise.all([
        resourcesApi.getAll(),
        resourcesApi.getMyProgress().catch(() => []),
        skillsApi.getAll().catch(() => []),
      ]);
      setResources(resData);
      setMyProgress(progData);
      setSkills(skillsData);
    } catch (err: unknown) {
      const apiErr = err as { message?: string };
      setError(apiErr.message || 'Unable to load learning resources.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const progressMap = useMemo(() => {
    const map = new Map<string, string>();
    myProgress.forEach((p) => {
      map.set(p.resourceId, p.status);
    });
    return map;
  }, [myProgress]);

  const handleUpdateStatus = async (resourceId: string, status: string) => {
    try {
      await resourcesApi.updateProgress(resourceId, status);
      const updatedProg = await resourcesApi.getMyProgress();
      setMyProgress(updatedProg);
    } catch (err: unknown) {
      const apiErr = err as { message?: string };
      alert(apiErr.message || 'Failed to update progress');
    }
  };

  const filteredResources = useMemo(() => {
    return resources.filter((r) => {
      if (search) {
        const query = search.toLowerCase();
        const matchesTitle = r.title.toLowerCase().includes(query);
        const matchesDesc = r.description?.toLowerCase().includes(query);
        const matchesProvider = r.provider?.toLowerCase().includes(query);
        const matchesSkill = r.skill?.name?.toLowerCase().includes(query);
        if (!matchesTitle && !matchesDesc && !matchesProvider && !matchesSkill) return false;
      }
      if (selectedSkill && r.skillId !== selectedSkill) return false;
      if (selectedType && r.type !== selectedType) return false;
      if (selectedStatus) {
        const currentStatus = progressMap.get(r.id) || 'NOT_STARTED';
        if (currentStatus !== selectedStatus) return false;
      }
      return true;
    });
  }, [resources, search, selectedSkill, selectedType, selectedStatus, progressMap]);

  if (loading) {
    return (
      <div className="space-y-6 max-w-6xl mx-auto py-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-16 w-full rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-64 w-full rounded-3xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error && resources.length === 0) {
    return (
      <div className="max-w-xl mx-auto py-16">
        <ErrorState
          title="We couldn't load learning resources."
          message={error}
          onRetry={fetchData}
        />
      </div>
    );
  }

  const completedCount = myProgress.filter((p) => p.status === 'COMPLETED').length;

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2.5">
            <BookOpen className="w-7 h-7 text-blue-600" /> Curated Learning Library
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Top external tutorials, official documentation, courses, and repositories to close your skill gaps.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            {completedCount} of {resources.length} Completed
          </span>
        </div>
      </div>

      {/* Filter bar */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-subtle">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search resources, topics..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
            />
          </div>

          <select
            value={selectedSkill}
            onChange={(e) => setSelectedSkill(e.target.value)}
            className="w-full py-2 px-3 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700"
          >
            <option value="">All Skills</option>
            {skills.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full py-2 px-3 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700"
          >
            <option value="">All Types</option>
            <option value="YOUTUBE">Video / YouTube</option>
            <option value="COURSE">Courses</option>
            <option value="DOCUMENTATION">Documentation</option>
            <option value="ARTICLE">Articles / Guides</option>
            <option value="GITHUB">GitHub Projects</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full py-2 px-3 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700"
          >
            <option value="">All Statuses</option>
            <option value="NOT_STARTED">Not Started</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>
      </div>

      {/* Resource Grid */}
      {filteredResources.length === 0 ? (
        <div className="py-16 text-center bg-slate-50 border border-dashed border-slate-200 rounded-3xl">
          <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No resources found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Try resetting your search query or adjusting your skill filters.
          </p>
          <button
            onClick={() => { setSearch(''); setSelectedSkill(''); setSelectedType(''); setSelectedStatus(''); }}
            className="mt-4 px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition-all"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResources.map((res) => {
            const status = progressMap.get(res.id) || 'NOT_STARTED';
            const isDone = status === 'COMPLETED';
            const inProg = status === 'IN_PROGRESS';

            return (
              <div
                key={res.id}
                className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-subtle hover:shadow-card hover:border-blue-400 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700">
                      {res.provider || res.type}
                    </span>
                    {isDone ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Done
                      </span>
                    ) : inProg ? (
                      <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                        In Progress
                      </span>
                    ) : (
                      <span className="text-[11px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-200">
                        Available
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-extrabold text-slate-900 line-clamp-1">{res.title}</h3>
                  {res.description && (
                    <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
                      {res.description}
                    </p>
                  )}

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    {res.skill && (
                      <span className="px-2.5 py-0.5 rounded-lg bg-slate-50 border border-slate-200 font-semibold text-slate-700 text-[11px]">
                        {res.skill.name}
                      </span>
                    )}
                    {res.duration && (
                      <span className="flex items-center gap-1 font-medium">
                        <Clock className="w-3.5 h-3.5 text-slate-400" /> {res.duration}
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                  {res.url ? (
                    <a
                      href={res.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-bold text-slate-600 hover:text-blue-600 flex items-center gap-1.5"
                    >
                      <span>Study Resource</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  ) : (
                    <div />
                  )}

                  <button
                    onClick={() => handleUpdateStatus(res.id, isDone ? 'NOT_STARTED' : 'COMPLETED')}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
                      isDone
                        ? 'border-emerald-300 text-emerald-700 bg-emerald-50'
                        : 'border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-50 shadow-subtle'
                    }`}
                  >
                    {isDone ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Completed</span>
                      </>
                    ) : (
                      <>
                        <Circle className="w-3.5 h-3.5 text-slate-400" />
                        <span>Mark Done</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
