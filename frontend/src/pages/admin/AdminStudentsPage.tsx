import { useState, useEffect } from 'react';
import { adminApi } from '../../api/endpoints';
import { Card, Badge, LoadingState, ErrorState } from '../../components/ui/Common';
import { Users, Search, Target, Brain, BookmarkCheck } from 'lucide-react';

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const fetchStudents = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminApi.getStudents();
      setStudents(data);
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const filtered = students.filter((s) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q);
  });

  if (loading) return <LoadingState message="Loading registered student records..." />;
  if (error) return <ErrorState message={error} onRetry={fetchStudents} />;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-primary flex items-center gap-2">
            <Users className="w-6 h-6" /> Registered Students
          </h1>
          <p className="text-sm text-secondary mt-1">
            Overview of student onboarding, target goals, assessed skills, and application activity.
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="w-4 h-4 text-secondary absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search by student name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-2 text-xs border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      {/* Table */}
      <div className="bg-white border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted text-secondary font-semibold uppercase tracking-wider border-b border-border">
              <tr>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Target Goal</th>
                <th className="py-3 px-4">Assessed Skills</th>
                <th className="py-3 px-4">Quizzes Taken</th>
                <th className="py-3 px-4">Applications</th>
                <th className="py-3 px-4">Joined Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((s) => (
                <tr key={s.id} className="hover:bg-muted/30 transition-colors">
                  <td className="py-3 px-4">
                    <p className="font-bold text-primary">{s.name}</p>
                    <p className="text-[11px] text-secondary">{s.email}</p>
                  </td>
                  <td className="py-3 px-4">
                    {s.profile?.goal ? (
                      <Badge variant="default">{s.profile.goal.name}</Badge>
                    ) : (
                      <span className="text-secondary italic">None set</span>
                    )}
                  </td>
                  <td className="py-3 px-4 font-semibold text-primary">
                    {s._count?.studentSkills || 0} skills
                  </td>
                  <td className="py-3 px-4 font-semibold text-primary">
                    {s._count?.assessmentAttempts || 0} attempts
                  </td>
                  <td className="py-3 px-4 font-semibold text-primary">
                    {s._count?.applications || 0} tracked
                  </td>
                  <td className="py-3 px-4 text-secondary">
                    {new Date(s.createdAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
