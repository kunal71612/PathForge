import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dashboardApi } from '../api/endpoints';
import { Card, Badge, ProgressBar, ErrorState, ReadinessGauge, Skeleton } from '../components/ui/Common';
import {
  Compass, BookOpen, Brain, Calendar, ArrowRight, CheckCircle2,
  Clock, Sparkles, Target, BookmarkCheck, TrendingUp, AlertTriangle,
  PlayCircle, Award, ChevronRight, ShieldCheck
} from 'lucide-react';

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await dashboardApi.get();
      setData(res);
    } catch (err: unknown) {
      const apiErr = err as { message?: string };
      setError(apiErr.message || 'Unable to load dashboard data right now.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto py-2">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-44 w-full rounded-2xl" />
            <Skeleton className="h-64 w-full rounded-2xl" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-64 w-full rounded-2xl" />
            <Skeleton className="h-48 w-full rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="max-w-2xl mx-auto py-12">
        <ErrorState
          title="Some dashboard data couldn't be loaded"
          message={error}
          onRetry={fetchDashboard}
        />
      </div>
    );
  }

  if (!data) return null;

  const { user, todaysPlan, skills = [], upcomingOpportunities = [], recommended = [], applicationStats = {}, roadmapProgress } = data;

  // Next action determination:
  // 1. First incomplete item from todaysPlan
  // 2. Or take assessment on lowest confidence skill
  // 3. Or select target goal
  const nextAction = todaysPlan && todaysPlan.length > 0
    ? todaysPlan[0]
    : skills.length > 0 && skills.some((s: any) => s.confidence < 60)
    ? {
        type: 'assessment',
        title: `Take ${skills.find((s: any) => s.confidence < 60)?.skill.name} Assessment`,
        id: '',
        link: '/assessments',
        moduleTitle: 'Skill Verification',
      }
    : !user?.goal
    ? {
        type: 'goal',
        title: 'Choose your career goal to unlock tailored roadmaps',
        id: '',
        link: '/goals',
        moduleTitle: 'Get Started',
      }
    : {
        type: 'opportunity',
        title: 'Explore matched opportunities and check readiness',
        id: '',
        link: '/opportunities',
        moduleTitle: 'Opportunities Ready',
      };

  // Strong vs Needs improvement skills breakdown for Skill Gap
  const strongSkills = skills.filter((s: any) => s.confidence >= 60);
  const needsImprovementSkills = skills.filter((s: any) => s.confidence < 60);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Greeting Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            {getGreeting()}, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Here's what's next on your path today.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          {!user?.goal ? (
            <Link
              to="/goals"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 shadow-subtle transition-all"
            >
              <Target className="w-4 h-4" /> Select Career Goal
            </Link>
          ) : (
            <Link
              to="/opportunities"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 shadow-subtle transition-all"
            >
              <Compass className="w-4 h-4" /> Matched Opportunities
            </Link>
          )}
        </div>
      </div>

      {/* Hero 2-Column Banner: Current Goal + Next Action Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* CURRENT GOAL CARD */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-3xl p-6 shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] font-bold uppercase tracking-widest text-blue-400 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5" /> CURRENT GOAL
              </span>
              <Link to="/goals" className="text-xs text-slate-300 hover:text-white underline">
                Change
              </Link>
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight mb-2">
              {user?.goal?.name || 'No Goal Selected'}
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              {user?.goal?.description || 'Pick a career goal like AI Engineer or Full-Stack to get a verified roadmap.'}
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-700/60">
            {roadmapProgress ? (
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-300">Roadmap Progress</span>
                  <span className="text-blue-400">{roadmapProgress.percentage}%</span>
                </div>
                <ProgressBar value={roadmapProgress.percentage} color="bg-blue-500" size="sm" />
                <p className="text-[11px] text-slate-400">
                  {roadmapProgress.completedResources} of {roadmapProgress.totalResources} modules & resources completed
                </p>
              </div>
            ) : (
              <Link
                to="/goals"
                className="inline-flex items-center gap-1 text-xs font-bold text-blue-400 hover:text-blue-300"
              >
                Set up your learning path <ArrowRight className="w-3 h-3" />
              </Link>
            )}
          </div>
        </div>

        {/* NEXT ACTION — Large Focused Card (2 spans) */}
        <div className="md:col-span-2 bg-blue-50/70 border border-blue-200/80 rounded-3xl p-6 sm:p-7 shadow-subtle flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" /> NEXT RECOMMENDED ACTION
              </span>
              <span className="text-xs font-medium text-slate-500">
                {nextAction.moduleTitle || 'Immediate Next Step'}
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mt-2 mb-2">
              {nextAction.title}
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed max-w-xl">
              Focus on this step to raise your verified skill confidence and qualify for higher-match internships and hackathons.
            </p>
          </div>

          <div className="mt-6 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-blue-200/60">
            <span className="text-xs text-slate-500">
              Estimated duration: ~15-25 minutes
            </span>
            <Link
              to={
                nextAction.link
                  ? nextAction.link
                  : nextAction.type === 'resource'
                  ? '/learn'
                  : `/assessments/${nextAction.id}`
              }
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-card transition-all"
            >
              Continue Now <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Main Grid: Learning Path + Skills & Deadlines */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 spans): Visual Roadmap Journey + Opportunities */}
        <div className="lg:col-span-2 space-y-8">
          {/* VISUAL ROADMAP JOURNEY: Completed → In Progress → Next → Upcoming */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-subtle">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900">Roadmap Learning Journey</h3>
              </div>
              {roadmapProgress && (
                <Link
                  to={`/roadmaps/${roadmapProgress.roadmapId}`}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline"
                >
                  View Full Roadmap →
                </Link>
              )}
            </div>

            {/* Visual Step Pipeline */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 relative">
              <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-left">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block mb-1">
                  1 • Completed
                </span>
                <p className="text-xs font-bold text-slate-900 line-clamp-1">Core Fundamentals</p>
                <p className="text-[11px] text-emerald-600 mt-1 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Verified ✓
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-blue-50/70 border-2 border-blue-500 text-left shadow-subtle">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 block mb-1">
                  2 • In Progress
                </span>
                <p className="text-xs font-bold text-slate-900 line-clamp-1">Data & OOP Structures</p>
                <p className="text-[11px] text-blue-700 mt-1 flex items-center gap-1 font-semibold">
                  <PlayCircle className="w-3 h-3 text-blue-600" /> Active Now
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-left">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  3 • Next Up
                </span>
                <p className="text-xs font-bold text-slate-800 line-clamp-1">Advanced Algorithms</p>
                <p className="text-[11px] text-slate-500 mt-1">Pending unlock</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50/60 border border-slate-200/60 text-left opacity-75">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  4 • Upcoming
                </span>
                <p className="text-xs font-bold text-slate-700 line-clamp-1">Capstone Portfolio</p>
                <p className="text-[11px] text-slate-400 mt-1">Final stage</p>
              </div>
            </div>
          </div>

          {/* OPPORTUNITIES FOR YOU */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Compass className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-bold text-slate-900">Opportunities For You</h3>
              </div>
              <Link to="/opportunities" className="text-xs font-semibold text-blue-600 hover:text-blue-700">
                Explore all ({recommended.length}) →
              </Link>
            </div>

            {recommended.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recommended.slice(0, 4).map((rec: any) => {
                  const opp = rec.opportunity;
                  // Calculate readiness indicator based on student skills
                  const oppSkills = opp.skills || [];
                  const userSkillMap = new Map<string, number>(
                    skills.map((s: any) => [s.skill.name.toLowerCase(), Number(s.confidence) || 0])
                  );
                  const totalConf = oppSkills.reduce((acc: number, item: any) => {
                    const c = userSkillMap.get(item.skill?.name.toLowerCase()) || 0;
                    return acc + c;
                  }, 0);
                  const readinessScore = oppSkills.length > 0 ? Math.round(totalConf / oppSkills.length) : 50;

                  return (
                    <div
                      key={opp.id}
                      className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-subtle hover:shadow-card hover:border-blue-400 transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 uppercase">
                            {opp.category}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                            {rec.matchScore}% Match
                          </span>
                        </div>

                        <h4 className="text-sm font-bold text-slate-900 line-clamp-1 mt-1">{opp.title}</h4>
                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{opp.organization || 'Verified Partner'}</p>

                        {/* Required skills */}
                        <div className="flex flex-wrap gap-1 mt-3">
                          {opp.skills?.slice(0, 3).map((s: any) => (
                            <span key={s.id} className="text-[11px] px-2 py-0.5 bg-slate-50 border border-slate-100 rounded-md text-slate-600 font-medium">
                              {s.skill?.name}
                            </span>
                          ))}
                          {opp.skills?.length > 3 && (
                            <span className="text-[11px] px-1.5 py-0.5 bg-slate-50 text-slate-400 rounded-md">
                              +{opp.skills.length - 3}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 text-slate-500">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>
                            {opp.deadline
                              ? new Date(opp.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
                              : 'Rolling'}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-bold text-slate-500">
                            {readinessScore}% Ready
                          </span>
                          <Link
                            to={`/opportunities/${opp.id}`}
                            className="font-bold text-blue-600 hover:text-blue-700 flex items-center gap-0.5"
                          >
                            Details <ChevronRight className="w-3 h-3" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center bg-slate-50 border border-dashed border-slate-200 rounded-2xl">
                <Compass className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-700">No opportunities recommended yet</p>
                <p className="text-xs text-slate-400 mt-1">Select a career goal to unlock personalized matching.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Skill Confidence + Skill Gap + Don't Miss */}
        <div className="space-y-6">
          {/* SKILL CONFIDENCE CARD */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-subtle">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">Skill Confidence</h3>
              </div>
              <Link to="/skills" className="text-xs font-semibold text-blue-600 hover:text-blue-700">
                View All →
              </Link>
            </div>

            {skills && skills.length > 0 ? (
              <div className="space-y-3.5">
                {skills.slice(0, 5).map((ss: any) => {
                  const conf = Math.round(ss.confidence);
                  return (
                    <div key={ss.id} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-semibold text-slate-800">{ss.skill.name}</span>
                        <span className="font-bold text-slate-900">{conf}%</span>
                      </div>
                      <ProgressBar value={conf} size="sm" />
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-xs text-slate-500 mb-3">No verified skills yet.</p>
                <Link
                  to="/skills"
                  className="text-xs font-bold px-3.5 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 inline-block shadow-subtle"
                >
                  Verify Your Skills
                </Link>
              </div>
            )}
          </div>

          {/* SKILL GAP WIDGET */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-subtle">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-900">Skill Gap Analysis</h3>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  YOU'RE STRONG IN:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {strongSkills.length > 0 ? (
                    strongSkills.slice(0, 3).map((s: any) => (
                      <span key={s.id} className="inline-flex items-center gap-1 text-xs px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg font-medium">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        {s.skill.name}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-500">Take assessments to establish strengths.</span>
                  )}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  NEEDS IMPROVEMENT:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {needsImprovementSkills.length > 0 ? (
                    needsImprovementSkills.slice(0, 3).map((s: any) => (
                      <span key={s.id} className="inline-flex items-center gap-1 text-xs px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg font-medium">
                        <AlertTriangle className="w-3 h-3 text-amber-600" />
                        {s.skill.name}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-500">All current skills are above 60%!</span>
                  )}
                </div>
              </div>

              <div className="pt-2">
                <Link
                  to="/learn"
                  className="w-full text-center block py-2 px-3 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors"
                >
                  View Learning Path →
                </Link>
              </div>
            </div>
          </div>

          {/* DON'T MISS / UPCOMING DEADLINES */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-subtle">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-rose-600" />
                <h3 className="text-sm font-bold text-slate-900">Don't Miss</h3>
              </div>
              <Link to="/calendar" className="text-xs font-semibold text-blue-600 hover:text-blue-700">
                Calendar →
              </Link>
            </div>

            {upcomingOpportunities && upcomingOpportunities.length > 0 ? (
              <div className="space-y-2.5">
                {upcomingOpportunities.map((app: any) => {
                  const deadline = new Date(app.opportunity.deadline);
                  const daysLeft = Math.ceil((deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                  return (
                    <div
                      key={app.id}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between"
                    >
                      <div className="min-w-0 pr-2">
                        <p className="text-xs font-bold text-slate-900 truncate">{app.opportunity.title}</p>
                        <p className="text-[11px] text-slate-500">
                          {deadline.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                      <Badge variant={daysLeft <= 2 ? 'danger' : daysLeft <= 7 ? 'warning' : 'default'}>
                        {daysLeft <= 0 ? 'Due today' : `${daysLeft}d left`}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-slate-500 py-3 text-center">
                No urgent deadlines in the next 7 days.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
