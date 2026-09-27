import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../api/endpoints';
import { Card, Badge, LoadingState, ErrorState } from '../../components/ui/Common';
import {
  Shield, Users, Compass, BookOpen, Brain, Map,
  TrendingUp, ArrowRight, PlusCircle, CheckCircle2
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminApi.getStats();
      setStats(data);
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to load platform statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) return <LoadingState message="Aggregating platform metrics..." />;
  if (error) return <ErrorState message={error} onRetry={fetchStats} />;

  const statCards = [
    { label: 'Active Students', value: stats.totalStudents, icon: Users, path: '/admin/students', color: 'text-primary' },
    { label: 'Verified Opportunities', value: stats.totalOpportunities, icon: Compass, path: '/admin/opportunities', color: 'text-primary' },
    { label: 'Curated Resources', value: stats.totalResources, icon: BookOpen, path: '/admin/resources', color: 'text-primary' },
    { label: 'Structured Roadmaps', value: stats.totalRoadmaps, icon: Map, path: '/admin/roadmaps', color: 'text-primary' },
    { label: 'Assessment Attempts', value: stats.totalAssessmentAttempts, icon: Brain, path: '/admin/assessments', color: 'text-primary' },
    { label: 'Applications Tracked', value: stats.totalApplications, icon: TrendingUp, path: '/admin/opportunities', color: 'text-primary' },
  ];

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight text-primary">Admin Control Center</h1>
          </div>
          <p className="text-sm text-secondary mt-1">
            Manage opportunities, roadmaps, curated resources, verification assessments, and view student growth analytics.
          </p>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((card, idx) => (
          <Link key={idx} to={card.path}>
            <Card className="hover:border-gray-400 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-secondary">{card.label}</span>
                <card.icon className="w-4 h-4 text-secondary" />
              </div>
              <p className="text-3xl font-extrabold text-primary mt-2">{card.value}</p>
              <div className="mt-3 flex items-center gap-1 text-[11px] font-semibold text-primary">
                <span>Manage</span> <ArrowRight className="w-3 h-3" />
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {/* Quick Action Shortcuts */}
      <div className="space-y-4 pt-4">
        <h2 className="text-base font-bold text-primary">Quick Management Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            to="/admin/opportunities"
            className="p-4 bg-white border border-border rounded-xl hover:border-gray-400 transition-all flex items-center gap-3"
          >
            <Compass className="w-5 h-5 text-primary" />
            <div>
              <h3 className="text-xs font-bold text-primary">Add Opportunity</h3>
              <p className="text-[11px] text-secondary">Hackathons, internships...</p>
            </div>
          </Link>

          <Link
            to="/admin/resources"
            className="p-4 bg-white border border-border rounded-xl hover:border-gray-400 transition-all flex items-center gap-3"
          >
            <BookOpen className="w-5 h-5 text-primary" />
            <div>
              <h3 className="text-xs font-bold text-primary">Curate Resource</h3>
              <p className="text-[11px] text-secondary">Videos, courses, docs...</p>
            </div>
          </Link>

          <Link
            to="/admin/assessments"
            className="p-4 bg-white border border-border rounded-xl hover:border-gray-400 transition-all flex items-center gap-3"
          >
            <Brain className="w-5 h-5 text-primary" />
            <div>
              <h3 className="text-xs font-bold text-primary">Create Quiz</h3>
              <p className="text-[11px] text-secondary">Diagnostic questions...</p>
            </div>
          </Link>

          <Link
            to="/admin/roadmaps"
            className="p-4 bg-white border border-border rounded-xl hover:border-gray-400 transition-all flex items-center gap-3"
          >
            <Map className="w-5 h-5 text-primary" />
            <div>
              <h3 className="text-xs font-bold text-primary">Build Roadmap</h3>
              <p className="text-[11px] text-secondary">Structured milestones...</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
