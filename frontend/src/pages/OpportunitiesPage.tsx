import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { opportunitiesApi, applicationsApi } from '../api/endpoints';
import { Card, Badge, Modal, ErrorState, ReadinessGauge, Skeleton } from '../components/ui/Common';
import {
  Compass, Search, Bookmark, BookmarkCheck, Clock, MapPin,
  ExternalLink, ArrowRight, Sparkles, Filter, CheckCircle2, AlertTriangle, BookOpen, Brain, RefreshCw
} from 'lucide-react';

export default function OpportunitiesPage() {
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [recommended, setRecommended] = useState<any[]>([]);
  const [savedApps, setSavedApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedMode, setSelectedMode] = useState('');
  const [savingId, setSavingId] = useState<string | null>(null);

  // Skill gap modal state
  const [activeGapModalId, setActiveGapModalId] = useState<string | null>(null);
  const [gapData, setGapData] = useState<any>(null);
  const [gapLoading, setGapLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [opps, recs, apps] = await Promise.all([
        opportunitiesApi.getAll(),
        opportunitiesApi.getRecommended().catch(() => []),
        applicationsApi.getAll().catch(() => []),
      ]);
      setOpportunities(opps);
      setRecommended(recs);
      setSavedApps(apps);
    } catch (err: unknown) {
      const apiErr = err as { message?: string };
      setError(apiErr.message || 'Unable to load opportunities right now.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Map opportunityId to match score from recommendations
  const matchMap = useMemo(() => {
    const map = new Map<string, number>();
    recommended.forEach((r) => {
      map.set(r.opportunity.id, r.matchScore);
    });
    return map;
  }, [recommended]);

  // Map opportunityId to application status
  const appStatusMap = useMemo(() => {
    const map = new Map<string, any>();
    savedApps.forEach((a) => {
      map.set(a.opportunityId, a);
    });
    return map;
  }, [savedApps]);

  const handleSaveOpportunity = async (oppId: string) => {
    const existing = appStatusMap.get(oppId);
    if (existing) return;
    setSavingId(oppId);
    try {
      await applicationsApi.create(oppId, 'Saved from opportunity discovery');
      const updatedApps = await applicationsApi.getAll();
      setSavedApps(updatedApps);
    } catch (err: unknown) {
      const apiErr = err as { message?: string };
      alert(apiErr.message || 'Failed to save opportunity');
    } finally {
      setSavingId(null);
    }
  };

  const openGapModal = async (oppId: string) => {
    setActiveGapModalId(oppId);
    setGapLoading(true);
    setGapData(null);
    try {
      const res = await opportunitiesApi.getGaps(oppId);
      setGapData(res);
    } catch (err: unknown) {
      const apiErr = err as { message?: string };
      alert(apiErr.message || 'Failed to load skill gap analysis');
    } finally {
      setGapLoading(false);
    }
  };

  // Filter logic
  const filteredOpportunities = useMemo(() => {
    return opportunities.filter((opp) => {
      const matchesSearch =
        search === '' ||
        opp.title.toLowerCase().includes(search.toLowerCase()) ||
        opp.organization?.toLowerCase().includes(search.toLowerCase()) ||
        opp.skills?.some((s: any) => s.skill?.name.toLowerCase().includes(search.toLowerCase()));

      const matchesCat =
        selectedCategory === '' || opp.category === selectedCategory;

      const matchesMode =
        selectedMode === '' || opp.mode?.toLowerCase() === selectedMode.toLowerCase();

      return matchesSearch && matchesCat && matchesMode;
    });
  }, [opportunities, search, selectedCategory, selectedMode]);

  if (loading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto py-4">
        <Skeleton className="h-10 w-72" />
        <Skeleton className="h-16 w-full rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-72 w-full rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error && opportunities.length === 0) {
    return (
      <div className="max-w-xl mx-auto py-16">
        <ErrorState
          title="Unable to load opportunities right now."
          message={error}
          onRetry={fetchData}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Discover Opportunities
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Internships, hackathons, and fellowships matched to your verified skills and target career goal.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/saved"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors"
          >
            <BookmarkCheck className="w-4 h-4 text-slate-600" />
            Saved Tracker ({savedApps.length})
          </Link>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-subtle">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by title, company, or skill..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full py-2 px-3 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700"
          >
            <option value="">All Categories</option>
            <option value="INTERNSHIP">Internships</option>
            <option value="HACKATHON">Hackathons</option>
            <option value="SCHOLARSHIP">Scholarships & Fellowships</option>
            <option value="COMPETITION">Competitions</option>
            <option value="RESEARCH">Research</option>
            <option value="WORKSHOP">Workshops</option>
          </select>

          <select
            value={selectedMode}
            onChange={(e) => setSelectedMode(e.target.value)}
            className="w-full py-2 px-3 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700"
          >
            <option value="">All Locations (Online / Hybrid / Offline)</option>
            <option value="online">Online / Remote</option>
            <option value="hybrid">Hybrid</option>
            <option value="offline">In-Person</option>
          </select>
        </div>
      </div>

      {/* Opportunity Grid */}
      {filteredOpportunities.length === 0 ? (
        <div className="py-16 text-center bg-slate-50/50 border border-dashed border-slate-200 rounded-3xl">
          <Compass className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No opportunities found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search criteria or clear your filters to explore all available listings.
          </p>
          <button
            onClick={() => { setSearch(''); setSelectedCategory(''); setSelectedMode(''); }}
            className="mt-4 px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-xl hover:bg-slate-800 transition-all"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOpportunities.map((opp) => {
            const matchScore = matchMap.get(opp.id) || 75;
            const savedApp = appStatusMap.get(opp.id);
            const isSaved = !!savedApp;

            // Simple readiness metric for card preview
            const readinessEst = Math.min(100, Math.max(30, Math.round(matchScore * 0.85)));

            return (
              <div
                key={opp.id}
                className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-subtle hover:shadow-card hover:border-blue-400 transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  {/* Category & Scores Header */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 tracking-wide uppercase">
                      {opp.category}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        {matchScore}% Match
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {readinessEst}% Ready
                      </span>
                    </div>
                  </div>

                  {/* Title & Organization */}
                  <h3 className="text-base font-bold text-slate-900 line-clamp-1 mt-1">
                    {opp.title}
                  </h3>
                  <p className="text-xs font-semibold text-slate-500 mt-0.5 line-clamp-1">
                    {opp.organization || 'Verified Program Partner'}
                  </p>

                  {/* Deadline & Location */}
                  <div className="flex items-center gap-3 text-xs text-slate-500 mt-3 pb-3 border-b border-slate-100">
                    <span className="flex items-center gap-1 font-medium">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {opp.deadline
                        ? new Date(opp.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
                        : 'Rolling'}
                    </span>
                    {opp.mode && (
                      <span className="flex items-center gap-1 capitalize font-medium">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" /> {opp.mode}
                      </span>
                    )}
                  </div>

                  {/* Required skills */}
                  <div className="mt-3.5">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                      REQUIRED SKILLS
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {opp.skills?.slice(0, 4).map((s: any) => (
                        <span key={s.id} className="text-xs px-2.5 py-1 bg-slate-50 border border-slate-200/80 rounded-lg font-medium text-slate-700">
                          {s.skill?.name}
                        </span>
                      ))}
                      {opp.skills?.length > 4 && (
                        <span className="text-xs px-2 py-1 bg-slate-50 text-slate-400 rounded-lg">
                          +{opp.skills.length - 4}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Why this matches you */}
                  <div className="mt-3.5 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600">
                    <span className="font-bold text-slate-800 block mb-0.5">Why this matches:</span>
                    <p className="text-[11px] leading-relaxed text-slate-500">
                      Matches your skill portfolio and aligns with your career target goal.
                    </p>
                  </div>
                </div>

                {/* Actions: View Opportunity (Primary) & Save (Secondary) */}
                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                  <button
                    onClick={() => openGapModal(opp.id)}
                    className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 hover:underline"
                  >
                    Skill Gap <Sparkles className="w-3.5 h-3.5" />
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleSaveOpportunity(opp.id)}
                      disabled={isSaved || savingId === opp.id}
                      className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
                        isSaved
                          ? 'border-emerald-300 text-emerald-700 bg-emerald-50'
                          : 'border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                      title={isSaved ? 'Saved to Tracker' : 'Save Opportunity'}
                    >
                      {isSaved ? (
                        <>
                          <BookmarkCheck className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Saved</span>
                        </>
                      ) : (
                        <>
                          <Bookmark className="w-3.5 h-3.5" />
                          <span>Save</span>
                        </>
                      )}
                    </button>

                    <Link
                      to={`/opportunities/${opp.id}`}
                      className="px-4 py-2 bg-slate-900 hover:bg-blue-600 text-white rounded-xl text-xs font-bold shadow-subtle transition-all flex items-center gap-1"
                    >
                      <span>View</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* SKILL GAP & READINESS MODAL */}
      <Modal
        isOpen={!!activeGapModalId}
        onClose={() => setActiveGapModalId(null)}
        title="Skill Gap & Readiness Analysis"
      >
        {gapLoading ? (
          <div className="py-8 text-center">
            <div className="w-6 h-6 border-2 border-slate-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs text-slate-500 font-medium">Computing your readiness score...</p>
          </div>
        ) : gapData ? (
          <div className="space-y-6">
            {/* Header with Circular Readiness Gauge */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900">Your Current Preparedness</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-xs">
                  Readiness calculated from your verified assessment confidences across required skills.
                </p>
              </div>
              <ReadinessGauge percentage={gapData.readinessScore || 0} size={70} />
            </div>

            {/* YOU HAVE (Verified Skills) */}
            <div>
              <div className="flex items-center gap-2 mb-2 text-xs font-bold text-slate-900 uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>YOU HAVE ({gapData.matchingSkills?.length || 0})</span>
              </div>
              {gapData.matchingSkills && gapData.matchingSkills.length > 0 ? (
                <div className="grid grid-cols-2 gap-2">
                  {gapData.matchingSkills.map((s: any) => (
                    <div
                      key={s.id}
                      className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200/80 flex items-center justify-between text-xs font-semibold text-emerald-800"
                    >
                      <span>{s.skill?.name || s.name}</span>
                      <span className="text-[11px] font-bold text-emerald-600">✓ Ready</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 bg-slate-50 p-3 rounded-xl">
                  No verified matching skills yet.
                </p>
              )}
            </div>

            {/* NEEDS IMPROVEMENT (Missing or low-confidence skills) */}
            <div>
              <div className="flex items-center gap-2 mb-2 text-xs font-bold text-slate-900 uppercase tracking-wider">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span>NEEDS IMPROVEMENT ({gapData.missingSkills?.length || 0})</span>
              </div>
              {gapData.missingSkills && gapData.missingSkills.length > 0 ? (
                <div className="space-y-2">
                  {gapData.missingSkills.map((s: any) => (
                    <div
                      key={s.id}
                      className="p-3 rounded-xl bg-amber-50/60 border border-amber-200 flex items-center justify-between text-xs"
                    >
                      <div>
                        <p className="font-bold text-slate-900">{s.skill?.name || s.name}</p>
                        <p className="text-[11px] text-amber-800 mt-0.5">Missing or below recommended threshold</p>
                      </div>
                      <Link
                        to="/learn"
                        className="px-3 py-1.5 bg-white border border-amber-300 text-amber-900 rounded-lg text-xs font-bold hover:bg-amber-100 transition-colors shadow-subtle shrink-0 ml-3"
                      >
                        Improve Skill →
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3 bg-emerald-50 rounded-xl text-xs text-emerald-800 font-medium">
                  Outstanding! You have verified readiness in all required skills for this opportunity.
                </div>
              )}
            </div>

            <div className="pt-2">
              <Link
                to={`/opportunities/${activeGapModalId}`}
                className="w-full text-center block py-2.5 px-4 bg-slate-900 hover:bg-blue-600 text-white rounded-xl text-xs font-bold transition-all shadow-subtle"
              >
                View Full Opportunity Details & Apply →
              </Link>
            </div>
          </div>
        ) : (
          <p className="text-xs text-slate-500 py-4">No analysis data available.</p>
        )}
      </Modal>
    </div>
  );
}
