import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { skillsApi, resourcesApi } from '../api/endpoints';
import { Card, Badge, ProgressBar, LoadingState, ErrorState } from '../components/ui/Common';
import {
  ArrowLeft, Brain, BookOpen, ExternalLink, CheckCircle2, Circle,
  ShieldCheck, AlertCircle, ArrowRight, PlayCircle, FileText, Code2
} from 'lucide-react';

export default function SkillDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSkill = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await skillsApi.getDetail(id);
      setData(res);
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to load skill details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSkill();
  }, [id]);

  const handleUpdateStatus = async (resourceId: string, status: string) => {
    try {
      await resourcesApi.updateProgress(resourceId, status);
      // Refresh skill details to recalculate confidence
      if (id) {
        const updated = await skillsApi.getDetail(id);
        setData(updated);
      }
    } catch (err: any) {
      alert(err?.response?.data?.error || 'Failed to update progress');
    }
  };

  if (loading) return <LoadingState message="Loading skill evaluation breakdown..." />;
  if (error) return <ErrorState message={error} onRetry={fetchSkill} />;
  if (!data || !data.skill) return null;

  const { skill, confidence, assessmentScore, learningScore, resources, assessments } = data;
  const isVerified = confidence >= 70;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <Link
          to="/skills"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-secondary hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Skill Matrix
        </Link>
      </div>

      {/* Header Card */}
      <Card className="p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Badge variant="outline" className="text-xs uppercase font-semibold">
            {skill.category || 'Competency'}
          </Badge>
          {isVerified ? (
            <Badge variant="success" className="gap-1 text-xs">
              <ShieldCheck className="w-3.5 h-3.5" /> Verified Skill (&ge;70%)
            </Badge>
          ) : (
            <Badge variant="warning" className="text-xs">
              Unverified Skill ({confidence}%)
            </Badge>
          )}
        </div>

        <h1 className="text-2xl font-extrabold text-primary">{skill.name}</h1>

        {/* Confidence Calculation Explanation */}
        <div className="pt-3 border-t border-border space-y-3">
          <div className="flex justify-between items-center text-sm font-semibold">
            <span className="text-primary">Overall Confidence</span>
            <span className="text-primary">{Math.round(confidence)}%</span>
          </div>
          <ProgressBar
            value={confidence}
            size="md"
            color={isVerified ? 'bg-success' : confidence >= 40 ? 'bg-primary' : 'bg-warning'}
          />

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="p-3 bg-muted rounded-lg text-center">
              <span className="text-xs text-secondary font-medium">Assessment Verification (80% Weight)</span>
              <p className="text-lg font-bold text-primary mt-1">
                {assessmentScore != null && assessmentScore > 0 ? `${Math.round(assessmentScore)}%` : 'No quiz taken'}
              </p>
            </div>
            <div className="p-3 bg-muted rounded-lg text-center">
              <span className="text-xs text-secondary font-medium">Curriculum Practice (20% Weight)</span>
              <p className="text-lg font-bold text-primary mt-1">
                {learningScore != null ? `${Math.round(learningScore)}%` : '0%'}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Quizzes to verify this skill */}
      <div className="space-y-3">
        <h2 className="text-base font-bold text-primary flex items-center gap-2">
          <Brain className="w-5 h-5" /> Skill Verification Assessments
        </h2>

        {assessments && assessments.length > 0 ? (
          <div className="space-y-3">
            {assessments.map((a: any) => {
              const lastAttempt = a.attempts?.[0];
              return (
                <div
                  key={a.id}
                  className="p-4 bg-white border border-border rounded-xl flex items-center justify-between gap-4"
                >
                  <div>
                    <h3 className="text-sm font-bold text-primary">{a.title}</h3>
                    <p className="text-xs text-secondary mt-0.5">
                      {a._count?.questions || 5} questions • Instant feedback and explanations
                    </p>
                    {lastAttempt && (
                      <p className="text-xs font-semibold text-success mt-1">
                        Last Score: {lastAttempt.percentage}% ({lastAttempt.score}/{lastAttempt.totalQuestions})
                      </p>
                    )}
                  </div>
                  <Link
                    to={`/assessments/${a.id}`}
                    className="px-4 py-2 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-black transition-colors shrink-0"
                  >
                    {lastAttempt ? 'Retake Quiz' : 'Take Quiz'}
                  </Link>
                </div>
              );
            })}
          </div>
        ) : (
          <Card className="py-6 text-center">
            <p className="text-xs text-secondary">No direct quiz created yet for this skill.</p>
          </Card>
        )}
      </div>

      {/* Recommended Learning Resources for this skill */}
      <div className="space-y-3">
        <h2 className="text-base font-bold text-primary flex items-center gap-2">
          <BookOpen className="w-5 h-5" /> Recommended Learning for {skill.name}
        </h2>

        {resources && resources.length > 0 ? (
          <div className="space-y-3">
            {resources.map((res: any) => {
              const isDone = res.learningProgress?.[0]?.status === 'COMPLETED';

              return (
                <div
                  key={res.id}
                  className="p-4 bg-white border border-border rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-gray-300 transition-colors"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="p-2 rounded bg-muted text-primary shrink-0 mt-0.5">
                      {res.type === 'YOUTUBE' ? (
                        <PlayCircle className="w-4 h-4" />
                      ) : res.type === 'GITHUB' ? (
                        <Code2 className="w-4 h-4" />
                      ) : (
                        <FileText className="w-4 h-4" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 text-[11px] text-secondary">
                        <span className="font-semibold uppercase">{res.provider || res.type}</span>
                        {res.duration && <span>• {res.duration}</span>}
                      </div>
                      <a
                        href={res.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-semibold text-primary hover:underline flex items-center gap-1 mt-0.5 group"
                      >
                        <span className="truncate">{res.title}</span>
                        <ExternalLink className="w-3.5 h-3.5 text-secondary group-hover:text-primary shrink-0" />
                      </a>
                    </div>
                  </div>

                  <button
                    onClick={() => handleUpdateStatus(res.id, isDone ? 'NOT_STARTED' : 'COMPLETED')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0 self-end sm:self-center ${
                      isDone
                        ? 'bg-success-light text-success border border-success/20'
                        : 'bg-muted text-secondary hover:bg-primary hover:text-white'
                    }`}
                  >
                    {isDone ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                      </>
                    ) : (
                      <>
                        <Circle className="w-3.5 h-3.5" /> Mark Completed
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <Card className="py-6 text-center">
            <p className="text-xs text-secondary">No specific resources mapped to this skill yet.</p>
          </Card>
        )}
      </div>
    </div>
  );
}
