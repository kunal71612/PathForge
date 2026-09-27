import { useState, useEffect } from 'react';
import { profileApi, goalsApi, skillsApi } from '../api/endpoints';
import { useAuth } from '../hooks/useAuth';
import { Card, Badge, ErrorState, Skeleton } from '../components/ui/Common';
import { User, Target, Save, CheckCircle2, Brain, Sparkles, BookOpen, GraduationCap, Check } from 'lucide-react';

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [goals, setGoals] = useState<any[]>([]);
  const [allSkills, setAllSkills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [college, setCollege] = useState('');
  const [degree, setDegree] = useState('');
  const [branch, setBranch] = useState('');
  const [year, setYear] = useState<number | ''>('');
  const [bio, setBio] = useState('');
  const [goalId, setGoalId] = useState('');
  const [interestsText, setInterestsText] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const [profData, goalsData, skillsData] = await Promise.all([
        profileApi.get(),
        goalsApi.getAll().catch(() => []),
        skillsApi.getAll().catch(() => []),
      ]);
      setProfile(profData);
      setGoals(goalsData);
      setAllSkills(skillsData);

      setName(profData?.name || user?.name || '');
      if (profData?.profile) {
        setCollege(profData.profile.college || '');
        setDegree(profData.profile.degree || '');
        setBranch(profData.profile.branch || '');
        setYear(profData.profile.year || '');
        setBio(profData.profile.bio || '');
        setGoalId(profData.profile.goalId || '');
        setInterestsText((profData.profile.interests || []).join(', '));
      }
      if (profData?.studentSkills) {
        setSelectedSkills(profData.studentSkills.map((ss: any) => ss.skillId));
      }
    } catch (err: unknown) {
      const apiErr = err as { message?: string };
      setError(apiErr.message || 'Unable to load profile data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const toggleSkill = (skillId: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skillId) ? prev.filter((id) => id !== skillId) : [...prev, skillId]
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);
    try {
      const interestsArray = interestsText
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      await profileApi.update({
        name,
        college,
        degree,
        branch,
        year: year ? Number(year) : null,
        bio,
        goalId: goalId || null,
        interests: interestsArray,
        skills: selectedSkills,
      });

      await refreshUser();
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3500);
    } catch (err: unknown) {
      const apiErr = err as { message?: string };
      alert(apiErr.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto py-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full rounded-3xl" />
        <Skeleton className="h-48 w-full rounded-3xl" />
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="max-w-xl mx-auto py-16">
        <ErrorState
          title="We couldn't load your profile."
          message={error}
          onRetry={fetchProfile}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2.5">
          <User className="w-7 h-7 text-blue-600" /> Student Profile & Target Goal
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Keep your academic credentials, career goal, and skill inventory updated to maintain accurate match ratings.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-bold flex items-center gap-2.5 shadow-subtle animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>Profile and skills successfully persisted to Supabase! Your dashboard recommendations will now adapt.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* SECTION 1: Personal Information */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-subtle space-y-5">
          <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
            <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white text-xl font-bold flex items-center justify-center shadow-subtle">
              {name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">{name || user?.name}</h2>
              <p className="text-xs text-slate-500">{user?.email}</p>
              <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                {user?.role}
              </span>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Ada Lovelace"
              className="w-full p-3 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Bio / Professional Summary</label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Passionate student engineer building AI models, full-stack applications, and competing in hackathons..."
              className="w-full p-3 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* SECTION 2: Career Goal */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-subtle space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <Target className="w-5 h-5 text-blue-600" />
            <h3 className="text-base font-extrabold text-slate-900">Primary Career Goal</h3>
          </div>
          <p className="text-xs text-slate-500">
            Selecting an active career goal defines your roadmap milestone sequence and prioritizes relevant internships.
          </p>

          <select
            value={goalId}
            onChange={(e) => setGoalId(e.target.value)}
            className="w-full py-3 px-3 text-xs font-bold border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
          >
            <option value="">No goal selected</option>
            {goals.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
        </div>

        {/* SECTION 3: Education */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-subtle space-y-5">
          <div className="flex items-center gap-2 mb-1">
            <GraduationCap className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base font-extrabold text-slate-900">Academic Background</h3>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">College / University</label>
            <input
              type="text"
              value={college}
              onChange={(e) => setCollege(e.target.value)}
              placeholder="e.g. Stanford University, IIT Bombay, MIT"
              className="w-full p-3 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Degree</label>
              <input
                type="text"
                value={degree}
                onChange={(e) => setDegree(e.target.value)}
                placeholder="e.g. B.Tech / B.S."
                className="w-full p-3 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Branch / Major</label>
              <input
                type="text"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                placeholder="e.g. Computer Science"
                className="w-full p-3 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Current Year (1-6)</label>
              <input
                type="number"
                min={1}
                max={6}
                value={year}
                onChange={(e) => setYear(e.target.value ? Number(e.target.value) : '')}
                placeholder="e.g. 3"
                className="w-full p-3 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* SECTION 4: Interests */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-subtle space-y-3">
          <label className="text-xs font-bold text-slate-700">Interests & Categories (Comma separated)</label>
          <input
            type="text"
            value={interestsText}
            onChange={(e) => setInterestsText(e.target.value)}
            placeholder="AI, Machine Learning, Web Development, Cloud, Hackathons"
            className="w-full p-3 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-[11px] text-slate-400">
            Contributes a 25% weighted factor to your custom opportunity recommendation scoring.
          </p>
        </div>

        {/* SECTION 5: Skills Inventory Checklist */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-subtle space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Brain className="w-5 h-5 text-blue-600" /> Active Skills Inventory
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Check the skills you currently possess to include them in your profile.
              </p>
            </div>
            <span className="text-xs font-bold text-blue-600">
              {selectedSkills.length} Selected
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2">
            {allSkills.map((skill) => {
              const checked = selectedSkills.includes(skill.id);
              return (
                <button
                  key={skill.id}
                  type="button"
                  onClick={() => toggleSkill(skill.id)}
                  className={`p-3 rounded-xl border text-left text-xs font-semibold transition-all flex items-center justify-between gap-2 ${
                    checked
                      ? 'border-blue-600 bg-blue-50/70 text-blue-900 shadow-subtle'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-slate-50/40'
                  }`}
                >
                  <span className="truncate">{skill.name}</span>
                  <div className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 ${
                    checked ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300'
                  }`}>
                    {checked && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Save Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={saving}
            className="w-full sm:w-auto px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-card transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Persisting to Database...' : 'Save All Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
