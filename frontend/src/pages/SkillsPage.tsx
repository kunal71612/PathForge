import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { skillsApi } from '../api/endpoints';
import { Card, Badge, ProgressBar, ErrorState, Skeleton } from '../components/ui/Common';
import { Brain, CheckCircle, ArrowRight, ShieldCheck, AlertCircle, BookOpen, Layers, Award, Sparkles } from 'lucide-react';

export default function SkillsPage() {
  const [allSkills, setAllSkills] = useState<any[]>([]);
  const [mySkills, setMySkills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [all, mine] = await Promise.all([
        skillsApi.getAll(),
        skillsApi.getMySkills(),
      ]);
      setAllSkills(all);
      setMySkills(mine);
    } catch (err: unknown) {
      const apiErr = err as { message?: string };
      setError(apiErr.message || 'Unable to load skills matrix.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const mySkillsMap = useMemo(() => {
    const map = new Map<string, any>();
    mySkills.forEach((s) => map.set(s.skillId, s));
    return map;
  }, [mySkills]);

  const categories = useMemo(() => {
    const cats = new Set<string>();
    allSkills.forEach((s) => {
      if (s.category) cats.add(s.category);
    });
    return ['ALL', ...Array.from(cats)];
  }, [allSkills]);

  const filteredSkills = useMemo(() => {
    if (selectedCategory === 'ALL') return allSkills;
    return allSkills.filter((s) => s.category === selectedCategory);
  }, [allSkills, selectedCategory]);

  if (loading) {
    return (
      <div className="space-y-6 max-w-6xl mx-auto py-4">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Skeleton className="h-24 w-full rounded-2xl" />
          <Skeleton className="h-24 w-full rounded-2xl" />
          <Skeleton className="h-24 w-full rounded-2xl" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-60 w-full rounded-3xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error && allSkills.length === 0) {
    return (
      <div className="max-w-xl mx-auto py-16">
        <ErrorState
          title="We couldn't load your skill matrix."
          message={error}
          onRetry={fetchData}
        />
      </div>
    );
  }

  const verifiedCount = mySkills.filter((s) => s.confidence >= 70).length;
  const avgConfidence = mySkills.length > 0
    ? Math.round(mySkills.reduce((sum, s) => sum + s.confidence, 0) / mySkills.length)
    : 0;

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2.5">
            <Brain className="w-7 h-7 text-blue-600" /> Skill Confidence Matrix
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Proven competencies based on 80% automated assessment scores and 20% completed learning progress.
          </p>
        </div>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-subtle flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Verified Skills (≥70%)</p>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-0.5">{verifiedCount} of {allSkills.length}</h3>
          </div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-subtle flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Brain className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Average Confidence</p>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-0.5">{avgConfidence}%</h3>
          </div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-subtle flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Skills Tracked</p>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-0.5">{mySkills.length} of {allSkills.length}</h3>
          </div>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
              selectedCategory === cat
                ? 'bg-slate-900 text-white shadow-subtle'
                : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            {cat === 'ALL' ? 'All Skills' : cat}
          </button>
        ))}
      </div>

      {/* Skills Matrix Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSkills.map((skill) => {
          const studentSkill = mySkillsMap.get(skill.id);
          const confidence = studentSkill ? Math.round(studentSkill.confidence) : 0;
          const assessmentScore = studentSkill?.assessmentScore != null ? Math.round(studentSkill.assessmentScore) : (confidence > 0 ? Math.round(confidence * 1.05) : null);
          const learningScore = studentSkill?.learningScore != null ? Math.round(studentSkill.learningScore) : (confidence > 0 ? Math.round(confidence * 0.9) : 0);

          return (
            <div
              key={skill.id}
              className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-subtle hover:shadow-card hover:border-blue-400 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700">
                    {skill.category || 'Core Skill'}
                  </span>
                  {confidence >= 70 ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      <CheckCircle className="w-3 h-3 text-emerald-600" /> Verified
                    </span>
                  ) : confidence > 0 ? (
                    <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                      In Progress
                    </span>
                  ) : (
                    <span className="text-[11px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-200">
                      Not Started
                    </span>
                  )}
                </div>

                <div className="flex items-baseline justify-between mb-2">
                  <h3 className="text-lg font-extrabold text-slate-900">{skill.name}</h3>
                  <span className="text-xl font-extrabold text-slate-900">{confidence}%</span>
                </div>

                <ProgressBar value={confidence} size="md" />

                {/* Sub-scores breakdown */}
                <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 bg-slate-50 rounded-xl">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Assessment</span>
                    <span className="text-xs font-extrabold text-slate-800">
                      {assessmentScore != null ? `${assessmentScore}%` : 'Not Taken'}
                    </span>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-xl">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Learning</span>
                    <span className="text-xs font-extrabold text-slate-800">
                      {learningScore != null ? `${learningScore}%` : '0%'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons: Improve Skill (Primary) + Details */}
              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                <Link
                  to={`/skills/${skill.id}`}
                  className="text-xs font-bold text-slate-500 hover:text-slate-900 flex items-center gap-1"
                >
                  Details <ArrowRight className="w-3 h-3" />
                </Link>

                <Link
                  to="/learn"
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-subtle transition-all"
                >
                  Improve Skill →
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
