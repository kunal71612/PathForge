import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { opportunitiesApi, applicationsApi } from '../api/endpoints';
import { Card, Badge, ProgressBar, ErrorState, ReadinessGauge, Skeleton } from '../components/ui/Common';
import {
  ArrowLeft, Compass, Clock, MapPin, ExternalLink, Bookmark,
  BookmarkCheck, CheckCircle2, AlertTriangle, Sparkles, BookOpen, Brain, Shield, ArrowRight
} from 'lucide-react';

export default function OpportunityDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [opp, setOpp] = useState<any>(null);
  const [gapData, setGapData] = useState<any>(null);
  const [application, setApplication] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingApp, setSavingApp] = useState(false);
  const [appNotes, setAppNotes] = useState('');

  const fetchDetail = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const [oppRes, gapRes, allApps] = await Promise.all([
        opportunitiesApi.getById(id),
        opportunitiesApi.getGaps(id).catch(() => null),
        applicationsApi.getAll().catch(() => []),
      ]);
      setOpp(oppRes);
      setGapData(gapRes);
      const existingApp = allApps.find((a: any) => a.opportunityId === id);
      setApplication(existingApp || null);
      if (existingApp?.notes) setAppNotes(existingApp.notes);
    } catch (err: unknown) {
      const apiErr = err as { message?: string };
      setError(apiErr.message || 'Unable to load opportunity details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const handleUpdateApplicationStatus = async (newStatus: string) => {
    if (!id) return;
    setSavingApp(true);
    try {
      if (application) {
        const updated = await applicationsApi.update(application.id, {
          status: newStatus,
          notes: appNotes,
        });
        setApplication(updated);
      } else {
        const created = await applicationsApi.create(id, appNotes);
        setApplication(created);
      }
    } catch (err: unknown) {
      const apiErr = err as { message?: string };
      alert(apiErr.message || 'Failed to update application');
    } finally {
      setSavingApp(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto py-4">
        <Skeleton className="h-6 w-36" />
        <Skeleton className="h-48 w-full rounded-3xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-72 md:col-span-2 rounded-3xl" />
          <Skeleton className="h-72 rounded-3xl" />
        </div>
      </div>
    );
  }

  if (error && !opp) {
    return (
      <div className="max-w-xl mx-auto py-16">
        <ErrorState
          title="We couldn't load this opportunity."
          message={error}
          onRetry={fetchDetail}
        />
      </div>
    );
  }

  if (!opp) return null;

  const isSaved = !!application;
  const currentStatus = application?.status || 'SAVED';
  const readiness = gapData?.readinessScore || 50;
  const match = gapData?.matchScore || 75;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <Link
          to="/opportunities"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Opportunities
        </Link>
      </div>

      {/* Main Header Banner */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 space-y-4 shadow-subtle">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 tracking-wide uppercase">
            {opp.category}
          </span>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
              {match}% Match Score
            </span>
          </div>
        </div>

        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">{opp.title}</h1>
          <p className="text-sm font-semibold text-slate-500 mt-1">{opp.organization || 'Global Opportunity Partner'}</p>
        </div>

        {opp.description && (
          <p className="text-sm text-slate-600 leading-relaxed max-w-3xl">
            {opp.description}
          </p>
        )}

        {/* Metadata badges */}
        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-3 border-t border-slate-100">
          <span className="flex items-center gap-1.5 font-medium">
            <Clock className="w-4 h-4 text-slate-400" />
            Deadline: <strong className="text-slate-700">
              {opp.deadline ? new Date(opp.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Rolling'}
            </strong>
          </span>
          {opp.mode && (
            <span className="flex items-center gap-1.5 capitalize font-medium">
              <MapPin className="w-4 h-4 text-slate-400" /> Format: <strong className="text-slate-700">{opp.mode}</strong>
            </span>
          )}
          {opp.cost && (
            <span className="font-medium text-slate-700 ml-auto">
              Cost: <strong className="text-emerald-700">{opp.cost}</strong>
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column (2 spans): Prerequisites & Required Skills */}
        <div className="md:col-span-2 space-y-6">
          {/* READINESS COMPONENT */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-subtle">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Your Opportunity Readiness</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Calculated against your verified confidence in required skills.
                </p>
              </div>
              <ReadinessGauge percentage={readiness} size={68} label="READY" />
            </div>

            {/* Breakdown: Verified vs Needs Improvement */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block mb-2">
                  VERIFIED SKILLS ({gapData?.matchingSkills?.length || 0})
                </span>
                <div className="space-y-1.5">
                  {gapData?.matchingSkills && gapData.matchingSkills.length > 0 ? (
                    gapData.matchingSkills.map((s: any) => (
                      <div key={s.id} className="p-2 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-semibold flex items-center justify-between">
                        <span>{s.skill?.name || s.name}</span>
                        <span className="text-[11px] text-emerald-600">✓ Ready</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400">No verified skills yet for this role.</p>
                  )}
                </div>
              </div>

              <div>
                <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider block mb-2">
                  NEEDS IMPROVEMENT ({gapData?.missingSkills?.length || 0})
                </span>
                <div className="space-y-1.5">
                  {gapData?.missingSkills && gapData.missingSkills.length > 0 ? (
                    gapData.missingSkills.map((s: any) => (
                      <div key={s.id} className="p-2 rounded-xl bg-amber-50 text-amber-800 text-xs flex items-center justify-between">
                        <span className="font-semibold">{s.skill?.name || s.name}</span>
                        <Link
                          to="/learn"
                          className="text-[11px] font-bold text-amber-900 bg-white px-2 py-0.5 rounded border border-amber-200 hover:bg-amber-100"
                        >
                          Improve →
                        </Link>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-emerald-600 font-medium">All prerequisite skills verified!</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Full Eligibility & Instructions */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-subtle space-y-4">
            <h3 className="text-base font-bold text-slate-900">Eligibility & Requirements</h3>
            {opp.eligibility ? (
              <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
                {opp.eligibility}
              </p>
            ) : (
              <p className="text-xs text-slate-500">Open to all interested students.</p>
            )}

            <div className="pt-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Required Core Skills</h4>
              <div className="flex flex-wrap gap-2">
                {opp.skills?.map((s: any) => (
                  <span key={s.id} className="px-3 py-1 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700">
                    {s.skill?.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Application Pipeline & Action */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-subtle space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Application Status</h3>

            {/* Pipeline Stage Selector */}
            <div className="space-y-2">
              <label className="text-xs text-slate-500 font-medium">Stage in Tracker:</label>
              <select
                value={currentStatus}
                onChange={(e) => handleUpdateApplicationStatus(e.target.value)}
                disabled={savingApp}
                className="w-full py-2.5 px-3 text-xs font-semibold border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
              >
                <option value="SAVED">1. Saved</option>
                <option value="PREPARING">2. Preparing</option>
                <option value="READY">3. Ready to Apply</option>
                <option value="APPLIED">4. Applied</option>
                <option value="SHORTLISTED">5. Shortlisted</option>
                <option value="SELECTED">6. Selected / Offer</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
              <label className="text-xs text-slate-500 font-medium">Your Application Notes:</label>
              <textarea
                rows={3}
                placeholder="Add resume draft links, referral notes..."
                value={appNotes}
                onChange={(e) => setAppNotes(e.target.value)}
                className="w-full p-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={() => handleUpdateApplicationStatus(currentStatus)}
                disabled={savingApp}
                className="text-xs font-bold text-blue-600 hover:text-blue-700"
              >
                {savingApp ? 'Saving notes...' : 'Save Notes'}
              </button>
            </div>

            {/* Direct External Application Link */}
            {opp.applyUrl && (
              <div className="pt-2">
                <a
                  href={opp.applyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-card transition-all"
                >
                  <span>Apply on Official Website</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
