import { useState, useEffect } from 'react';
import { goalsApi, profileApi } from '../api/endpoints';
import { useAuth } from '../hooks/useAuth';
import { Card, Badge, ErrorState, Skeleton } from '../components/ui/Common';
import { Target, CheckCircle, ArrowRight, Sparkles, BookOpen, Layers, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function GoalsPage() {
  const { user, refreshUser } = useAuth();
  const [goals, setGoals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchGoals = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await goalsApi.getAll();
      setGoals(data);
    } catch (err: unknown) {
      const apiErr = err as { message?: string };
      setError(apiErr.message || 'Unable to load goals.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleSelectGoal = async (goalId: string) => {
    setSavingId(goalId);
    try {
      await profileApi.update({ goalId });
      await refreshUser();
      navigate('/roadmaps');
    } catch (err: unknown) {
      const apiErr = err as { message?: string };
      alert(apiErr.message || 'Failed to select goal');
    } finally {
      setSavingId(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-6xl mx-auto py-4">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-64 w-full rounded-3xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error && goals.length === 0) {
    return (
      <div className="max-w-xl mx-auto py-16">
        <ErrorState
          title="We couldn't load career goals."
          message={error}
          onRetry={fetchGoals}
        />
      </div>
    );
  }

  const currentGoalId = user?.profile?.goalId;

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2.5">
          <Target className="w-7 h-7 text-blue-600" /> Choose Your Target Goal
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Select a role or milestone. PathForge will tailor curriculum roadmaps, skill priorities, and high-match opportunity recommendations to this target.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {goals.map((goal) => {
          const isSelected = currentGoalId === goal.id;
          const isSaving = savingId === goal.id;

          return (
            <div
              key={goal.id}
              className={`bg-white rounded-3xl p-6 shadow-subtle flex flex-col justify-between transition-all duration-200 ${
                isSelected
                  ? 'border-2 border-blue-600 ring-4 ring-blue-500/10'
                  : 'border border-slate-200 hover:border-slate-300 hover:shadow-card'
              }`}
            >
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold ${
                    isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'
                  }`}>
                    <Sparkles className="w-6 h-6" />
                  </div>
                  {isSelected && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <Check className="w-3.5 h-3.5 stroke-[3]" /> Active Goal
                    </span>
                  )}
                </div>

                <h3 className="text-lg font-extrabold text-slate-900">{goal.name}</h3>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  {goal.description || 'Comprehensive curriculum path to master core engineering skills and crack top-tier opportunities.'}
                </p>

                {goal.roadmaps && goal.roadmaps.length > 0 && (
                  <div className="mt-5 pt-4 border-t border-slate-100">
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">
                      <Layers className="w-3.5 h-3.5" />
                      <span>{goal.roadmaps.length} Structured {goal.roadmaps.length === 1 ? 'Roadmap' : 'Roadmaps'}</span>
                    </div>
                    <div className="space-y-1.5">
                      {goal.roadmaps.map((rm: any) => (
                        <div key={rm.id} className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                          <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                          <span className="truncate">{rm.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => handleSelectGoal(goal.id)}
                  disabled={isSelected || isSaving}
                  className={`w-full py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                    isSelected
                      ? 'bg-slate-100 text-slate-500 cursor-default'
                      : 'bg-slate-900 hover:bg-blue-600 text-white shadow-subtle'
                  }`}
                >
                  {isSaving ? (
                    'Activating...'
                  ) : isSelected ? (
                    'Current Active Goal ✓'
                  ) : (
                    <>
                      <span>Select This Goal</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
