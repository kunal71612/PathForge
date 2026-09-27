import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { roadmapsApi } from '../api/endpoints';
import { Card, Badge, ErrorState, Skeleton } from '../components/ui/Common';
import { Map, Layers, Clock, BookOpen, Brain, ArrowRight, Sparkles } from 'lucide-react';

export default function RoadmapsPage() {
  const [roadmaps, setRoadmaps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRoadmaps = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await roadmapsApi.getAll();
      setRoadmaps(data);
    } catch (err: unknown) {
      const apiErr = err as { message?: string };
      setError(apiErr.message || "We couldn't load your roadmaps.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoadmaps();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 max-w-6xl mx-auto py-4">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-64 w-full rounded-3xl" />
          <Skeleton className="h-64 w-full rounded-3xl" />
        </div>
      </div>
    );
  }

  if (error && roadmaps.length === 0) {
    return (
      <div className="max-w-xl mx-auto py-16">
        <ErrorState
          title="We couldn't load learning roadmaps."
          message={error}
          onRetry={fetchRoadmaps}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2.5">
          <Map className="w-7 h-7 text-blue-600" /> Learning Roadmaps
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Curated step-by-step milestone tracks with structured documentation, practical projects, and verification quizzes.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {roadmaps.map((rm) => {
          const totalResources = rm.modules.reduce((sum: number, m: any) => sum + (m._count?.resources || 0), 0);
          const totalAssessments = rm.modules.reduce((sum: number, m: any) => sum + (m._count?.assessments || 0), 0);

          return (
            <div
              key={rm.id}
              className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-subtle hover:shadow-card hover:border-blue-400 transition-all duration-200 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                    {rm.goal?.name || 'Skill Track'}
                  </span>
                  <span className="text-xs text-slate-500 font-semibold">
                    {rm.modules.length} Modules
                  </span>
                </div>

                <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">{rm.title}</h2>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  {rm.description || 'Master core engineering building blocks from foundational concepts to advanced projects.'}
                </p>

                {/* Modules Outline preview */}
                <div className="mt-5 pt-4 border-t border-slate-100 space-y-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Curriculum Milestones
                  </span>
                  <div className="space-y-2">
                    {rm.modules.slice(0, 4).map((mod: any, idx: number) => (
                      <div key={mod.id} className="flex items-center gap-2.5 text-xs text-slate-800">
                        <span className="w-5 h-5 rounded-full bg-slate-100 text-[10px] font-bold flex items-center justify-center shrink-0 text-slate-600">
                          {idx + 1}
                        </span>
                        <span className="truncate font-semibold">{mod.title}</span>
                        {mod.skill && (
                          <span className="text-[10px] text-slate-500 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-md ml-auto shrink-0 font-medium">
                            {mod.skill.name}
                          </span>
                        )}
                      </div>
                    ))}
                    {rm.modules.length > 4 && (
                      <p className="text-[11px] text-slate-400 pl-7 font-medium">
                        +{rm.modules.length - 4} more advanced modules
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span className="flex items-center gap-1 font-medium">
                    <BookOpen className="w-3.5 h-3.5 text-slate-400" /> {totalResources} resources
                  </span>
                  <span className="flex items-center gap-1 font-medium">
                    <Brain className="w-3.5 h-3.5 text-slate-400" /> {totalAssessments} quizzes
                  </span>
                </div>
                <Link
                  to={`/roadmaps/${rm.id}`}
                  className="px-4 py-2 bg-slate-900 hover:bg-blue-600 text-white text-xs font-bold rounded-xl shadow-subtle flex items-center gap-1.5 transition-all"
                >
                  <span>Explore Path</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
