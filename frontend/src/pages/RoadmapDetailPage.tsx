import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { roadmapsApi, resourcesApi } from '../api/endpoints';
import { Card, Badge, ProgressBar, ErrorState, Skeleton } from '../components/ui/Common';
import {
  ArrowLeft, CheckCircle2, Circle, Clock, BookOpen, Brain,
  ExternalLink, PlayCircle, FileText, Code2, Sparkles, ChevronDown, ChevronUp, Check, Play
} from 'lucide-react';

export default function RoadmapDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [roadmap, setRoadmap] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});

  const fetchRoadmap = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await roadmapsApi.getById(id);
      setRoadmap(data);
      const initialExpanded: Record<string, boolean> = {};
      data.modules?.forEach((m: any) => {
        initialExpanded[m.id] = true;
      });
      setExpandedModules(initialExpanded);
    } catch (err: unknown) {
      const apiErr = err as { message?: string };
      setError(apiErr.message || "We couldn't load your roadmap.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoadmap();
  }, [id]);

  const toggleModule = (modId: string) => {
    setExpandedModules((prev) => ({ ...prev, [modId]: !prev[modId] }));
  };

  const handleUpdateStatus = async (resourceId: string, status: string) => {
    try {
      await resourcesApi.updateProgress(resourceId, status);
      if (id) {
        const updated = await roadmapsApi.getById(id);
        setRoadmap(updated);
      }
    } catch (err: unknown) {
      const apiErr = err as { message?: string };
      alert(apiErr.message || 'Failed to update progress');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto py-4">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-44 w-full rounded-3xl" />
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error && !roadmap) {
    return (
      <div className="max-w-xl mx-auto py-16">
        <ErrorState
          title="We couldn't load your roadmap."
          message={error}
          onRetry={fetchRoadmap}
        />
      </div>
    );
  }

  if (!roadmap) return null;

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <Link
          to="/roadmaps"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Roadmaps
        </Link>
      </div>

      {/* Header Banner */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 space-y-4 shadow-subtle">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
            {roadmap.goal?.name || 'Verified Career Track'}
          </span>
          <span className="text-xs text-slate-500 font-semibold">
            {roadmap.modules?.length} Structured Modules
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          {roadmap.title}
        </h1>
        <p className="text-sm text-slate-600 max-w-3xl leading-relaxed">
          {roadmap.description}
        </p>

        {roadmap.progress && (
          <div className="pt-4 border-t border-slate-100 space-y-2">
            <div className="flex justify-between items-center text-xs font-bold">
              <span className="text-slate-700">Curriculum Progress</span>
              <span className="text-blue-600">{roadmap.progress.percentage}% Completed</span>
            </div>
            <ProgressBar value={roadmap.progress.percentage} color="bg-blue-600" />
            <p className="text-[11px] text-slate-500 font-medium">
              {roadmap.progress.completedResources} of {roadmap.progress.totalResources} modules & resources completed in Supabase
            </p>
          </div>
        )}
      </div>

      {/* Visual Timeline / Path Structure */}
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-bold text-slate-900">Visual Learning Path</h2>
        </div>

        <div className="relative pl-6 sm:pl-8 border-l-2 border-slate-200 space-y-8">
          {roadmap.modules?.map((mod: any, index: number) => {
            const isExpanded = expandedModules[mod.id] ?? true;
            const completedResourcesCount = mod.resources?.filter(
              (r: any) => r.progress?.status === 'COMPLETED'
            ).length || 0;
            const totalResourcesCount = mod.resources?.length || 0;
            const isModuleDone = totalResourcesCount > 0 && completedResourcesCount === totalResourcesCount;
            const isCurrent = !isModuleDone && (index === 0 || mod.resources?.some((r: any) => r.progress?.status === 'IN_PROGRESS'));

            return (
              <div key={mod.id} className="relative group">
                {/* Timeline node icon */}
                <div
                  className={`absolute -left-[35px] sm:-left-[43px] top-4 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-subtle transition-all ${
                    isModuleDone
                      ? 'bg-emerald-500 text-white'
                      : isCurrent
                      ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                      : 'bg-white border-2 border-slate-300 text-slate-500'
                  }`}
                >
                  {isModuleDone ? <Check className="w-4 h-4 stroke-[3]" /> : isCurrent ? <Play className="w-3.5 h-3.5 fill-white" /> : index + 1}
                </div>

                {/* Module Card */}
                <div className={`bg-white border rounded-2xl overflow-hidden shadow-subtle transition-all ${
                  isCurrent ? 'border-blue-400 ring-1 ring-blue-100' : 'border-slate-200'
                }`}>
                  <div
                    onClick={() => toggleModule(mod.id)}
                    className="p-5 flex items-center justify-between cursor-pointer hover:bg-slate-50/50 transition-colors"
                  >
                    <div className="min-w-0 pr-3">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          STAGE {index + 1}
                        </span>
                        {isCurrent && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                            CURRENT FOCUS
                          </span>
                        )}
                        {mod.difficulty && (
                          <Badge variant="outline" className="capitalize text-[10px]">
                            {mod.difficulty}
                          </Badge>
                        )}
                        {mod.skill && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700">
                            {mod.skill.name}
                          </span>
                        )}
                      </div>
                      <h3 className="text-base font-bold text-slate-900">{mod.title}</h3>
                      {mod.description && (
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">{mod.description}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xs font-semibold text-slate-500 hidden sm:inline-block">
                        {completedResourcesCount}/{totalResourcesCount} Done
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                  </div>

                  {/* Module Content */}
                  {isExpanded && (
                    <div className="px-5 pb-5 pt-3 border-t border-slate-100 space-y-4 bg-slate-50/40">
                      {mod.resources && mod.resources.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                            <BookOpen className="w-3.5 h-3.5" /> Curated Milestone Resources
                          </h4>
                          <div className="space-y-2">
                            {mod.resources.map((res: any) => {
                              const isDone = res.progress?.status === 'COMPLETED';
                              const inProg = res.progress?.status === 'IN_PROGRESS';

                              return (
                                <div
                                  key={res.id}
                                  className="p-3.5 bg-white border border-slate-200/90 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-subtle hover:border-blue-300 transition-colors"
                                >
                                  <div className="flex items-start gap-3 min-w-0">
                                    <div className="p-2 rounded-lg bg-slate-100 text-slate-700 shrink-0 mt-0.5">
                                      {res.type === 'YOUTUBE' ? (
                                        <PlayCircle className="w-4 h-4 text-red-500" />
                                      ) : res.type === 'GITHUB' ? (
                                        <Code2 className="w-4 h-4" />
                                      ) : (
                                        <FileText className="w-4 h-4 text-blue-600" />
                                      )}
                                    </div>
                                    <div className="min-w-0">
                                      <span className="text-[10px] font-bold text-slate-400 uppercase">
                                        {res.provider || res.type}
                                      </span>
                                      <p className="text-xs font-bold text-slate-900 truncate mt-0.5">
                                        {res.title}
                                      </p>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2 shrink-0 sm:ml-4">
                                    {res.url && (
                                      <a
                                        href={res.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg text-xs"
                                        title="Open resource"
                                      >
                                        <ExternalLink className="w-3.5 h-3.5" />
                                      </a>
                                    )}

                                    <button
                                      onClick={() => handleUpdateStatus(res.id, isDone ? 'NOT_STARTED' : 'COMPLETED')}
                                      className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all flex items-center gap-1.5 ${
                                        isDone
                                          ? 'border-emerald-300 text-emerald-700 bg-emerald-50'
                                          : inProg
                                          ? 'border-blue-300 text-blue-700 bg-blue-50'
                                          : 'border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
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
                        </div>
                      )}

                      {/* Assessments in module */}
                      {mod.assessments && mod.assessments.length > 0 && (
                        <div className="pt-2">
                          <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                            <Brain className="w-3.5 h-3.5 text-indigo-600" /> Milestone Verification Quizzes
                          </h4>
                          <div className="space-y-2">
                            {mod.assessments.map((a: any) => (
                              <div
                                key={a.id}
                                className="p-3 bg-white border border-indigo-100 rounded-xl flex items-center justify-between shadow-subtle"
                              >
                                <div>
                                  <p className="text-xs font-bold text-slate-900">{a.title}</p>
                                  <p className="text-[11px] text-slate-500">Test understanding and update skill confidence</p>
                                </div>
                                <Link
                                  to={`/assessments/${a.id}`}
                                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-subtle"
                                >
                                  Take Quiz →
                                </Link>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
