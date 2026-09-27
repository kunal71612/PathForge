import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { applicationsApi } from '../api/endpoints';
import { Card, Badge, ErrorState, Skeleton } from '../components/ui/Common';
import { Calendar as CalendarIcon, Clock, AlertTriangle, ArrowRight, ExternalLink, Flame, Sparkles } from 'lucide-react';

export default function CalendarPage() {
  const [deadlines, setDeadlines] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDeadlines = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await applicationsApi.getDeadlines();
      setDeadlines(data);
    } catch (err: unknown) {
      const apiErr = err as { message?: string };
      setError(apiErr.message || 'Unable to load deadline calendar.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeadlines();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto py-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-20 w-full rounded-2xl" />
        <div className="space-y-4">
          <Skeleton className="h-40 w-full rounded-2xl" />
          <Skeleton className="h-40 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error && !deadlines) {
    return (
      <div className="max-w-xl mx-auto py-16">
        <ErrorState
          title="We couldn't load your deadline calendar."
          message={error}
          onRetry={fetchDeadlines}
        />
      </div>
    );
  }

  if (!deadlines) return null;

  const { critical = [], closingSoon = [], upcoming = [], future = [] } = deadlines;
  const totalTracked = critical.length + closingSoon.length + upcoming.length + future.length;

  const renderSection = (
    title: string,
    subtitle: string,
    items: any[],
    urgencyClass: string,
    badgeVariant: 'danger' | 'warning' | 'brand' | 'default',
    emptyMsg: string
  ) => {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-200">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <span>{title}</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${urgencyClass}`}>
                {items.length}
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
          </div>
        </div>

        {items.length > 0 ? (
          <div className="space-y-3">
            {items.map((app) => {
              const opp = app.opportunity;
              const deadline = new Date(opp.deadline);
              const days = Math.ceil((deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

              return (
                <div
                  key={app.id}
                  className="p-5 bg-white border border-slate-200/90 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-subtle hover:border-slate-300 transition-all"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700">
                        {opp.category}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">
                        Due: {deadline.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>

                    <Link
                      to={`/opportunities/${opp.id}`}
                      className="text-base font-bold text-slate-900 hover:text-blue-600 transition-colors"
                    >
                      {opp.title}
                    </Link>
                    <p className="text-xs font-semibold text-slate-500">{opp.organization || 'Global Program Partner'}</p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                    <span className={`px-3 py-1 rounded-xl text-xs font-bold border ${
                      days <= 2
                        ? 'border-rose-300 text-rose-700 bg-rose-50'
                        : days <= 7
                        ? 'border-amber-300 text-amber-700 bg-amber-50'
                        : 'border-slate-200 text-slate-700 bg-slate-50'
                    }`}>
                      {days <= 0 ? 'Due Today' : `${days} days left`}
                    </span>

                    <Link
                      to={`/opportunities/${opp.id}`}
                      className="px-4 py-2 bg-slate-900 hover:bg-blue-600 text-white text-xs font-bold rounded-xl shadow-subtle transition-all"
                    >
                      View →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-slate-400 italic py-2">{emptyMsg}</p>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2.5">
          <CalendarIcon className="w-7 h-7 text-blue-600" /> Deadline Calendar
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Prioritized timeline of all opportunities saved in your tracker.
        </p>
      </div>

      {totalTracked === 0 ? (
        <div className="py-16 text-center bg-slate-50 border border-dashed border-slate-200 rounded-3xl">
          <Clock className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No deadlines scheduled yet</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Save opportunities to your tracker to see automatic deadline countdowns and alerts.
          </p>
          <Link
            to="/opportunities"
            className="mt-4 inline-block px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition-all"
          >
            Explore Opportunities
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {renderSection(
            'Critical Urgency',
            'Closing within 0 to 2 days — prioritize submission now.',
            critical,
            'bg-rose-100 text-rose-800',
            'danger',
            'No opportunities closing in the next 48 hours.'
          )}

          {renderSection(
            'Closing Soon',
            'Closing within 3 to 7 days — finalize prerequisites and applications.',
            closingSoon,
            'bg-amber-100 text-amber-800',
            'warning',
            'No opportunities closing this week.'
          )}

          {renderSection(
            'Upcoming Deadlines',
            'Closing within 8 to 30 days — plenty of time to close skill gaps.',
            upcoming,
            'bg-blue-100 text-blue-800',
            'brand',
            'No opportunities in the 8-30 day window.'
          )}

          {renderSection(
            'Future Deadlines',
            'Closing in 30+ days or ongoing rolling admissions.',
            future,
            'bg-slate-100 text-slate-700',
            'default',
            'No long-term opportunities currently saved.'
          )}
        </div>
      )}
    </div>
  );
}
