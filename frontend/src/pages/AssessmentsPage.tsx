import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { assessmentsApi } from '../api/endpoints';
import { Card, Badge, ErrorState, Skeleton } from '../components/ui/Common';
import { Brain, CheckCircle2, ArrowRight, Sparkles, Clock, HelpCircle, Trophy } from 'lucide-react';

export default function AssessmentsPage() {
  const [assessments, setAssessments] = useState<any[]>([]);
  const [attempts, setAttempts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [allAss, myAtt] = await Promise.all([
        assessmentsApi.getAll(),
        assessmentsApi.getAttempts().catch(() => []),
      ]);
      setAssessments(allAss);
      setAttempts(myAtt);
    } catch (err: unknown) {
      const apiErr = err as { message?: string };
      setError(apiErr.message || 'Unable to load assessments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const latestAttemptMap = new Map<string, any>();
  attempts.forEach((att) => {
    if (!latestAttemptMap.has(att.assessmentId)) {
      latestAttemptMap.set(att.assessmentId, att);
    }
  });

  if (loading) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto py-4">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-56 w-full rounded-3xl" />
          <Skeleton className="h-56 w-full rounded-3xl" />
        </div>
      </div>
    );
  }

  if (error && assessments.length === 0) {
    return (
      <div className="max-w-xl mx-auto py-16">
        <ErrorState
          title="We couldn't load skill assessments."
          message={error}
          onRetry={fetchData}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2.5">
          <Brain className="w-7 h-7 text-blue-600" /> Skill Verification Quizzes
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Prove your mastery with verified diagnostic tests. Results directly recalculate your skill confidence and unlock opportunities.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {assessments.map((quiz) => {
          const attempt = latestAttemptMap.get(quiz.id);
          const hasPassed = attempt && attempt.percentage >= 70;

          return (
            <div
              key={quiz.id}
              className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-subtle hover:shadow-card hover:border-blue-400 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700">
                    {quiz.skill?.name || 'Skill Quiz'}
                  </span>
                  {attempt ? (
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                      hasPassed
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                      {hasPassed ? 'Passed' : 'Completed'} ({attempt.percentage}%)
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-50 text-slate-400 border border-slate-200">
                      Not Taken
                    </span>
                  )}
                </div>

                <h3 className="text-lg font-extrabold text-slate-900">{quiz.title}</h3>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed line-clamp-2">
                  {quiz.description || 'Test your practical and conceptual understanding with instant backend evaluation and confidence updates.'}
                </p>

                {quiz.module?.roadmap && (
                  <p className="text-[11px] text-slate-500 mt-3 flex items-center gap-1.5 font-medium">
                    <span className="font-bold text-slate-700">Curriculum:</span> {quiz.module.roadmap.title}
                  </p>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3 text-xs text-slate-400 font-medium">
                  <span className="flex items-center gap-1">
                    <HelpCircle className="w-3.5 h-3.5" /> {quiz._count?.questions || 5} questions
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> ~10 mins
                  </span>
                </div>

                <Link
                  to={`/assessments/${quiz.id}`}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-subtle flex items-center gap-1.5 transition-all"
                >
                  <span>{attempt ? 'Retake Quiz' : 'Start Quiz'}</span>
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
